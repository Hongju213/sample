import React from 'react';
import { App, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchGridItems, fetchTreeNodes } from '../../apis/treeGridApi.js';
import TreeGridPanel from './TreeGridPanel.jsx';
import TreePanel from './TreePanel.jsx';
import { applyDropToRow, DEFAULT_PAGE_SIZE, MODE, toAntTreeData, toGridList } from './treeGridUtils.js';
import './TreeGridPage.css';

const { Title } = Typography;

export default function TreeGridPage() {
  const { message } = App.useApp();
  const [selectedKey, setSelectedKey] = useState(null);
  const [queryParams, setQueryParams] = useState({
    page: 1,
    size: DEFAULT_PAGE_SIZE
  });
  const [list, setList] = useState({
    content: [],
    currentPage: 1,
    pages: 0,
    totalCount: 0,
    pageSize: DEFAULT_PAGE_SIZE
  });

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
    queryKey: ['gridItems', selectedKey, queryParams],
    queryFn: () => fetchGridItems({ nodeKey: selectedKey, ...queryParams, page: queryParams.page - 1 }),
    enabled: Boolean(selectedKey),
    staleTime: 60_000
  });

  useEffect(() => {
    if (!selectedKey) {
      setList(prev => ({ ...prev, content: [], currentPage: 1, pages: 0, totalCount: 0 }));
      return;
    }

    setList(toGridList(gridPage, DEFAULT_PAGE_SIZE));
  }, [gridPage, selectedKey]);

  const treeData = useMemo(() => toAntTreeData(treeNodes), [treeNodes]);

  const handleSelectNode = useCallback(nodeKey => {
    setSelectedKey(nodeKey);
    setQueryParams(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleChangePaging = useCallback(next => {
    setQueryParams(prev => ({
      ...prev,
      page: next.page ?? prev.page,
      size: next.size ?? prev.size
    }));
  }, []);

  const handleEditItem = useCallback(
    (item, state = { mode: MODE.EDIT }) => {
      if (state.mode === MODE.CREATE) {
        if (!selectedKey) {
          message.warning('트리를 먼저 선택하세요.');
          return;
        }

        const nextId = Math.max(0, ...list.content.map(row => Number(row.id))) + 1;
        setList(prev => ({
          ...prev,
          content: [
            {
              id: nextId,
              nodeKey: selectedKey,
              col1: '',
              col2: '',
              col3: '',
              col4: '',
              col5: '',
              path: ''
            },
            ...prev.content
          ],
          totalCount: prev.totalCount + 1
        }));
        message.success('신규 행을 추가했습니다.');
        return;
      }

      message.info(item ? `선택한 행 ID: ${item.id}` : '선택한 행이 없습니다.');
    },
    [list.content, message, selectedKey]
  );

  const handleDeleteItem = useCallback(
    item => {
      if (!item) {
        message.warning('삭제할 행을 선택하세요.');
        return;
      }

      setList(prev => ({
        ...prev,
        content: prev.content.filter(row => row.id !== item.id),
        totalCount: Math.max(prev.totalCount - 1, 0)
      }));
      message.success('선택한 행을 삭제했습니다.');
    },
    [message]
  );

  const handleApplyDrop = useCallback((rowId, field, dragData) => {
    setList(prev => ({
      ...prev,
      content: prev.content.map(row => (row.id === rowId ? applyDropToRow(row, field, dragData) : row))
    }));
  }, []);

  const handleUpdateCell = useCallback((rowId, field, value) => {
    setList(prev => ({
      ...prev,
      content: prev.content.map(row => (row.id === rowId ? { ...row, [field]: value } : row))
    }));
  }, []);

  return (
    <div className="tree-grid-page">
      <Title level={4} className="tree-grid-title">
        Tree + Grid
      </Title>

      <div className="tree-grid-layout">
        <TreePanel
          treeData={treeData}
          selectedKey={selectedKey}
          loading={treeLoading}
          error={treeError}
          onSelectNode={handleSelectNode}
        />

        <TreeGridPanel
          selectedKey={selectedKey}
          list={list}
          loading={gridLoading}
          fetching={gridFetching}
          onChangePaging={handleChangePaging}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onApplyDrop={handleApplyDrop}
          onUpdateCell={handleUpdateCell}
        />
      </div>
    </div>
  );
}
