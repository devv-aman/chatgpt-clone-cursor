export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'Authentication required',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    TOKEN_MISSING: 'Authorization token is required',
    USER_NOT_FOUND: 'User not found',
    EMAIL_EXISTS: 'An account with this email already exists',
    REGISTRATION_FAILED: 'Registration failed',
    LOGIN_FAILED: 'Login failed',
    LOGOUT_FAILED: 'Logout failed',
  },
  // Validation errors
  VALIDATION: {
    INVALID_EMAIL: 'Invalid email address',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
    PASSWORD_TOO_WEAK: 'Password must contain uppercase, lowercase, number, and special character',
    NAME_REQUIRED: 'Name is required',
    INVALID_ROLE: 'Invalid user role',
    INVALID_REQUEST_BODY: 'Invalid request body',
  },
  // Server errors
  SERVER: {
    INTERNAL_ERROR: 'An internal server error occurred',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
    DATABASE_ERROR: 'Database operation failed',
  },
  // Resource errors
  RESOURCE: {
    NOT_FOUND: 'Resource not found',
    FORBIDDEN: 'Access denied',
    CONFLICT: 'Resource already exists',
  },
  // Chat errors
  CHAT: {
    NOT_FOUND: 'Chat not found',
    CREATE_FAILED: 'Failed to create chat',
    UPDATE_FAILED: 'Failed to update chat',
    DELETE_FAILED: 'Failed to delete chat',
  },
  // Message errors
  MESSAGE: {
    NOT_FOUND: 'Message not found',
    CREATE_FAILED: 'Failed to create message',
    EMPTY_CONTENT: 'Message content cannot be empty',
  },
} as const;

export const ERROR_CODES = {
  // Auth codes (1xxx)
  INVALID_CREDENTIALS: 'AUTH_1001',
  UNAUTHORIZED: 'AUTH_1002',
  TOKEN_EXPIRED: 'AUTH_1003',
  TOKEN_INVALID: 'AUTH_1004',
  EMAIL_EXISTS: 'AUTH_1005',
  // Validation codes (2xxx)
  VALIDATION_ERROR: 'VAL_2001',
  INVALID_REQUEST: 'VAL_2002',
  // Server codes (5xxx)
  INTERNAL_ERROR: 'SRV_5001',
  DATABASE_ERROR: 'SRV_5002',
  // Resource codes (4xxx)
  NOT_FOUND: 'RES_4001',
  FORBIDDEN: 'RES_4002',
  CONFLICT: 'RES_4003',
} as const;

