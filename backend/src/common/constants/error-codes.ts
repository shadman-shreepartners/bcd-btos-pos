/**
 * Common error codes used across the application.
 */
export type ErrorCode =
  | 'AUTH_UNAUTHORIZED'
  | 'AUTH_FORBIDDEN'
  | 'AUTH_TOKEN_EXPIRED'
  | 'VALIDATION_FAILED'
  | 'RESOURCE_NOT_FOUND'
  | 'CONFLICT'
  | 'UPSTREAM_UNAVAILABLE'
  | 'INTERNAL_ERROR';
