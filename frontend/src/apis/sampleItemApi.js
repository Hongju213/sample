import { sampleItems } from '../dev/sampleData.js';
import { http } from './http.js';

const useMockApi = import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL;
let localItems = [...sampleItems];

export async function fetchSampleItems(params = {}) {
  if (useMockApi) {
    return fallbackPageFromLocal(params);
  }

  try {
    const { data } = await http.get('/api/sample-items', { params });
    return data;
  } catch {
    return fallbackPageFromLocal(params);
  }
}

export async function fetchSampleItemById(id) {
  if (useMockApi) {
    return localItems.find(item => item.id === Number(id));
  }

  const { data } = await http.get(`/api/sample-items/${id}`);
  return data;
}

export async function createSampleItem(payload) {
  if (!useMockApi) {
    try {
      const { data } = await http.post('/api/sample-items', payload);
      return data;
    } catch {
      // API 연결 전에는 아래 로컬 저장 로직으로 화면을 계속 검토한다.
    }
  }

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
  if (!useMockApi) {
    try {
      const { data } = await http.put(`/api/sample-items/${id}`, payload);
      return data;
    } catch {
      // API 연결 전에는 아래 로컬 수정 로직으로 화면을 계속 검토한다.
    }
  }

  const now = new Date().toISOString();
  localItems = localItems.map(item =>
    item.id === id ? { ...item, ...payload, updatedAt: now } : item
  );
  return localItems.find(item => item.id === id);
}

export async function deleteSampleItem(id) {
  if (!useMockApi) {
    try {
      await http.delete(`/api/sample-items/${id}`);
      return;
    } catch {
      // API 연결 전에는 아래 로컬 삭제 로직으로 화면을 계속 검토한다.
    }
  }

  localItems = localItems.filter(item => item.id !== id);
}

export async function fetchCurrentUser() {
  if (useMockApi) {
    return { username: 'root' };
  }

  const { data } = await http.get('/api/auth/me');
  return data;
}

function fallbackPageFromLocal(params = {}) {
  const page = params.page ?? 0;
  const size = params.size ?? 10;
  const keyword = params.keyword?.toLowerCase();
  const status = params.status;
  const filtered = localItems.filter(item => {
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
