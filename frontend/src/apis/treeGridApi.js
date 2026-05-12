import testData from '../dev/testData.json';

export async function fetchTreeNodes() {
  return testData.treeNodes;
}

export async function fetchGridItems(params = {}) {
  const page = params.page ?? 0;
  const size = params.size ?? 10;
  const nodeKeys = getSearchNodeKeys(params.nodeKey);

  const filtered = testData.gridItems.filter(item => {
    const matchesNode = nodeKeys.length > 0 ? nodeKeys.includes(item.nodeKey) : true;
    const matchesCol1 = params.col1 ? item.col1.includes(params.col1) : true;
    return matchesNode && matchesCol1;
  });
  const content = filtered.slice(page * size, page * size + size).map(toEmptyDropRow);
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));

  return {
    content,
    totalElements: filtered.length,
    totalPages,
    size,
    number: page,
    numberOfElements: content.length,
    first: page === 0,
    last: page >= totalPages - 1,
    empty: content.length === 0
  };
}

function toEmptyDropRow(item) {
  return {
    ...item,
    col1: '',
    col2: '',
    col3: '',
    col4: '',
    col5: '',
    path: ''
  };
}

function getSearchNodeKeys(nodeKey) {
  if (!nodeKey) {
    return [];
  }

  const selectedNode = findTreeNode(testData.treeNodes, nodeKey);
  return selectedNode ? collectNodeKeys(selectedNode) : [nodeKey];
}

function findTreeNode(nodes, nodeKey) {
  for (const node of nodes) {
    if (node.nodeKey === nodeKey) {
      return node;
    }

    const found = findTreeNode(node.children ?? [], nodeKey);
    if (found) {
      return found;
    }
  }

  return null;
}

function collectNodeKeys(node) {
  return [
    node.nodeKey,
    ...(node.children ?? []).flatMap(child => collectNodeKeys(child))
  ];
}
