import React from 'react';
import { Alert, Card, Space, Spin, Tag, Tree, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchGridItems, fetchTreeNodes } from '../../apis/treeGridApi.js';
import './TreeGridPage.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const { Title } = Typography;

const PAGE_SIZE = 10;
const TREE_NODE_MIME = 'application/x-tree-node';
const DROP_FIELDS = ['col1', 'col2', 'col3', 'col4', 'col5'];

function toAntTreeData(nodes) {
  return nodes.map(node => ({
    key: node.nodeKey,
    title: node.nodeName,
    children: node.children?.length ? toAntTreeData(node.children) : undefined
  }));
}

function readTreeDragData(event) {
  const raw = event.dataTransfer.getData(TREE_NODE_MIME);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function appendPath(path, nodeName) {
  const currentPath = (path ?? '').replace(/\/+$/g, '');
  const nextSegment = nodeName.replace(/^\/+|\/+$/g, '');
  return `${currentPath}/${nextSegment}`;
}

function applyDropToRow(row, field, dragData) {
  if (field === 'path') {
    return { ...row, path: appendPath(row.path, dragData.nodeName) };
  }

  if (field === 'row') {
    return {
      ...row,
      ...Object.fromEntries(DROP_FIELDS.map(dropField => [dropField, dragData.nodeName])),
      path: appendPath(row.path, dragData.nodeName)
    };
  }

  return { ...row, [field]: dragData.nodeName };
}

function allowDrop(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
}

function useGridDrop(params, field) {
  return useCallback(
    event => {
      event.preventDefault();
      event.stopPropagation();

      const dragData = readTreeDragData(event);
      if (!dragData || !params.data || !params.applyDrop) {
        return;
      }

      params.applyDrop(params.data.id, field, dragData);
    },
    [field, params]
  );
}

function RowDropRenderer(params) {
  const handleDrop = useGridDrop(params, 'row');

  return (
    <label className="row-drop-cell" onDragOver={allowDrop} onDrop={handleDrop}>
      <input
        type="checkbox"
        checked={params.node.isSelected()}
        onChange={event => params.node.setSelected(event.target.checked)}
      />
    </label>
  );
}

function TextDropRenderer(params) {
  const field = params.colDef?.field;
  const handleDrop = useGridDrop(params, field);

  return (
    <div className="drop-cell" onDragOver={allowDrop} onDrop={handleDrop}>
      {params.value}
    </div>
  );
}

function PathDropRenderer(params) {
  const value = params.value ?? '';
  const handleDrop = useGridDrop(params, 'path');

  return (
    <input
      className="path-input"
      value={value}
      onChange={event => params.updateCell?.(params.data.id, 'path', event.target.value)}
      onDragOver={allowDrop}
      onDrop={handleDrop}
    />
  );
}

export default function TreeGridPage() {
  const [selectedKey, setSelectedKey] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [gridRows, setGridRows] = useState([]);

  const {
    data: treeNodes = [],
    isLoading: treeLoading,
    error: treeError
  } = useQuery({
    queryKey: ['treeNodes'],
    queryFn: fetchTreeNodes,
    staleTime: 300_000
  });

  const {
    data: gridPage,
    isLoading: gridLoading,
    isFetching: gridFetching
  } = useQuery({
    queryKey: ['gridItems', selectedKey, currentPage],
    queryFn: () => fetchGridItems({ nodeKey: selectedKey, page: currentPage, size: PAGE_SIZE }),
    enabled: Boolean(selectedKey),
    staleTime: 60_000
  });

  useEffect(() => {
    setGridRows((gridPage?.content ?? []).map(row => ({ ...row, path: row.path ?? '' })));
  }, [gridPage]);

  const treeData = useMemo(() => toAntTreeData(treeNodes), [treeNodes]);

  const applyGridDrop = useCallback((rowId, field, dragData) => {
    setGridRows(rows =>
      rows.map(row => (row.id === rowId ? applyDropToRow(row, field, dragData) : row))
    );
  }, []);

  const updateGridCell = useCallback((rowId, field, value) => {
    setGridRows(rows => rows.map(row => (row.id === rowId ? { ...row, [field]: value } : row)));
  }, []);

  const rendererParams = useMemo(
    () => ({
      applyDrop: applyGridDrop,
      updateCell: updateGridCell
    }),
    [applyGridDrop, updateGridCell]
  );

  const columnDefs = useMemo(
    () => [
      {
        colId: 'rowDrop',
        headerName: '',
        width: 48,
        pinned: 'left',
        resizable: false,
        sortable: false,
        filter: false,
        cellRenderer: RowDropRenderer,
        cellRendererParams: rendererParams
      },
      {
        headerName: 'No',
        valueGetter: params => (params.node?.rowIndex ?? 0) + 1,
        width: 64,
        pinned: 'left',
        sortable: false,
        filter: false
      },
      { field: 'id', headerName: 'ID', width: 80, filter: 'agNumberColumnFilter' },
      { field: 'nodeKey', headerName: 'Node Key', width: 120, filter: 'agTextColumnFilter' },
      ...DROP_FIELDS.map(field => ({
        field,
        headerName: field.toUpperCase(),
        width: 110,
        flex: 1,
        filter: 'agTextColumnFilter',
        cellRenderer: TextDropRenderer,
        cellRendererParams: rendererParams
      })),
      {
        field: 'path',
        headerName: 'Path',
        minWidth: 220,
        flex: 1.4,
        sortable: false,
        filter: false,
        cellRenderer: PathDropRenderer,
        cellRendererParams: rendererParams
      }
    ],
    [rendererParams]
  );

  const totalElements = gridPage?.totalElements ?? 0;
  const totalPages = gridPage?.totalPages ?? 0;

  const handleSelect = useCallback(keys => {
    setSelectedKey(keys.length > 0 ? String(keys[0]) : null);
    setCurrentPage(0);
  }, []);

  const handleTreeDragStart = useCallback(({ event, node }) => {
    const dragData = {
      nodeKey: String(node.key),
      nodeName: String(node.title)
    };

    event.dataTransfer.setData(TREE_NODE_MIME, JSON.stringify(dragData));
    event.dataTransfer.setData('text/plain', dragData.nodeName);
    event.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleGridReady = useCallback(event => {
    event.api.sizeColumnsToFit();
  }, []);

  return (
    <div className="tree-grid-page">
      <Title level={4} className="tree-grid-title">
        Tree + Grid
      </Title>

      <div className="tree-grid-layout">
        <Card title="Tree" size="small" className="tree-panel">
          {treeError && <Alert type="error" message="Tree data could not be loaded." showIcon />}
          {treeLoading ? (
            <Spin className="panel-spinner" />
          ) : (
            <Tree
              treeData={treeData}
              defaultExpandAll
              draggable
              blockNode
              selectedKeys={selectedKey ? [selectedKey] : []}
              onSelect={handleSelect}
              onDragStart={handleTreeDragStart}
              className="node-tree"
            />
          )}
        </Card>

        <section className="grid-panel">
          <div className="grid-panel-header">
            <Space>
              <span>{selectedKey ? `[${selectedKey}] Data` : 'Select a node'}</span>
              {selectedKey && !gridLoading && <Tag color="blue">Total {totalElements}</Tag>}
              {gridFetching && <Spin size="small" />}
            </Space>
          </div>

          {!selectedKey ? (
            <div className="grid-empty">Select a node from the tree to load grid rows.</div>
          ) : (
            <>
              <div className="treegrid-grid">
                <AgGridReact
                  rowData={gridRows}
                  loading={gridLoading && gridRows.length === 0}
                  columnDefs={columnDefs}
                  defaultColDef={{ sortable: true, resizable: true }}
                  rowSelection={{ mode: 'singleRow', checkboxes: false, enableClickSelection: true }}
                  getRowId={params => String(params.data.id)}
                  onGridReady={handleGridReady}
                  overlayNoRowsTemplate="<span style='color:#999'>No rows for this node.</span>"
                />
              </div>

              {totalPages > 1 && (
                <div className="grid-pagination">
                  <button
                    className="pg-btn"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(page => page - 1)}
                  >
                    Prev
                  </button>
                  <span className="pg-info">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    className="pg-btn"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(page => page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
