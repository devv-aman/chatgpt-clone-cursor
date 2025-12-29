export const STRINGS = {
  APP: {
    NAME: 'ChatGPT Clone API',
    DESCRIPTION: 'Backend API for ChatGPT Clone application',
  },
  AUTH: {
    REGISTER_SUCCESS: 'User registered successfully',
    REGISTER_CONFIRMATION_REQUIRED: 'Registration successful. Please check your email to confirm your account.',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
    USER_FETCHED: 'User details fetched successfully',
    TOKEN_REFRESHED: 'Token refreshed successfully',
  },
  SETTINGS: {
    OPENAI_KEY_SAVED: 'OpenAI API key saved successfully',
    OPENAI_KEY_DELETED: 'OpenAI API key deleted successfully',
    OPENAI_KEY_EXISTS: 'OpenAI API key exists',
    OPENAI_KEY_NOT_SET: 'OpenAI API key is not set',
  },
  CHAT: {
    SESSION_CREATED: 'Chat session created successfully',
    MESSAGES_FETCHED: 'Messages fetched successfully',
    CHATS_FETCHED: 'Chats fetched successfully',
    CHAT_FETCHED: 'Chat fetched successfully',
    STREAM_STOPPED: 'Stream stopped successfully',
  },
  HEALTH: {
    OK: 'OK',
    MESSAGE: 'Service is running',
  },
  SERVER: {
    STARTING: 'Starting server...',
    STARTED: 'Server started on port',
    SHUTDOWN: 'Server shutting down...',
  },
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;

export type MessageRole = (typeof MESSAGE_ROLES)[keyof typeof MESSAGE_ROLES];

