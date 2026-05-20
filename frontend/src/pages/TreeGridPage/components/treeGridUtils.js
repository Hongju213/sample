import {
  DROP_FIELDS,
  TREE_NODE_MIME,
  TREE_NODE_TEXT_PREFIX
} from '../constants/index.js';

let currentTreeDragData = null;

export function toAntTreeData(nodes) {
  return nodes.map(node => ({
    key: node.nodeKey,
    title: node.nodeName,
    children: node.children?.length ? toAntTreeData(node.children) : undefined
  }));
}

export function toGridList(page, fallbackPageSize) {
  return {
    content: page?.content ?? [],
    currentPage: (page?.number ?? 0) + 1,
    pages: page?.totalPages || 0,
    totalCount: page?.totalElements || 0,
    pageSize: page?.size || fallbackPageSize
  };
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

export function applyDropToRow(row, field, dragData) {
  if (!DROP_FIELDS.includes(field)) {
    return row;
  }

  return { ...row, [field]: dragData.nodeName };
}

export function allowDrop(event) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy';
  }
}

export function isPointInRect(event, rect) {
  return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
}

export function getPointedElement(elements, event) {
  return elements.find(element => isPointInRect(event, element.getBoundingClientRect()));
}

export function isEventInContainer(container, event) {
  return isPointInRect(event, container.getBoundingClientRect());
}

export function clearDragOver(container) {
  container
    ?.querySelectorAll?.('.is-drag-over-row, .is-drag-over-cell')
    .forEach(element => {
      element.classList.remove('is-drag-over-row', 'is-drag-over-cell');
    });
}

export function markDragOver(container, target) {
  clearDragOver(container);
  target?.rowElements?.forEach(row => row.classList.add('is-drag-over-row'));
  target?.cell?.classList.add('is-drag-over-cell');
}

export function getGridDropTarget(container, event, gridApi, rows) {
  const row = getPointedElement(Array.from(container.querySelectorAll('.ag-row[row-index]')), event);

  if (!row) {
    return null;
  }

  const cell = getPointedElement(Array.from(row.querySelectorAll('.ag-cell[col-id]')), event);
  const field = cell?.getAttribute('col-id');
  const rowIndex = Number(row.getAttribute('row-index'));
  const rowData = Number.isFinite(rowIndex) ? gridApi?.getDisplayedRowAtIndex(rowIndex)?.data : null;
  const fallbackData = Number.isFinite(rowIndex) ? rows[rowIndex] : null;
  const rowId = rowData?.id ?? fallbackData?.id;

  if (rowId == null || !DROP_FIELDS.includes(field)) {
    return null;
  }

  return {
    cell,
    field,
    rowId,
    rowElements: Array.from(container.querySelectorAll(`.ag-row[row-index="${rowIndex}"]`))
  };
}
