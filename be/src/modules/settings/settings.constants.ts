export const SETTINGS_CONSTANTS = {
  ENCRYPTION: {
    ALGORITHM: 'aes-256-gcm',
    IV_LENGTH: 16,
    TAG_LENGTH: 16,
  },
  OPENAI_KEY: {
    PREFIX: 'sk-',
    MIN_LENGTH: 20,
  },
} as const;

