import testData from '../dev/testData.json';

let localItems = [...testData.sampleItems];

export async function fetchSampleItems(params = {}) {
  return getPage(localItems, params);
}

export async function fetchSampleItemById(id) {
  return localItems.find(item => item.id === Number(id)) ?? null;
}

export async function createSampleItem(payload) {
  const now = new Date().toISOString();
  const item = {
    id: Math.max(0, ...localItems.map(row => row.id)) + 1,
    ...payload,
    createdAt: now,
    updatedAt: now
  };

  localItems = [item, ...localItems];
  return item;
}

export async function updateSampleItem(id, payload) {
  const now = new Date().toISOString();

  localItems = localItems.map(item =>
    item.id === id ? { ...item, ...payload, updatedAt: now } : item
  );

  return localItems.find(item => item.id === id) ?? null;
}

export async function deleteSampleItem(id) {
  localItems = localItems.filter(item => item.id !== id);
}

export async function fetchCurrentUser() {
  return testData.currentUser;
}

export async function requestAgentBatch(method = 'GET') {
  // 화면의 GET/POST 버튼이 호출하는 API입니다.
  // 브라우저는 Vite proxy를 통해 sample backend(/api/agent-test/bat)를 호출하고,
  // sample backend가 다시 local agent(127.0.0.1:8000)로 요청을 중계합니다.
  const options = method === 'POST'
    ? {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'sample-frontend',
          message: 'POST 요청 테스트'
        })
      }
    : { method: 'GET' };

  const response = await fetch('/api/agent-test/bat', options);
  if (!response.ok) {
    throw new Error('Agent request failed');
  }

  return response.json();
}

export async function fetchAgentBatchStatus() {
  // sample backend에 저장된 마지막 agent 작업 상태를 조회합니다.
  // requested이면 화면은 "요청되었습니다.", completed이면 "완료되었습니다."를 보여줍니다.
  const response = await fetch('/api/agent-test/status');
  if (!response.ok) {
    throw new Error('Agent status request failed');
  }

  return response.json();
}

// Keep this shape close to Spring Page so the screen state flow stays realistic.
function getPage(items, params = {}) {
  const page = params.page ?? 0;
  const size = params.size ?? 10;
  const keyword = params.keyword?.toLowerCase();
  const status = params.status;
  const filtered = items.filter(item => {
    const matchesKeyword = keyword
      ? item.title.toLowerCase().includes(keyword) || item.description.toLowerCase().includes(keyword)
      : true;
    const matchesStatus = status ? item.status === status : true;
    return matchesKeyword && matchesStatus;
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
