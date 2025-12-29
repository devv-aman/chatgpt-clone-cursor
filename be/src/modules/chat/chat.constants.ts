export const CHAT_CONSTANTS = {
  DEFAULT_MODEL: 'gpt-5.2',
  DEFAULT_TITLE: 'New Chat',
  SSE: {
    EVENT_TYPES: {
      SESSION: 'session',
      CONTENT: 'content',
      DONE: 'done',
      ERROR: 'error',
    },
    HEADERS: {
      CONTENT_TYPE: 'text/event-stream',
      CACHE_CONTROL: 'no-cache',
      CONNECTION: 'keep-alive',
      X_ACCEL_BUFFERING: 'no',
    },
  },
  PAGINATION: {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 100,
  },
} as const;

export type SSEEventType = typeof CHAT_CONSTANTS.SSE.EVENT_TYPES[keyof typeof CHAT_CONSTANTS.SSE.EVENT_TYPES];

