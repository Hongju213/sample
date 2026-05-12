import React from 'react';
import { Alert, Card, Space, Spin, Tag, Tree, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { useCallback, useEffect, useMemo, useState } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { fetchGridItems, fetchTreeNodes } from '../../apis/treeGridApi.js';
import './TreeGridPage.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const { Title } = Typography;

const PAGE_SIZE = 10;
const TREE_NODE_MIME = 'application/x-tree-node';
const TEXT_FIELDS = ['nodeKey', 'col1', 'col2', 'col3', 'col4', 'col5'];

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
      ...Object.fromEntries(TEXT_FIELDS.map(textField => [textField, dragData.nodeName])),
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

      if (!dragData || !params.data) {
        return;
      }

      params.context.applyDrop(params.data.id, field, dragData);
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
      onChange={event => params.context.updateCell(params.data.id, 'path', event.target.value)}
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

  // AG Grid cellRenderer에서 직접 React state setter를 부르지 않도록 context로 얇게 전달한다.
  // 드롭 규칙이 바뀌어도 이 객체의 applyDrop/updateCell 두 함수만 따라가면 된다.
  const gridContext = useMemo(
    () => ({
      applyDrop: (rowId, field, dragData) => {
        setGridRows(rows =>
          rows.map(row => (row.id === rowId ? applyDropToRow(row, field, dragData) : row))
        );
      },
      updateCell: (rowId, field, value) => {
        setGridRows(rows => rows.map(row => (row.id === rowId ? { ...row, [field]: value } : row)));
      }
    }),
    []
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
        cellRenderer: RowDropRenderer
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
      ...TEXT_FIELDS.map(field => ({
        field,
        headerName: field === 'nodeKey' ? 'Node Key' : field.toUpperCase(),
        width: field === 'nodeKey' ? 120 : 110,
        flex: field.startsWith('col') ? 1 : undefined,
        filter: 'agTextColumnFilter',
        cellRenderer: TextDropRenderer
      })),
      {
        field: 'path',
        headerName: 'Path',
        minWidth: 220,
        flex: 1.4,
        sortable: false,
        filter: false,
        cellRenderer: PathDropRenderer
      }
    ],
    []
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

    // 브라우저 drag/drop은 문자열만 전달하므로 JSON으로 직렬화한다.
    // text/plain도 같이 넣어두면 디버깅과 브라우저 기본 동작 확인이 쉽다.
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
        트리 + 그리드
      </Title>

      <div className="tree-grid-layout">
        <Card title="트리" size="small" className="tree-panel">
          {treeError && <Alert type="error" message="트리 데이터를 불러오지 못했습니다." showIcon />}
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

        <Card
          size="small"
          className="grid-panel"
          title={
            <Space>
              <span>{selectedKey ? `[${selectedKey}] 데이터` : '노드를 선택하세요'}</span>
              {selectedKey && !gridLoading && <Tag color="blue">총 {totalElements}건</Tag>}
              {gridFetching && <Spin size="small" />}
            </Space>
          }
        >
          {!selectedKey ? (
            <div className="grid-empty">왼쪽 트리에서 노드를 선택하면 데이터가 조회됩니다.</div>
          ) : (
            <>
              <div className="ag-theme-quartz treegrid-grid">
                <AgGridReact
                  rowData={gridRows}
                  loading={gridLoading && gridRows.length === 0}
                  columnDefs={columnDefs}
                  defaultColDef={{ sortable: true, resizable: true }}
                  rowSelection={{ mode: 'singleRow', checkboxes: false, enableClickSelection: true }}
                  getRowId={params => String(params.data.id)}
                  context={gridContext}
                  onGridReady={handleGridReady}
                  overlayNoRowsTemplate="<span style='color:#999'>해당 노드의 데이터가 없습니다.</span>"
                />
              </div>

              {totalPages > 1 && (
                <div className="grid-pagination">
                  <button
                    className="pg-btn"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(page => page - 1)}
                  >
                    이전
                  </button>
                  <span className="pg-info">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    className="pg-btn"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(page => page + 1)}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
