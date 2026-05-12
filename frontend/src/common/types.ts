export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
};

export type SampleItemStatus = 'TODO' | 'DOING' | 'DONE';

export type SampleItem = {
  id: number;
  title: string;
  description?: string;
  status: SampleItemStatus;
  createdAt: string;
  updatedAt: string;
};

export type SampleItemPayload = {
  title: string;
  description?: string;
  status: SampleItemStatus;
};
