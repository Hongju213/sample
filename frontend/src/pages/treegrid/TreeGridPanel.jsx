import React from 'react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty, Popconfirm, Space, Spin, Tag } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import Grid from '../../components/Grid.jsx';
import { DROP_FIELDS, MODE, readTreeDragData } from './treeGridUtils.js';

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

export default function TreeGridPanel({
  selectedKey,
  list,
  loading,
  fetching,
  onChangePaging,
  onEditItem,
  onDeleteItem,
  onApplyDrop,
  onUpdateCell
}) {
  const [selectedItem, setSelectedItem] = useState(null);

  const rendererParams = useMemo(
    () => ({
      applyDrop: onApplyDrop,
      updateCell: onUpdateCell
    }),
    [onApplyDrop, onUpdateCell]
  );

  const gridColumnDefs = useMemo(
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

  const handleClickRow = (data, node) => {
    setSelectedItem(data);
    node?.setSelected(true);
  };

  const handleDeleteClick = () => {
    if (!selectedItem) {
      return;
    }

    onDeleteItem(selectedItem);
    setSelectedItem(null);
  };

  const handleCreateClick = () => {
    onEditItem(null, { mode: MODE.CREATE });
  };

  const handleChangePageSize = value => {
    onChangePaging({ size: value, page: 1 });
  };

  const handleChangeCurrentPage = pageNum => {
    onChangePaging({ page: pageNum });
  };

  return (
    <section className="grid-panel">
      <div className="grid-panel-header">
        <Space>
          <span>{selectedKey ? `[${selectedKey}] Data` : 'Select a node'}</span>
          {selectedKey && !loading && <Tag color="blue">Total {list.totalCount}</Tag>}
          {fetching && <Spin size="small" />}
        </Space>
        <Space>
          <Button size="small" type="primary" icon={<PlusOutlined />} disabled={!selectedKey} onClick={handleCreateClick}>
            신규
          </Button>
          <Popconfirm title="삭제하시겠습니까?" onConfirm={handleDeleteClick} disabled={!selectedItem}>
            <Button size="small" danger icon={<DeleteOutlined />} disabled={!selectedItem}>
              삭제
            </Button>
          </Popconfirm>
        </Space>
      </div>

      {!selectedKey ? (
        <div className="grid-empty">
          <Empty description="트리를 선택하면 그리드가 조회됩니다." />
        </div>
      ) : (
        <div className="treegrid-grid">
          <Grid
            list={list.content}
            loading={loading && list.content.length === 0}
            columnDefs={gridColumnDefs}
            gridOptions={{
              defaultColDef: { sortable: true, resizable: true, filter: false }
            }}
            onClicked={event => handleClickRow(event.data, event.node)}
            currentPage={list.currentPage}
            pages={list.pages}
            totalCount={list.totalCount}
            pageSize={list.pageSize}
            onChangePageSize={handleChangePageSize}
            onChangeCurrentPage={handleChangeCurrentPage}
          />
        </div>
      )}
    </section>
  );
}
