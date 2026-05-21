import { useMutation, useQuery } from '@tanstack/react-query';
import { CommonAxios } from '../../../common/CommonAxios.js';
import { queryKeys } from '../../../constants/queryKeys.js';

// 스프링 0-index 기반 페이징 및 필터 매핑 헬퍼
function toServerPageParams(params = {}) {
  const { page, size, name, useYn } = params;

  let status;
  if (useYn === 'Y') status = 'DONE';
  if (useYn === 'N') status = 'TODO';

  return {
    page: Math.max((page ?? 1) - 1, 0),
    size: size ?? 20,
    keyword: name,
    status
  };
}

// -----------------------------------------------------
// API 호출 함수 (CommonAxios)
// -----------------------------------------------------

const selectTemplateItems = async (params = {}) => {
  return await CommonAxios.get('/api/sample-items', {
    params: toServerPageParams(params)
  });
};

const templateCreate = async (payload) => {
  return await CommonAxios.post('/api/sample-items', {
    title: payload.title,
    description: payload.description,
    status: payload.status || 'TODO'
  });
};

const templateUpdate = async ({ id, payload }) => {
  return await CommonAxios.put(`/api/sample-items/${id}`, {
    title: payload.title,
    description: payload.description,
    status: payload.status || 'TODO'
  });
};

const templateDelete = async (id) => {
  return await CommonAxios.delete(`/api/sample-items/${id}`);
};

// -----------------------------------------------------
// React Query Hooks
// -----------------------------------------------------

export const useTemplateGridQuery = (param, options = {}) => {
  const { refreshKey = 0, ...restOptions } = options;

  return useQuery({
    queryKey: [queryKeys.templateList, param, refreshKey],
    queryFn: () => selectTemplateItems(param),
    enabled: true,
    refetchOnWindowFocus: false,
    retry: 0,
    ...restOptions
  });
};

export const useTemplateCreate = (options) => {
  return useMutation({
    mutationFn: templateCreate,
    ...options
  });
};

export const useTemplateUpdate = (options) => {
  return useMutation({
    mutationFn: templateUpdate,
    ...options
  });
};

export const useTemplateDelete = (options) => {
  return useMutation({
    mutationFn: templateDelete,
    ...options
  });
};
