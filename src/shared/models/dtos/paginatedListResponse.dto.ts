export interface PaginatedListResponse<T> {
  results: T[];
  count: number;
}
