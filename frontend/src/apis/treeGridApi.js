import { getMockGridPage, mockTreeNodes } from '../dev/treeGridMockData.js';
import { http } from './http.js';

const useMockTreeGridApi = import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL;

export async function fetchTreeNodes() {
  if (useMockTreeGridApi) {
    return mockTreeNodes;
  }

  try {
    const { data } = await http.get('/api/tree-nodes');
    return data;
  } catch {
    return mockTreeNodes;
  }
}

export async function fetchGridItems(params = {}) {
  if (useMockTreeGridApi) {
    return getMockGridPage(params);
  }

  try {
    const { data } = await http.get('/api/grid-items', { params });
    return data;
  } catch {
    return getMockGridPage(params);
  }
}
