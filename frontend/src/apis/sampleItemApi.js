import testData from '../dev/testData.json';

let localItems = [...testData.sampleItems];

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

async function fetchJson(path, options) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} ${url} ${text.slice(0, 120)}`);
  }

  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`API did not return JSON: ${url} content-type=${contentType} body=${text.slice(0, 120)}`);
  }

  return response.json();
}

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

  return fetchJson('/api/agent-test/bat', options);
}

export async function fetchAgentBatchStatus() {
  // sample backend에 저장된 마지막 agent 작업 상태를 조회합니다.
  // requested이면 화면은 "요청되었습니다.", completed이면 "완료되었습니다."를 보여줍니다.
  return fetchJson('/api/agent-test/status');
}

export function subscribeAgentBatchStatus(onStatus, onError) {
  const eventSource = new EventSource(`${API_BASE_URL}/api/agent-test/events`);

  eventSource.addEventListener('agent-status', event => {
    onStatus(JSON.parse(event.data));
  });

  eventSource.onerror = error => {
    onError?.(error);
  };

  return () => eventSource.close();
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
