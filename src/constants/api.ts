export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  HEADERS: {
    CONTENT_TYPE: 'Content-Type',
    AUTHORIZATION: 'Authorization',
    ACCEPT: 'Accept',
  },
  CONTENT_TYPES: {
    JSON: 'application/json',
  },
} as const;

export const API_ENDPOINTS = {
  // Add your API endpoints here
  HEALTH: '/health',
} as const;

