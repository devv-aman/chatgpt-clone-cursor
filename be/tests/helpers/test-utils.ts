import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../../src/app.js';

let testApp: Express | null = null;

export const getTestApp = (): Express => {
  if (!testApp) {
    testApp = createApp();
  }
  return testApp;
};

export const resetTestApp = (): void => {
  testApp = null;
};

export const createTestRequest = () => {
  return request(getTestApp());
};

export const TEST_CONSTANTS = {
  VALID_USER: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPass123!',
  },
  INVALID_EMAIL: 'invalid-email',
  WEAK_PASSWORD: 'weak',
  MOCK_TOKEN: 'mock-jwt-token-for-testing',
  MOCK_USER_ID: '123e4567-e89b-12d3-a456-426614174000',
} as const;

export const MOCK_PROFILE = {
  id: TEST_CONSTANTS.MOCK_USER_ID,
  name: TEST_CONSTANTS.VALID_USER.name,
  email: TEST_CONSTANTS.VALID_USER.email,
  role: 'user' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
};

export const MOCK_SUPABASE_USER = {
  id: TEST_CONSTANTS.MOCK_USER_ID,
  email: TEST_CONSTANTS.VALID_USER.email,
  app_metadata: {},
  user_metadata: { name: TEST_CONSTANTS.VALID_USER.name },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

export const MOCK_SESSION = {
  access_token: TEST_CONSTANTS.MOCK_TOKEN,
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: MOCK_SUPABASE_USER,
};

export const createMockSupabaseClient = () => ({
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    admin: {
      signOut: jest.fn(),
    },
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        is: jest.fn(() => ({
          single: jest.fn(),
        })),
        single: jest.fn(),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
  })),
});

