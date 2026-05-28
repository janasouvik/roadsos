import { PAGINATION_DEFAULTS } from '../constants';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: string;
}

export interface ParsedPagination {
  skip: number;
  take: number;
  page: number;
  limit: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

/**
 * Parse and validate pagination parameters from request query
 */
export const parsePagination = (
  params: PaginationParams,
  allowedSortFields?: string[],
): ParsedPagination => {
  const page = Math.max(1, Number(params.page) || PAGINATION_DEFAULTS.PAGE);
  const limit = Math.min(
    Number(params.limit) || PAGINATION_DEFAULTS.LIMIT,
    PAGINATION_DEFAULTS.MAX_LIMIT,
  );
  const skip = (page - 1) * limit;

  let orderBy: Record<string, 'asc' | 'desc'> | undefined;
  if (params.sortBy) {
    const field = allowedSortFields?.includes(params.sortBy)
      ? params.sortBy
      : 'createdAt';
    const order = params.sortOrder === 'asc' ? 'asc' : 'desc';
    orderBy = { [field]: order };
  }

  return { skip, take: limit, page, limit, orderBy };
};

/**
 * Build pagination metadata for response
 */
export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
