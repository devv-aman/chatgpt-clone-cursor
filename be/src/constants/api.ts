export const API_CONFIG = {
  VERSION: 'v1',
  PREFIX: '/api',
  FULL_PREFIX: '/api/v1',
} as const;

export const API_ROUTES = {
  AUTH: {
    BASE: '/auth',
    REGISTER: '/register',
    LOGIN: '/login',
    LOGOUT: '/logout',
    ME: '/me',
    REFRESH: '/refresh',
  },
  SETTINGS: {
    BASE: '/settings',
    OPENAI_KEY: '/openai-key',
  },
  CHAT: {
    BASE: '/chat',
    STREAM: '/stream',
    STOP: '/stop',
  },
  CHATS: {
    BASE: '/chats',
    MESSAGES: '/messages',
  },
  HEALTH: '/health',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const CONTENT_TYPES = {
  JSON: 'application/json',
  EVENT_STREAM: 'text/event-stream',
} as const;

export const HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
} as const;

