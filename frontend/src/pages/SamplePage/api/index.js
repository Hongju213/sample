import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchJson, toQueryString } from '../../../common/apiClient.js';
import { queryKeys } from '../../../constants/queryKeys.js';

function toServerPageParams(params = {}) {
  return {
    ...params,
    page: Math.max((params.page ?? 1) - 1, 0)
  };
}

export function selectSampleItems(params = {}) {
  return fetchJson(`/api/sample-items${toQueryString(toServerPageParams(params))}`);
}

export function selectSampleItemById(id) {
  return fetchJson(`/api/sample-items/${id}`);
}

export function createSampleItem(payload) {
  return fetchJson('/api/sample-items', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateSampleItem(id, payload) {
  return fetchJson(`/api/sample-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteSampleItem(id) {
  return fetchJson(`/api/sample-items/${id}`, {
    method: 'DELETE'
  });
}

export function useSampleGridQuery(queryParams, options = {}) {
  const { refreshKey = 0, ...queryOptions } = options;

  return useQuery({
    queryKey: [queryKeys.sampleList, queryParams, refreshKey],
    queryFn: () => selectSampleItems(queryParams),
    enabled: true,
    ...queryOptions
  });
}

export function useSampleCreate() {
  return useMutation({
    mutationFn: createSampleItem
  });
}

export function useSampleUpdate() {
  return useMutation({
    mutationFn: ({ id, payload }) => updateSampleItem(id, payload)
  });
}

export function useSampleDelete() {
  return useMutation({
    mutationFn: deleteSampleItem
  });
}
