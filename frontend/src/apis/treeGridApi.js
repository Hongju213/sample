import testData from '../dev/testData.json';

export async function fetchTreeNodes() {
  return testData.treeNodes;
}

export async function fetchGridItems(params = {}) {
  const page = params.page ?? 0;
  const size = params.size ?? 10;
  const filtered = testData.gridItems.filter(item => {
    const matchesNode = params.nodeKey ? item.nodeKey === params.nodeKey : true;
    const matchesCol1 = params.col1 ? item.col1.includes(params.col1) : true;
    return matchesNode && matchesCol1;
  });
  const content = filtered.slice(page * size, page * size + size);
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
