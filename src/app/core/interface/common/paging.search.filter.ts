export interface PagingSearchFilter {
  SearchTerm: string | null;
  SortColumnName: string | null;
  SortColumnDirection: 'asc' | 'desc' | ''; // Using literal types for direction
  PageNumber: number;
  PageSize: number;
}