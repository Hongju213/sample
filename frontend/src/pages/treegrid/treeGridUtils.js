export const DEFAULT_PAGE_SIZE = 10;
export const TREE_NODE_MIME = 'application/x-tree-node';
export const DROP_FIELDS = ['col1', 'col2', 'col3', 'col4', 'col5'];

export const MODE = {
  CREATE: 'create',
  EDIT: 'edit'
};

export function toAntTreeData(nodes) {
  return nodes.map(node => ({
    key: node.nodeKey,
    title: node.nodeName,
    children: node.children?.length ? toAntTreeData(node.children) : undefined
  }));
}

export function readTreeDragData(event) {
  const raw = event.dataTransfer.getData(TREE_NODE_MIME);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function appendPath(path, nodeName) {
  const currentPath = (path ?? '').replace(/\/+$/g, '');
  const nextSegment = nodeName.replace(/^\/+|\/+$/g, '');
  return `${currentPath}/${nextSegment}`;
}

export function applyDropToRow(row, field, dragData) {
  if (field === 'path') {
    return { ...row, path: appendPath(row.path, dragData.nodeName) };
  }

  if (field === 'row') {
    return {
      ...row,
      ...Object.fromEntries(DROP_FIELDS.map(dropField => [dropField, dragData.nodeName])),
      path: appendPath(row.path, dragData.nodeName)
    };
  }

  return { ...row, [field]: dragData.nodeName };
}

export function toGridList(page, fallbackPageSize = DEFAULT_PAGE_SIZE) {
  return {
    content: (page?.content ?? []).map(row => ({ ...row, path: row.path ?? '' })),
    currentPage: (page?.number ?? 0) + 1,
    pages: page?.totalPages || 0,
    totalCount: page?.totalElements || 0,
    pageSize: page?.size || fallbackPageSize
  };
}
