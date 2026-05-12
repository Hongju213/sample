import { PageResponse, SampleItemDto, SampleItemSavePayload } from '../common/types';
import { http } from './http';

export type SampleItemSearchParams = {
  keyword?: string;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export async function fetchSampleItems(params: SampleItemSearchParams = {}): Promise<PageResponse<SampleItemDto>> {
  const { data } = await http.get<PageResponse<SampleItemDto>>('/api/sample-items', { params });
  return data;
}

export async function fetchSampleItemById(id: number): Promise<SampleItemDto> {
  const { data } = await http.get<SampleItemDto>(`/api/sample-items/${id}`);
  return data;
}

export async function createSampleItem(payload: SampleItemSavePayload): Promise<SampleItemDto> {
  const { data } = await http.post<SampleItemDto>('/api/sample-items', payload);
  return data;
}

export async function updateSampleItem(id: number, payload: SampleItemSavePayload): Promise<SampleItemDto> {
  const { data } = await http.put<SampleItemDto>(`/api/sample-items/${id}`, payload);
  return data;
}

export async function deleteSampleItem(id: number): Promise<void> {
  await http.delete(`/api/sample-items/${id}`);
}

export async function fetchCurrentUser() {
  const { data } = await http.get<{ username: string }>('/api/auth/me');
  return data;
}
