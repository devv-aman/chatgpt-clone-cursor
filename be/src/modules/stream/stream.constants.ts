export const STREAM_CONSTANTS = {
  REDIS_KEYS: {
    STREAM_PREFIX: 'stream:',
    ACTIVE_STREAMS: 'active_streams',
  },
  STATUS: {
    ACTIVE: 'active',
    STOPPED: 'stopped',
    COMPLETED: 'completed',
    ERROR: 'error',
  },
  TTL: {
    STREAM_DATA: 3600, // 1 hour in seconds
  },
} as const;

export type StreamStatus = typeof STREAM_CONSTANTS.STATUS[keyof typeof STREAM_CONSTANTS.STATUS];

