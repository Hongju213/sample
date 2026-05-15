export const DEFAULT_PAGE_SIZE = 10;
export const TREE_NODE_MIME = 'application/x-tree-node';
export const TREE_NODE_TEXT_PREFIX = 'tree-node:';
export const DROP_FIELDS = ['col1', 'col2', 'col3', 'col4', 'col5'];

let currentTreeDragData = null;

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

export function beginTreeDrag(event, dragData) {
  currentTreeDragData = dragData;

  if (!event.dataTransfer) {
    return;
  }

  const encoded = JSON.stringify(dragData);
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData(TREE_NODE_MIME, encoded);
  event.dataTransfer.setData('application/json', encoded);
  event.dataTransfer.setData('text/plain', `${TREE_NODE_TEXT_PREFIX}${encoded}`);
}

export function endTreeDrag() {
  currentTreeDragData = null;
}

export function readTreeDragData(event) {
  if (!event.dataTransfer) {
    return currentTreeDragData;
  }

  const raw =
    event.dataTransfer.getData(TREE_NODE_MIME) ||
    event.dataTransfer.getData('application/json') ||
    readTreeNodeText(event.dataTransfer.getData('text/plain'));

  try {
    return raw ? JSON.parse(raw) : currentTreeDragData;
  } catch {
    return currentTreeDragData;
  }
}

function readTreeNodeText(text) {
  return text?.startsWith(TREE_NODE_TEXT_PREFIX)
    ? text.slice(TREE_NODE_TEXT_PREFIX.length)
    : '';
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
