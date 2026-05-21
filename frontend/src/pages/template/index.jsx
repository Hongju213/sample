import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';
import { TemplateGrid } from './components/TemplateGrid.jsx';
import { TemplateModal } from './components/TemplateModal.jsx';
import { TemplateSearch } from './components/TemplateSearch.jsx';
import {
  DEFAULT_PAGE_SIZE,
  INITIAL_LIST,
  INITIAL_MODAL_STATE,
  INITIAL_QUERY_PARAMS
} from './constants/config.jsx';
import { useTemplateGridQuery } from './api/templateApi.js';
import './TemplatePage.css';

const { Title } = Typography;

const toListState = data => ({
  content: data?.content || [],
  currentPage: (data?.number ?? 0) + 1,
  pages: data?.totalPages || 0,
  totalCount: data?.totalElements || 0,
  pageSize: data?.size || DEFAULT_PAGE_SIZE
});

function TemplatePage(props) {
  // States
  const [queryParams, setQueryParams] = useState(INITIAL_QUERY_PARAMS);
  const [refreshKey, setRefreshKey] = useState(0);
  const [itemModalState, setItemModalState] = useState(INITIAL_MODAL_STATE);
  const [list, setList] = useState(INITIAL_LIST);

  // Query
  const {
    data: gridData,
    isLoading: isGridLoading,
    isFetching: isGridFetching,
    error: isGridError
  } = useTemplateGridQuery(queryParams, { refreshKey });

  // Hooks
  useEffect(() => {
    setList(toListState(gridData));
  }, [gridData]);

  useEffect(() => {
    if (props.pageInfo?.refresh) {
      setRefreshKey(prev => prev + 1);
    }
  }, [props.pageInfo?.refresh]);

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

  const handleChangePaging = useCallback(paging => {
    setQueryParams(prev => ({
      ...prev,
      ...paging
    }));
  }, []);

  const handleEditItem = useCallback((item, state) => {
    setItemModalState({
      ...state,
      open: true,
      data: item
    });
  }, []);

  const handleItemModalClose = useCallback(() => {
    setItemModalState(prev => ({
      ...prev,
      open: false,
      data: null
    }));
  }, []);

  // Element
  return (
    <div className="template-page">
      <div className="template-page__header">
        <Title level={4} className="template-page__title">
          템플릿 목록
        </Title>
      </div>

      <TemplateSearch onSearch={handleSearch} onReset={handleReset} refreshKey={refreshKey} />
      <TemplateGrid
        list={list}
        loading={(isGridLoading || isGridFetching) && list.content.length === 0}
        error={isGridError}
        onEditItem={handleEditItem}
        onChangePaging={handleChangePaging}
        refreshKey={refreshKey}
      />
      <TemplateModal
        open={itemModalState.open}
        mode={itemModalState.mode}
        data={itemModalState.data}
        onClose={handleItemModalClose}
      />
    </div>
  );
}

TemplatePage.propTypes = {
  pageInfo: PropTypes.object,
  commonCodes: PropTypes.object,
  data: PropTypes.object
};

export default TemplatePage;
