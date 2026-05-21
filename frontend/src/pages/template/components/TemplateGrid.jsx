import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Modal, Space } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import Grid from '../../../components/Grid.jsx';
import { queryKeys } from '../../../constants/queryKeys.js';
import { getTemplateColumnDefs, MODE } from '../constants/config.jsx';
import { useTemplateDelete } from '../api/templateApi.js';

export function TemplateGrid({
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
  const queryClient = useQueryClient();
  const { mutate: deleteMutate, isPending: isDeleting } = useTemplateDelete();

  const gridColumnDefs = useMemo(() => getTemplateColumnDefs(), []);

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
      content: '선택한 항목을 삭제하시겠습니까?',
      okText: '삭제',
      cancelText: '취소',
      okButtonProps: { danger: true },
      onOk: handleDeleteOk
    });
  };

  const handleDeleteOk = () => {
    deleteMutate(selectedItem.id, {
      onSuccess: () => {
        message.success('삭제되었습니다.');
        setSelectedItem(null);
        queryClient.invalidateQueries({ queryKey: [queryKeys.templateList] });
      },
      onError: () => {
        message.error('삭제에 실패했습니다.');
      }
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
              type={isEditableMode ? 'primary' : 'default'}
              icon={<EditOutlined />}
              onClick={() => setEditableMode(prev => !prev)}
            >
              {isEditableMode ? '편집 중' : '수정'}
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
        list={list.content}
        columnDefs={gridColumnDefs}
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
