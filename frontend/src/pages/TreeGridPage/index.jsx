import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';
import { TreeGrid } from './components/TreeGrid.jsx';
import { TreeGridSearch } from './components/TreeGridSearch.jsx';
import { TreePanel } from './components/TreePanel.jsx';
import { applyDropToRow, toAntTreeData, toGridList } from './components/treeGridUtils.js';
import {
  DEFAULT_PAGE_SIZE,
  INITIAL_LIST,
  INITIAL_QUERY_PARAMS
} from './constants/index.js';
import { useGridItemsQuery, useTreeNodesQuery } from './api/index.js';
import './style.scss';

const { Title } = Typography;

function TreeGridPage({ embedded = false, pageInfo }) {
  // States
  const [selectedKey, setSelectedKey] = useState(null);
  const [queryParams, setQueryParams] = useState(INITIAL_QUERY_PARAMS);
  const [refreshKey, setRefreshKey] = useState(0);
  const [list, setList] = useState(INITIAL_LIST);

  // Query
  const {
    data: treeNodes = [],
    isLoading: isTreeLoading,
    error: isTreeError
  } = useTreeNodesQuery({}, { refreshKey });

  const {
    data: gridData,
    isLoading: isGridLoading,
    isFetching: isGridFetching,
    error: isGridError
  } = useGridItemsQuery({ ...queryParams, nodeKey: selectedKey }, { refreshKey });

  // Hooks
  useEffect(() => {
    if (!selectedKey) {
      setList(INITIAL_LIST);
      return;
    }

    setList(toGridList(gridData, DEFAULT_PAGE_SIZE));
  }, [gridData, selectedKey]);

  useEffect(() => {
    if (pageInfo?.refresh) {
      setRefreshKey(prev => prev + 1);
    }
  }, [pageInfo?.refresh]);

  const treeData = useMemo(() => toAntTreeData(treeNodes), [treeNodes]);

  // Handlers
  const handleReset = useCallback(() => {
    setQueryParams(INITIAL_QUERY_PARAMS);
  }, []);

  const handleSearch = useCallback(values => {
    setQueryParams(prev => ({
      ...prev,
      ...values,
      page: 1
    }));
  }, []);

  const handleSelectNode = useCallback(nodeKey => {
    setSelectedKey(nodeKey);
    setQueryParams(prev => ({
      ...prev,
      page: 1
    }));
  }, []);

  const handleChangePaging = useCallback(paging => {
    setQueryParams(prev => ({
      ...prev,
      ...paging
    }));
  }, []);

  const handleApplyDrop = useCallback((rowId, field, dragData) => {
    setList(prev => ({
      ...prev,
      content: prev.content.map(row => (String(row.id) === String(rowId) ? applyDropToRow(row, field, dragData) : row))
    }));
  }, []);

  // Element
  return (
    <div className={embedded ? 'tree-grid-page tree-grid-page--embedded' : 'tree-grid-page'}>
      {!embedded && (
        <Title level={4} className="tree-grid-title">
          Tree Grid
        </Title>
      )}

      <TreeGridSearch onSearch={handleSearch} onReset={handleReset} refreshKey={refreshKey} />

      <div className="tree-grid-layout">
        <TreePanel
          treeData={treeData}
          selectedKey={selectedKey}
          loading={isTreeLoading}
          error={isTreeError}
          onSelectNode={handleSelectNode}
        />
        <TreeGrid
          selectedKey={selectedKey}
          list={list}
          loading={isGridLoading}
          fetching={isGridFetching}
          error={isGridError}
          onChangePaging={handleChangePaging}
          onApplyDrop={handleApplyDrop}
        />
      </div>
    </div>
  );
}

TreeGridPage.propTypes = {
  embedded: PropTypes.bool,
  pageInfo: PropTypes.object
};

export default TreeGridPage;
