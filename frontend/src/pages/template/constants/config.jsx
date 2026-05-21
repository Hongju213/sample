import React from 'react';

// =====================================================
// 1. UI.GridColumnBuilder
// =====================================================

class GridColumnBuilder {
  constructor() {
    this.config = {
      sortable: true,
      resizable: true,
      filter: true,
      minWidth: 90
    };
  }

  HeaderName(name) {
    this.config.headerName = name;
    return this;
  }

  Field(field) {
    this.config.field = field;
    return this;
  }

  CellRenderer(renderer) {
    this.config.cellRenderer = renderer;
    return this;
  }

  CellRendererParams(params) {
    this.config.cellRendererParams = params;
    return this;
  }

  MaxWidth(width) {
    this.config.maxWidth = width;
    return this;
  }

  CellAlignCenter() {
    this.config.cellClass = 'ag-cell-align-center';
    return this;
  }

  build() {
    return this.config;
  }
}

export const UI = {
  GridColumnBuilder
};

// =====================================================
// 2. Constants
// =====================================================

export const MODE = {
  CREATE: 'create',
  EDIT: 'edit',
  VIEW: 'view'
};

export const DEFAULT_PAGE_SIZE = 20;

export const INITIAL_QUERY_PARAMS = {
  page: 1,
  size: DEFAULT_PAGE_SIZE
};

export const INITIAL_LIST = {
  content: [],
  currentPage: 1,
  pages: 0,
  totalCount: 0,
  pageSize: DEFAULT_PAGE_SIZE
};

export const INITIAL_MODAL_STATE = {
  open: false,
  mode: MODE.CREATE,
  data: null
};

// =====================================================
// 3. Grid Column Renderers
// =====================================================

function StatusRenderer(params) {
  const status = params.value;
  let label = '사용(Y)';
  let className = 'status-tag status-done';

  if (status === 'TODO') {
    label = '미사용(N)';
    className = 'status-tag status-todo';
  }

  return <span className={className}>{label}</span>;
}

// =====================================================
// 4. getTemplateColumnDefs
// =====================================================

export const getTemplateColumnDefs = () => {
  return [
    new UI.GridColumnBuilder()
      .HeaderName('ID')
      .Field('id')
      .MaxWidth(100)
      .CellAlignCenter()
      .build(),
    new UI.GridColumnBuilder()
      .HeaderName('제목 (NAME)')
      .Field('title')
      .build(),
    new UI.GridColumnBuilder()
      .HeaderName('설명 (DESCRIPTION)')
      .Field('description')
      .build(),
    new UI.GridColumnBuilder()
      .HeaderName('상태 (useYn)')
      .Field('status')
      .CellAlignCenter()
      .MaxWidth(120)
      .CellRenderer(StatusRenderer)
      .build()
  ];
};
