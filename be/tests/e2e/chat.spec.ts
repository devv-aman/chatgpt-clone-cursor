import { test, expect } from '@playwright/test';

const API_BASE = '/api/v1';
const SETTINGS_BASE = `${API_BASE}/settings`;
const CHAT_BASE = `${API_BASE}/chat`;
const CHATS_BASE = `${API_BASE}/chats`;

const TEST_CONSTANTS = {
  // Note: In a real E2E test, you would need a valid auth token
  // These tests validate the API contract and error handling
  INVALID_TOKEN: 'invalid-token',
  MOCK_STREAM_ID: '123e4567-e89b-12d3-a456-426614174000',
  MOCK_CHAT_ID: '456e4567-e89b-12d3-a456-426614174001',
} as const;

test.describe('Settings API E2E Tests', () => {
  test.describe('OpenAI Key Management', () => {
    test('should reject saving key without authentication', async ({ request }) => {
      const response = await request.post(`${SETTINGS_BASE}/openai-key`, {
        data: {
          apiKey: 'sk-test-key-1234567890',
        },
      });

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject saving invalid key format', async ({ request }) => {
      const response = await request.post(`${SETTINGS_BASE}/openai-key`, {
        headers: {
          Authorization: `Bearer ${TEST_CONSTANTS.INVALID_TOKEN}`,
        },
        data: {
          apiKey: 'invalid-key-format',
        },
      });

      // Should fail validation or auth before reaching DB
      expect([401, 422]).toContain(response.status());
    });

    test('should reject getting key status without authentication', async ({ request }) => {
      const response = await request.get(`${SETTINGS_BASE}/openai-key`);

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject deleting key without authentication', async ({ request }) => {
      const response = await request.delete(`${SETTINGS_BASE}/openai-key`);

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });
});

test.describe('Chat API E2E Tests', () => {
  test.describe('Chat Stream', () => {
    test('should reject streaming without authentication', async ({ request }) => {
      const response = await request.post(`${CHAT_BASE}/stream`, {
        data: {
          message: 'Hello, how are you?',
        },
      });

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject streaming with invalid token', async ({ request }) => {
      const response = await request.post(`${CHAT_BASE}/stream`, {
        headers: {
          Authorization: `Bearer ${TEST_CONSTANTS.INVALID_TOKEN}`,
        },
        data: {
          message: 'Hello, how are you?',
        },
      });

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject streaming with empty message', async ({ request }) => {
      const response = await request.post(`${CHAT_BASE}/stream`, {
        headers: {
          Authorization: `Bearer ${TEST_CONSTANTS.INVALID_TOKEN}`,
        },
        data: {
          message: '',
        },
      });

      // Should fail validation or auth
      expect([401, 422]).toContain(response.status());
    });

    test('should reject streaming without message', async ({ request }) => {
      const response = await request.post(`${CHAT_BASE}/stream`, {
        headers: {
          Authorization: `Bearer ${TEST_CONSTANTS.INVALID_TOKEN}`,
        },
        data: {},
      });

      // Should fail validation or auth
      expect([401, 422]).toContain(response.status());
    });
  });

  test.describe('Stop Stream', () => {
    test('should reject stopping stream without authentication', async ({ request }) => {
      const response = await request.post(
        `${CHAT_BASE}/stream/${TEST_CONSTANTS.MOCK_STREAM_ID}/stop`
      );

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject stopping stream with invalid token', async ({ request }) => {
      const response = await request.post(
        `${CHAT_BASE}/stream/${TEST_CONSTANTS.MOCK_STREAM_ID}/stop`,
        {
          headers: {
            Authorization: `Bearer ${TEST_CONSTANTS.INVALID_TOKEN}`,
          },
        }
      );

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject stopping with invalid stream ID format', async ({ request }) => {
      const response = await request.post(
        `${CHAT_BASE}/stream/invalid-uuid/stop`,
        {
          headers: {
            Authorization: `Bearer ${TEST_CONSTANTS.INVALID_TOKEN}`,
          },
        }
      );

      // Should fail validation or auth
      expect([401, 422]).toContain(response.status());
    });
  });
});

test.describe('Chats API E2E Tests', () => {
  test.describe('Get Chats', () => {
    test('should reject getting chats without authentication', async ({ request }) => {
      const response = await request.get(CHATS_BASE);

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject getting chats with invalid token', async ({ request }) => {
      const response = await request.get(CHATS_BASE, {
        headers: {
          Authorization: `Bearer ${TEST_CONSTANTS.INVALID_TOKEN}`,
        },
      });

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  test.describe('Get Single Chat', () => {
    test('should reject getting chat without authentication', async ({ request }) => {
      const response = await request.get(
        `${CHATS_BASE}/${TEST_CONSTANTS.MOCK_CHAT_ID}`
      );

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject getting chat with invalid ID format', async ({ request }) => {
      const response = await request.get(`${CHATS_BASE}/invalid-uuid`, {
        headers: {
          Authorization: `Bearer ${TEST_CONSTANTS.INVALID_TOKEN}`,
        },
      });

      // Should fail validation or auth
      expect([401, 422]).toContain(response.status());
    });
  });

  test.describe('Get Messages', () => {
    test('should reject getting messages without authentication', async ({ request }) => {
      const response = await request.get(
        `${CHATS_BASE}/${TEST_CONSTANTS.MOCK_CHAT_ID}/messages`
      );

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject getting messages with invalid token', async ({ request }) => {
      const response = await request.get(
        `${CHATS_BASE}/${TEST_CONSTANTS.MOCK_CHAT_ID}/messages`,
        {
          headers: {
            Authorization: `Bearer ${TEST_CONSTANTS.INVALID_TOKEN}`,
          },
        }
      );

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject getting messages with invalid chat ID format', async ({ request }) => {
      const response = await request.get(`${CHATS_BASE}/invalid-uuid/messages`, {
        headers: {
          Authorization: `Bearer ${TEST_CONSTANTS.INVALID_TOKEN}`,
        },
      });

      // Should fail validation or auth
      expect([401, 422]).toContain(response.status());
    });
  });
});

test.describe('404 Handling', () => {
  test('should return 404 for unknown chat routes', async ({ request }) => {
    const response = await request.get(`${CHAT_BASE}/unknown-route`);

    expect(response.status()).toBe(404);
    
    const data = await response.json();
    expect(data.success).toBe(false);
  });
});

