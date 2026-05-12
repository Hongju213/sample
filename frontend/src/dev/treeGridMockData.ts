import { GridItemDto, PageResponse, TreeNodeDto } from '../common/types';

export const mockTreeNodes: TreeNodeDto[] = [
  {
    id: 1,
    nodeKey: 'aaa',
    nodeName: 'aaa',
    parentKey: null,
    levelNo: 1,
    sortOrder: 1,
    children: [
      {
        id: 4,
        nodeKey: 'aaa-1',
        nodeName: 'aaa-1',
        parentKey: 'aaa',
        levelNo: 2,
        sortOrder: 1,
        children: [
          {
            id: 10,
            nodeKey: 'aaa-1-1',
            nodeName: 'aaa-1-1',
            parentKey: 'aaa-1',
            levelNo: 3,
            sortOrder: 1,
            children: []
          },
          {
            id: 11,
            nodeKey: 'aaa-1-2',
            nodeName: 'aaa-1-2',
            parentKey: 'aaa-1',
            levelNo: 3,
            sortOrder: 2,
            children: []
          }
        ]
      },
      {
        id: 5,
        nodeKey: 'aaa-2',
        nodeName: 'aaa-2',
        parentKey: 'aaa',
        levelNo: 2,
        sortOrder: 2,
        children: [
          {
            id: 12,
            nodeKey: 'aaa-2-1',
            nodeName: 'aaa-2-1',
            parentKey: 'aaa-2',
            levelNo: 3,
            sortOrder: 1,
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 2,
    nodeKey: 'bbb',
    nodeName: 'bbb',
    parentKey: null,
    levelNo: 1,
    sortOrder: 2,
    children: [
      {
        id: 6,
        nodeKey: 'bbb-1',
        nodeName: 'bbb-1',
        parentKey: 'bbb',
        levelNo: 2,
        sortOrder: 1,
        children: [
          {
            id: 13,
            nodeKey: 'bbb-1-1',
            nodeName: 'bbb-1-1',
            parentKey: 'bbb-1',
            levelNo: 3,
            sortOrder: 1,
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 3,
    nodeKey: 'ccc',
    nodeName: 'ccc',
    parentKey: null,
    levelNo: 1,
    sortOrder: 3,
    children: [
      {
        id: 8,
        nodeKey: 'ccc-2',
        nodeName: 'ccc-2',
        parentKey: 'ccc',
        levelNo: 2,
        sortOrder: 1,
        children: [
          {
            id: 14,
            nodeKey: 'ccc-2-1',
            nodeName: 'ccc-2-1',
            parentKey: 'ccc-2',
            levelNo: 3,
            sortOrder: 1,
            children: []
          }
        ]
      }
    ]
  }
];

const gridNodeKeys = ['aaa-1-1', 'aaa-1-2', 'aaa-2-1', 'bbb-1-1', 'ccc-2-1'];

export const mockGridItems: GridItemDto[] = gridNodeKeys.flatMap((nodeKey, nodeIndex) =>
  Array.from({ length: nodeIndex === 3 ? 12 : 8 }, (_, index) => {
    const sequence = String(index + 1).padStart(3, '0');

    return {
      id: nodeIndex * 100 + index + 1,
      nodeKey,
      col1: `${nodeKey}-col1-${sequence}`,
      col2: `${nodeKey}-col2-${sequence}`,
      col3: `val-${sequence}`,
      col4: `data-${String.fromCharCode(65 + (index % 26))}`,
      col5: `etc-${sequence}`,
      path: '',
      createdAt: new Date(2026, 4, 12, 9, index).toISOString()
    };
  })
);

export function getMockGridPage(params: {
  nodeKey?: string;
  col1?: string;
  page?: number;
  size?: number;
}): PageResponse<GridItemDto> {
  const page = params.page ?? 0;
  const size = params.size ?? 10;
  const filtered = mockGridItems.filter(item => {
    const matchesNode = params.nodeKey ? item.nodeKey === params.nodeKey : true;
    const matchesCol1 = params.col1 ? item.col1.includes(params.col1) : true;
    return matchesNode && matchesCol1;
  });
  const content = filtered.slice(page * size, page * size + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    size,
    number: page,
    numberOfElements: content.length,
    first: page === 0,
    last: page >= Math.ceil(filtered.length / size) - 1,
    empty: content.length === 0
  };
}
