import { useQuery } from '@tanstack/react-query';
import { fetchJson, toQueryString } from '../../../common/apiClient.js';
import { queryKeys } from '../../../constants/queryKeys.js';

function toServerPageParams(params = {}) {
  return {
    ...params,
    page: Math.max((params.page ?? 1) - 1, 0)
  };
}

export function selectTreeNodes(params = {}) {
  return fetchJson(`/api/tree-nodes${toQueryString(params)}`);
}

export function selectGridItems(params = {}) {
  return fetchJson(`/api/grid-items${toQueryString(toServerPageParams(params))}`);
}

export function useTreeNodesQuery(params = {}, options = {}) {
  const { refreshKey = 0, ...queryOptions } = options;

  return useQuery({
    queryKey: [queryKeys.treeNodes, params, refreshKey],
    queryFn: () => selectTreeNodes(params),
    staleTime: 300_000,
    ...queryOptions
  });
}

export function useGridItemsQuery(queryParams, options = {}) {
  const { refreshKey = 0, ...queryOptions } = options;

  return useQuery({
    queryKey: [queryKeys.gridItems, queryParams, refreshKey],
    queryFn: () => selectGridItems(queryParams),
    enabled: Boolean(queryParams?.nodeKey),
    ...queryOptions
  });
}
