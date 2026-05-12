// 샘플 CRUD 화면에서 API가 없을 때 사용할 기본 데이터다.
// 백엔드 연결 전에도 화면 흐름을 확인할 수 있도록 프론트에서 fallback으로 사용한다.
export const sampleItems = [
  {
    id: 1,
    title: '요구사항 정리',
    description: '초기 화면과 API 계약을 정리합니다.',
    status: 'TODO',
    createdAt: '2026-05-12T09:00:00',
    updatedAt: '2026-05-12T09:30:00'
  },
  {
    id: 2,
    title: '트리 그리드 검토',
    description: '트리 노드를 그리드 셀에 드롭하는 동작을 확인합니다.',
    status: 'DOING',
    createdAt: '2026-05-12T10:00:00',
    updatedAt: '2026-05-12T10:40:00'
  },
  {
    id: 3,
    title: '빌드 검증',
    description: '프론트 빌드와 기본 화면 렌더링을 검증합니다.',
    status: 'DONE',
    createdAt: '2026-05-12T11:00:00',
    updatedAt: '2026-05-12T11:15:00'
  }
];

export const treeData = [
  {
    title: 'src',
    key: 'src',
    children: [
      { title: 'apis', key: 'apis' },
      { title: 'components', key: 'components' },
      { title: 'pages', key: 'pages' }
    ]
  }
];

export const transferItems = Array.from({ length: 8 }, (_, index) => ({
  key: String(index),
  title: `권한 ${index + 1}`,
  description: `샘플 권한 ${index + 1}`
}));

export function getSamplePage(params = {}) {
  const page = params.page ?? 0;
  const size = params.size ?? 10;
  const keyword = params.keyword?.toLowerCase();
  const status = params.status;

  const filtered = sampleItems.filter(item => {
    const matchesKeyword = keyword
      ? item.title.toLowerCase().includes(keyword) || item.description.toLowerCase().includes(keyword)
      : true;
    const matchesStatus = status ? item.status === status : true;
    return matchesKeyword && matchesStatus;
  });
  const content = filtered.slice(page * size, page * size + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / size)),
    size,
    number: page,
    numberOfElements: content.length,
    first: page === 0,
    last: page >= Math.ceil(filtered.length / size) - 1,
    empty: content.length === 0
  };
}
