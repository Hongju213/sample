import { ApiResponse, SampleItem, SampleItemPayload } from '../common/types';
import { http } from './http';

export async function fetchSampleItems(keyword?: string) {
  const { data } = await http.get<ApiResponse<SampleItem[]>>('/api/sample-items', {
    params: { keyword }
  });
  return data.data;
}

export async function createSampleItem(payload: SampleItemPayload) {
  const { data } = await http.post<ApiResponse<SampleItem>>('/api/sample-items', payload);
  return data.data;
}

export async function updateSampleItem(id: number, payload: SampleItemPayload) {
  const { data } = await http.put<ApiResponse<SampleItem>>(`/api/sample-items/${id}`, payload);
  return data.data;
}

export async function deleteSampleItem(id: number) {
  const { data } = await http.delete<ApiResponse<{ id: number }>>(`/api/sample-items/${id}`);
  return data.data;
}

export async function fetchCurrentUser() {
  const { data } = await http.get<ApiResponse<{ username: string }>>('/api/auth/me');
  return data.data;
}
