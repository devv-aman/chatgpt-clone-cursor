import type { SupabaseClient } from '@supabase/supabase-js';

// Mock the Supabase client module
jest.mock('../../src/db/client');

import { getSupabaseClient, getSupabaseAdminClient } from '../../src/db/client';
import { authService } from '../../src/modules/auth/auth.service';
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
  role: 'user' as const,
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

describe('AuthService', () => {
  let mockSupabaseClient: Partial<SupabaseClient>;
  let mockAdminClient: Partial<SupabaseClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock clients
    mockSupabaseClient = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
      } as unknown as SupabaseClient['auth'],
    };

    mockAdminClient = {
      from: jest.fn(),
      auth: {
        admin: {
          signOut: jest.fn(),
        },
      } as unknown as SupabaseClient['auth'],
    };

    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    (getSupabaseAdminClient as jest.Mock).mockReturnValue(mockAdminClient);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Setup mocks for checking existing user
      const mockFromProfiles = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFromProfiles);

      // Setup signUp mock
      (mockSupabaseClient.auth?.signUp as jest.Mock).mockResolvedValue({
        data: { user: MOCK_SUPABASE_USER, session: MOCK_SESSION },
        error: null,
      });

      // Setup profile fetch mock
      const mockFromProfilesFetch = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: MOCK_PROFILE, error: null }),
      };

      (mockAdminClient.from as jest.Mock)
        .mockReturnValueOnce(mockFromProfiles)
        .mockReturnValueOnce(mockFromProfilesFetch);

      const result = await authService.register(TEST_USER);

      expect(result).toBeDefined();
      expect(result.user.email).toBe(TEST_USER.email);
      expect(result.accessToken).toBe(MOCK_SESSION.access_token);
    });

    it('should throw conflict error if email already exists', async () => {
      const mockFromProfiles = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: 'existing-id' }, error: null }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFromProfiles);

      await expect(authService.register(TEST_USER)).rejects.toThrow(
        ERROR_MESSAGES.AUTH.EMAIL_EXISTS
      );
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      (mockSupabaseClient.auth?.signInWithPassword as jest.Mock).mockResolvedValue({
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

      const result = await authService.login({
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      expect(result).toBeDefined();
      expect(result.user.email).toBe(TEST_USER.email);
      expect(result.accessToken).toBe(MOCK_SESSION.access_token);
    });

    it('should throw unauthorized error with invalid credentials', async () => {
      (mockSupabaseClient.auth?.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(
        authService.login({
          email: TEST_USER.email,
          password: 'wrong-password',
        })
      ).rejects.toThrow(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user profile', async () => {
      const mockFromProfiles = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: MOCK_PROFILE, error: null }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFromProfiles);

      const result = await authService.getCurrentUser(MOCK_USER_ID);

      expect(result).toBeDefined();
      expect(result.id).toBe(MOCK_USER_ID);
      expect(result.email).toBe(TEST_USER.email);
    });

    it('should throw error if user not found', async () => {
      const mockFromProfiles = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFromProfiles);

      await expect(authService.getCurrentUser(MOCK_USER_ID)).rejects.toThrow(
        ERROR_MESSAGES.AUTH.USER_NOT_FOUND
      );
    });
  });
});
