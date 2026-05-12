// Spring Data Page 응답 형식
export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;       // 현재 페이지 (0-based)
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type SampleItemStatus = 'TODO' | 'DOING' | 'DONE';

export type SampleItemDto = {
  id: number;
  title: string;
  description?: string;
  status: SampleItemStatus;
  createdAt: string;
  updatedAt: string;
};

export type SampleItemSavePayload = {
  title: string;
  description?: string;
  status: SampleItemStatus;
};

// Tree 관련 타입
export type TreeNodeDto = {
  id: number;
  nodeKey: string;
  nodeName: string;
  parentKey: string | null;
  levelNo: number;
  sortOrder: number;
  children: TreeNodeDto[];
};

// Grid 관련 타입
export type GridItemDto = {
  id: number;
  nodeKey: string;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  createdAt: string;
};
