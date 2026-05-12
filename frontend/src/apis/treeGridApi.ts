import { GridItemDto, PageResponse, TreeNodeDto } from '../common/types';
import { getMockGridPage, mockTreeNodes } from '../dev/treeGridMockData';
import { http } from './http';

const useMockTreeGridApi = import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL;

export async function fetchTreeNodes(): Promise<TreeNodeDto[]> {
  if (useMockTreeGridApi) {
    return mockTreeNodes;
  }

  try {
    const { data } = await http.get<TreeNodeDto[]>('/api/tree-nodes');
    return data;
  } catch {
    return mockTreeNodes;
  }
}

export type GridItemSearchParams = {
  nodeKey?: string;
  col1?: string;
  page?: number;
  size?: number;
};

export async function fetchGridItems(params: GridItemSearchParams): Promise<PageResponse<GridItemDto>> {
  if (useMockTreeGridApi) {
    return getMockGridPage(params);
  }

  try {
    const { data } = await http.get<PageResponse<GridItemDto>>('/api/grid-items', { params });
    return data;
  } catch {
    return getMockGridPage(params);
  }
}
