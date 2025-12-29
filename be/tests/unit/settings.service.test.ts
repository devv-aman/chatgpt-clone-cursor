import type { SupabaseClient } from '@supabase/supabase-js';

// Mock the Supabase client module
jest.mock('../../src/db/client');
jest.mock('../../src/config/index', () => ({
  config: {
    ENCRYPTION_KEY: 'test-encryption-key-32-chars-long',
  },
}));

import { getSupabaseAdminClient } from '../../src/db/client';
import { settingsService } from '../../src/modules/settings/settings.service';
import { ERROR_MESSAGES } from '../../src/constants/errors';

const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000';
const MOCK_API_KEY = 'sk-test-api-key-1234567890abcdef';

describe('SettingsService', () => {
  let mockAdminClient: Partial<SupabaseClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAdminClient = {
      from: jest.fn(),
    };

    (getSupabaseAdminClient as jest.Mock).mockReturnValue(mockAdminClient);
  });

  describe('saveOpenAIKey', () => {
    it('should save an encrypted OpenAI API key', async () => {
      const mockUpsert = jest.fn().mockResolvedValue({ error: null });
      const mockFrom = {
        upsert: mockUpsert,
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFrom);

      await settingsService.saveOpenAIKey(MOCK_USER_ID, { apiKey: MOCK_API_KEY });

      expect(mockAdminClient.from).toHaveBeenCalledWith('user_settings');
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: MOCK_USER_ID,
          openai_api_key_encrypted: expect.any(String),
          openai_api_key_iv: expect.any(String),
          openai_api_key_tag: expect.any(String),
        }),
        { onConflict: 'user_id' }
      );
    });

    it('should throw error if save fails', async () => {
      const mockUpsert = jest.fn().mockResolvedValue({ 
        error: { message: 'Database error' } 
      });
      const mockFrom = {
        upsert: mockUpsert,
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFrom);

      await expect(
        settingsService.saveOpenAIKey(MOCK_USER_ID, { apiKey: MOCK_API_KEY })
      ).rejects.toThrow(ERROR_MESSAGES.SETTINGS.OPENAI_KEY_SAVE_FAILED);
    });
  });

  describe('hasOpenAIKey', () => {
    it('should return true if key exists', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { openai_api_key_encrypted: 'encrypted-data' },
          error: null,
        }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await settingsService.hasOpenAIKey(MOCK_USER_ID);

      expect(result).toEqual({ hasKey: true });
    });

    it('should return false if no key exists', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await settingsService.hasOpenAIKey(MOCK_USER_ID);

      expect(result).toEqual({ hasKey: false });
    });

    it('should return false if key is null', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { openai_api_key_encrypted: null },
          error: null,
        }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await settingsService.hasOpenAIKey(MOCK_USER_ID);

      expect(result).toEqual({ hasKey: false });
    });
  });

  describe('deleteOpenAIKey', () => {
    it('should delete the OpenAI API key', async () => {
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      const mockFrom = {
        update: mockUpdate,
        eq: mockEq,
      };
      mockUpdate.mockReturnValue({ eq: mockEq });

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFrom);

      await settingsService.deleteOpenAIKey(MOCK_USER_ID);

      expect(mockAdminClient.from).toHaveBeenCalledWith('user_settings');
      expect(mockUpdate).toHaveBeenCalledWith({
        openai_api_key_encrypted: null,
        openai_api_key_iv: null,
        openai_api_key_tag: null,
      });
    });
  });

  describe('requireOpenAIKey', () => {
    it('should throw error if no key exists', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      };

      (mockAdminClient.from as jest.Mock).mockReturnValue(mockFrom);

      await expect(
        settingsService.requireOpenAIKey(MOCK_USER_ID)
      ).rejects.toThrow(ERROR_MESSAGES.SETTINGS.OPENAI_KEY_REQUIRED);
    });
  });
});

