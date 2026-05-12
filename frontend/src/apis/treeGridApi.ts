import { GridItemDto, PageResponse, TreeNodeDto } from '../common/types';
import { http } from './http';

export async function fetchTreeNodes(): Promise<TreeNodeDto[]> {
  const { data } = await http.get<TreeNodeDto[]>('/api/tree-nodes');
  return data;
}

export type GridItemSearchParams = {
  nodeKey?: string;
  col1?: string;
  page?: number;
  size?: number;
};

export async function fetchGridItems(params: GridItemSearchParams): Promise<PageResponse<GridItemDto>> {
  const { data } = await http.get<PageResponse<GridItemDto>>('/api/grid-items', { params });
  return data;
}
