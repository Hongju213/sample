import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Empty, Space, Spin, Tag } from 'antd';
import Grid from '../../../components/Grid.jsx';
import { DROP_FIELDS } from '../constants/index.js';
import {
  allowDrop,
  clearDragOver,
  getGridDropTarget,
  isEventInContainer,
  markDragOver,
  readTreeDragData
} from './treeGridUtils.js';

function TextDropRenderer(params) {
  return (
    <div className="drop-cell">
      {params.value}
    </div>
  );
}

export function TreeGrid({
  selectedKey,
  list,
  loading,
  fetching,
  error,
  onChangePaging,
  onApplyDrop
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const gridApiRef = useRef(null);
  const gridContainerRef = useRef(null);

  const gridColumnDefs = useMemo(
    () => [
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
        width: 120,
        flex: 1,
        filter: 'agTextColumnFilter',
        cellRenderer: TextDropRenderer
      }))
    ],
    []
  );

  const handleClickRow = event => {
    setSelectedItem(event.data);
    event.node?.setSelected(true);
  };

  const handleChangePageSize = size => {
    onChangePaging({ size, page: 1 });
  };

  const handleChangeCurrentPage = page => {
    onChangePaging({ page });
  };

  useEffect(() => {
    setSelectedItem(null);
  }, [selectedKey]);

  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) {
      return undefined;
    }

    const handleDragOver = event => {
      if (!isEventInContainer(container, event)) {
        clearDragOver(container);
        return;
      }

      allowDrop(event);
      markDragOver(container, getGridDropTarget(container, event, gridApiRef.current, list.content));
    };

    const handleDragLeave = event => {
      if (isEventInContainer(container, event)) {
        return;
      }

      clearDragOver(container);
    };

    const handleDrop = event => {
      if (!isEventInContainer(container, event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const dragData = readTreeDragData(event);
      const target = getGridDropTarget(container, event, gridApiRef.current, list.content);
      clearDragOver(container);

      if (!dragData || !target) {
        return;
      }

      onApplyDrop(target.rowId, target.field, dragData);
    };

    document.addEventListener('dragenter', handleDragOver, true);
    document.addEventListener('dragover', handleDragOver, true);
    document.addEventListener('dragleave', handleDragLeave, true);
    document.addEventListener('drop', handleDrop, true);

    return () => {
      document.removeEventListener('dragenter', handleDragOver, true);
      document.removeEventListener('dragover', handleDragOver, true);
      document.removeEventListener('dragleave', handleDragLeave, true);
      document.removeEventListener('drop', handleDrop, true);
      clearDragOver(container);
    };
  }, [list.content, onApplyDrop]);

  return (
    <section className="grid-panel">
      <div className="grid-panel-header">
        <Space>
          <span>{selectedKey ? `[${selectedKey}] 데이터` : '노드를 선택하세요'}</span>
          {selectedKey && !loading && <Tag color="blue">총 {list.totalCount}</Tag>}
          {selectedItem && <Tag>선택 ID {selectedItem.id}</Tag>}
          {fetching && <Spin size="small" />}
        </Space>
      </div>

      {!selectedKey ? (
        <div className="grid-empty">
          <Empty description="Tree 노드를 선택하면 Grid 데이터를 조회합니다." />
        </div>
      ) : (
        <div ref={gridContainerRef} className="treegrid-grid">
          <Grid
            list={list.content}
            loading={loading && list.content.length === 0}
            error={error}
            columnDefs={gridColumnDefs}
            gridOptions={{
              defaultColDef: { sortable: true, resizable: true, filter: false },
              onGridReady: event => {
                gridApiRef.current = event.api;
              }
            }}
            onClicked={handleClickRow}
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
