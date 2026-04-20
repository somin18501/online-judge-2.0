export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ApiErrorShape {
  statusCode: number;
  message: string | string[];
  error?: string;
  code?: string;
  path?: string;
  timestamp?: string;
}
