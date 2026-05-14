import testData from '../dev/testData.json';

let localItems = [...testData.sampleItems];

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const AGENT_BASE_URL = (import.meta.env.VITE_AGENT_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
const AGENT_CALLBACK_BASE_URL = (import.meta.env.VITE_AGENT_CALLBACK_BASE_URL ?? API_BASE_URL).replace(/\/$/, '');

function resolveUrl(pathOrUrl, baseUrl = API_BASE_URL) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return `${baseUrl}${pathOrUrl}`;
}

async function fetchJson(pathOrUrl, options, baseUrl = API_BASE_URL) {
  const url = resolveUrl(pathOrUrl, baseUrl);
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
  if (!/^https?:\/\//i.test(AGENT_CALLBACK_BASE_URL)) {
    throw new Error('VITE_AGENT_CALLBACK_BASE_URL or VITE_API_BASE_URL must be an absolute backend URL.');
  }

  const callbackUrl = `${AGENT_CALLBACK_BASE_URL}/api/agent-test/callback`;
  const payload = {
    source: 'sample-frontend',
    message: `${method} request test`,
    callback_url: callbackUrl
  };

  if (method === 'POST') {
    return fetchJson('/api/bat/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, AGENT_BASE_URL);
  }

  const searchParams = new URLSearchParams({
    source: payload.source,
    message: payload.message,
    callback_url: callbackUrl
  });

  return fetchJson(`/api/bat/test?${searchParams.toString()}`, { method: 'GET' }, AGENT_BASE_URL);
}

export async function fetchAgentBatchStatus() {
  return fetchJson('/api/agent-test/status');
}

export function subscribeAgentBatchStatus(onStatus, onError) {
  const eventSource = new EventSource(resolveUrl('/api/agent-test/events'));

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
