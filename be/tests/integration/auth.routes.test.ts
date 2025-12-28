import request from 'supertest';
import type { Express } from 'express';

// Mock the Supabase client module before importing app
jest.mock('../../src/db/client');

import { getSupabaseClient, getSupabaseAdminClient } from '../../src/db/client';
import { createApp } from '../../src/app';
import { API_CONFIG, API_ROUTES, HTTP_STATUS } from '../../src/constants/api';
import { STRINGS } from '../../src/constants/strings';
import { ERROR_MESSAGES } from '../../src/constants/errors';

const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPass123!',
};

const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

const MOCK_PROFILE = {
  id: MOCK_USER_ID,
  name: TEST_USER.name,
  email: TEST_USER.email,
  role: 'user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
};

const MOCK_SUPABASE_USER = {
  id: MOCK_USER_ID,
  email: TEST_USER.email,
  app_metadata: {},
  user_metadata: { name: TEST_USER.name },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

const MOCK_SESSION = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: MOCK_SUPABASE_USER,
};

describe('Auth Routes', () => {
  let app: Express;
  let mockSupabaseClient: Record<string, unknown>;
  let mockAdminClient: Record<string, unknown>;

  const authBaseUrl = `${API_CONFIG.FULL_PREFIX}${API_ROUTES.AUTH.BASE}`;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock clients
    mockSupabaseClient = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
        admin: {
          signOut: jest.fn(),
        },
      },
    };

    mockAdminClient = {
      from: jest.fn(),
      auth: {
        admin: {
          signOut: jest.fn(),
        },
      },
    };

    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    (getSupabaseAdminClient as jest.Mock).mockReturnValue(mockAdminClient);
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock: no existing user
      const mockFromProfiles = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFromProfiles);

      // Mock: successful signup
      (mockSupabaseClient.auth as Record<string, jest.Mock>).signUp.mockResolvedValue({
        data: { user: MOCK_SUPABASE_USER, session: MOCK_SESSION },
        error: null,
      });

      // Mock: profile fetch
      const mockFromProfilesFetch = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: MOCK_PROFILE, error: null }),
      };

      (mockAdminClient.from as jest.Mock)
        .mockReturnValueOnce(mockFromProfiles)
        .mockReturnValueOnce(mockFromProfilesFetch);

      const response = await request(app)
        .post(`${authBaseUrl}${API_ROUTES.AUTH.REGISTER}`)
        .send(TEST_USER);

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(STRINGS.AUTH.REGISTER_SUCCESS);
      expect(response.body.data.user.email).toBe(TEST_USER.email);
    });

    it('should return validation error for invalid email', async () => {
      const response = await request(app)
        .post(`${authBaseUrl}${API_ROUTES.AUTH.REGISTER}`)
        .send({
          name: TEST_USER.name,
          email: 'invalid-email',
          password: TEST_USER.password,
        });

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.success).toBe(false);
    });

    it('should return validation error for weak password', async () => {
      const response = await request(app)
        .post(`${authBaseUrl}${API_ROUTES.AUTH.REGISTER}`)
        .send({
          name: TEST_USER.name,
          email: TEST_USER.email,
          password: 'weak',
        });

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    it('should login user successfully', async () => {
      (mockSupabaseClient.auth as Record<string, jest.Mock>).signInWithPassword.mockResolvedValue({
        data: { user: MOCK_SUPABASE_USER, session: MOCK_SESSION },
        error: null,
      });

      const mockFromProfiles = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: MOCK_PROFILE, error: null }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFromProfiles);

      const response = await request(app)
        .post(`${authBaseUrl}${API_ROUTES.AUTH.LOGIN}`)
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(STRINGS.AUTH.LOGIN_SUCCESS);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return unauthorized for invalid credentials', async () => {
      (mockSupabaseClient.auth as Record<string, jest.Mock>).signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const response = await request(app)
        .post(`${authBaseUrl}${API_ROUTES.AUTH.LOGIN}`)
        .send({
          email: TEST_USER.email,
          password: 'wrong-password',
        });

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    });
  });

  describe('POST /auth/logout', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post(`${authBaseUrl}${API_ROUTES.AUTH.LOGOUT}`);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    it('should logout user successfully with valid token', async () => {
      // Mock: token validation
      (mockSupabaseClient.auth as Record<string, jest.Mock>).getUser.mockResolvedValue({
        data: { user: MOCK_SUPABASE_USER },
        error: null,
      });

      // Mock: profile fetch for auth middleware
      const mockFromProfiles = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: MOCK_PROFILE, error: null }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFromProfiles);

      // Mock: signout
      (mockAdminClient.auth as Record<string, Record<string, jest.Mock>>).admin.signOut.mockResolvedValue({
        error: null,
      });

      const response = await request(app)
        .post(`${authBaseUrl}${API_ROUTES.AUTH.LOGOUT}`)
        .set('Authorization', `Bearer ${MOCK_SESSION.access_token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(STRINGS.AUTH.LOGOUT_SUCCESS);
    });
  });

  describe('GET /auth/me', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get(`${authBaseUrl}${API_ROUTES.AUTH.ME}`);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    it('should return user details with valid token', async () => {
      // Mock: token validation
      (mockSupabaseClient.auth as Record<string, jest.Mock>).getUser.mockResolvedValue({
        data: { user: MOCK_SUPABASE_USER },
        error: null,
      });

      // Mock: profile fetch
      const mockFromProfiles = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: MOCK_PROFILE, error: null }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFromProfiles);

      const response = await request(app)
        .get(`${authBaseUrl}${API_ROUTES.AUTH.ME}`)
        .set('Authorization', `Bearer ${MOCK_SESSION.access_token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(STRINGS.AUTH.USER_FETCHED);
      expect(response.body.data.email).toBe(TEST_USER.email);
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get(API_ROUTES.HEALTH);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(STRINGS.HEALTH.OK);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body.success).toBe(false);
    });
  });
});
