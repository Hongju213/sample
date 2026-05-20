import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Modal, Space, Tag } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import Grid from '../../../components/Grid.jsx';
import { queryKeys } from '../../../constants/queryKeys.js';
import { formatDateTime, statusColor, statusLabels } from '../../../utils/format.js';
import { MODE } from '../constants/index.js';
import { useSampleDelete } from '../api/index.js';

function CodeRenderer(params) {
  const value = params.value;

  if (!value) {
    return null;
  }

  return <Tag color={statusColor(value)}>{statusLabels[value] ?? value}</Tag>;
}

export function SampleGrid({
  list,
  loading,
  error,
  onEditItem,
  onChangePaging,
  refreshKey
}) {
  const { message } = App.useApp();
  const [isEditableMode, setEditableMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const gridRef = useRef(null);
  const editButtonRef = useRef(null);
  const queryClient = useQueryClient();
  const { mutate: deleteMutate, isPending: isDeleting } = useSampleDelete();

  const gridColumnDefs = useMemo(
    () => [
      {
        headerName: 'No',
        valueGetter: params => (params.node?.rowIndex ?? 0) + 1,
        width: 70,
        pinned: 'left',
        sortable: false,
        filter: false
      },
      { field: 'id', headerName: 'ID', width: 90, filter: 'agNumberColumnFilter' },
      { field: 'title', headerName: '제목', flex: 1.3, minWidth: 180, tooltipField: 'title' },
      {
        field: 'description',
        headerName: '설명',
        flex: 1.7,
        minWidth: 220,
        valueFormatter: params => params.value || '-'
      },
      {
        field: 'status',
        headerName: '상태',
        width: 110,
        cellRenderer: 'codeRenderer'
      },
      {
        field: 'updatedAt',
        headerName: '수정일시',
        width: 160,
        valueFormatter: params => formatDateTime(params.value)
      },
      {
        headerName: '작업',
        width: 96,
        sortable: false,
        filter: false,
        cellRenderer: params => (
          <Button
            size="small"
            icon={<EditOutlined />}
            disabled={!isEditableMode}
            onClick={() => onEditItem(params.data, { mode: MODE.EDIT })}
          />
        )
      }
    ],
    [isEditableMode, onEditItem]
  );

  useEffect(() => {
    setSelectedItem(null);
    gridRef.current?.api?.deselectAll();
  }, [refreshKey]);

  const handleClickRow = event => {
    setSelectedItem(event.data);
    event.node?.setSelected(true);
  };

  const handleDoubleClickedRow = event => {
    onEditItem(event.data, { mode: isEditableMode ? MODE.EDIT : MODE.VIEW });
  };

  const handleDeleteClick = () => {
    if (!selectedItem) {
      message.warning('삭제할 행을 선택하세요.');
      return;
    }

    Modal.confirm({
      title: '삭제 확인',
      content: '선택한 샘플 항목을 삭제하시겠습니까?',
      okText: '삭제',
      cancelText: '취소',
      okButtonProps: { danger: true },
      onOk: formOk
    });
  };

  const handleCreateClick = () => {
    onEditItem(null, { mode: MODE.CREATE });
  };

  const handleChangePageSize = size => {
    onChangePaging({ size, page: 1 });
  };

  const handleChangeCurrentPage = page => {
    onChangePaging({ page });
  };

  const formOk = () => {
    deleteMutate(selectedItem.id, {
      onSuccess: () => {
        message.success('삭제되었습니다.');
        setSelectedItem(null);
        queryClient.invalidateQueries({ queryKey: [queryKeys.sampleList] });
      },
      onError: () => {
        message.error('삭제에 실패했습니다.');
      }
    });
  };

  return (
    <>
      <div className="tableHeader">
        <div className="right">
          <Space>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={!isEditableMode || !selectedItem || isDeleting}
              onClick={handleDeleteClick}
            >
              삭제
            </Button>
            <Button
              size="small"
              ref={editButtonRef}
              type={isEditableMode ? 'primary' : 'default'}
              icon={<EditOutlined />}
              onClick={() => setEditableMode(prev => !prev)}
            >
              {isEditableMode ? '편집 중' : '편집'}
            </Button>
            <Button
              size="small"
              type="primary"
              icon={<PlusOutlined />}
              disabled={!isEditableMode}
              onClick={handleCreateClick}
            >
              등록
            </Button>
          </Space>
        </div>
      </div>
      <Grid
        ref={gridRef}
        className="sample-table"
        list={list.content}
        columnDefs={gridColumnDefs}
        gridOptions={{ components: { codeRenderer: CodeRenderer } }}
        loading={loading}
        error={error}
        onClicked={handleClickRow}
        onDoubleClicked={handleDoubleClickedRow}
        currentPage={list.currentPage}
        pages={list.pages}
        totalCount={list.totalCount}
        pageSize={list.pageSize}
        onChangePageSize={handleChangePageSize}
        onChangeCurrentPage={handleChangeCurrentPage}
      />
    </>
  );
}
