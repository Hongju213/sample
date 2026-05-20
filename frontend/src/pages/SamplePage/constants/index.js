export const DEFAULT_PAGE_SIZE = 10;

export const MODE = {
  CREATE: 'create',
  EDIT: 'edit',
  VIEW: 'view'
};

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

export const INITIAL_ITEM_MODAL_STATE = {
  open: false,
  mode: MODE.CREATE,
  data: null
};
