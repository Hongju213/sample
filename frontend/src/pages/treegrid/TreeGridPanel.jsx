import React from 'react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty, Popconfirm, Space, Spin, Tag } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Grid from '../../components/Grid.jsx';
import { DROP_FIELDS, MODE, readTreeDragData } from './treeGridUtils.js';

function allowDrop(event) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy';
  }
}

function isPointInRect(event, rect) {
  return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
}

function getPointedElement(elements, event) {
  return elements.find(element => isPointInRect(event, element.getBoundingClientRect()));
}

function isEventInContainer(container, event) {
  return isPointInRect(event, container.getBoundingClientRect());
}

function getGridDropTarget(container, event, gridApi, rows) {
  const row = getPointedElement(Array.from(container.querySelectorAll('.ag-row[row-index]')), event);

  if (!row) {
    return null;
  }

  const cell = getPointedElement(Array.from(row.querySelectorAll('.ag-cell[col-id]')), event);
  const colId = cell?.getAttribute('col-id');
  const rowIndex = Number(row.getAttribute('row-index'));
  const rowData = Number.isFinite(rowIndex) ? gridApi?.getDisplayedRowAtIndex(rowIndex)?.data : null;
  const fallbackData = Number.isFinite(rowIndex) ? rows[rowIndex] : null;
  const rowId = rowData?.id ?? fallbackData?.id;

  if (rowId == null) {
    return null;
  }

  const rowSelector = `.ag-row[row-index="${rowIndex}"]`;
  const rowElements = Array.from(container.querySelectorAll(rowSelector));

  if (colId === 'rowDrop') {
    return { cell, rowElements, rowId, field: 'row' };
  }

  if (DROP_FIELDS.includes(colId) || colId === 'path') {
    return { cell, rowElements, rowId, field: colId };
  }

  return null;
}

function clearDragOver(container) {
  container
    ?.querySelectorAll?.('.is-drag-over-row, .is-drag-over-cell')
    .forEach(element => {
      element.classList.remove('is-drag-over-row', 'is-drag-over-cell');
    });
}

function markDragOver(container, target) {
  clearDragOver(container);
  target?.rowElements?.forEach(row => row.classList.add('is-drag-over-row'));
  target?.cell?.classList.add('is-drag-over-cell');
}

function RowDropRenderer(params) {
  return (
    <label className="row-drop-cell">
      <input
        type="checkbox"
        checked={params.node.isSelected()}
        onChange={event => params.node.setSelected(event.target.checked)}
      />
    </label>
  );
}

function TextDropRenderer(params) {
  return (
    <div className="drop-cell">
      {params.value}
    </div>
  );
}

function PathDropRenderer(params) {
  const value = params.value ?? '';

  return (
    <input
      className="path-input"
      value={value}
      onChange={event => params.updateCell?.(params.data.id, 'path', event.target.value)}
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
  const gridApiRef = useRef(null);
  const gridContainerRef = useRef(null);

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
        <div ref={gridContainerRef} className="treegrid-grid">
          <Grid
            list={list.content}
            loading={loading && list.content.length === 0}
            columnDefs={gridColumnDefs}
            gridOptions={{
              defaultColDef: { sortable: true, resizable: true, filter: false },
              onGridReady: event => {
                gridApiRef.current = event.api;
              }
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
