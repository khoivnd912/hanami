export * from "./product";
export * from "./customer";
export * from "./order";
export * from "./staff";

// ─── Generic API response wrapper ────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error:   string;
  code?:   string;
  issues?: { field: string; message: string }[];
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items:   T[];
  total:   number;
  page:    number;
  limit:   number;
  pages:   number;
}
