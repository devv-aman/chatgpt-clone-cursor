import { test, expect } from '@playwright/test';

const API_BASE = '/api/v1';
const AUTH_BASE = `${API_BASE}/auth`;

const TEST_CONSTANTS = {
  VALID_USER: {
    name: 'E2E Test User',
    email: `e2e-test-${Date.now()}@example.com`,
    password: 'TestPass123!',
  },
  INVALID_EMAIL: 'invalid-email',
  WEAK_PASSWORD: 'weak',
} as const;

test.describe('Auth E2E Tests', () => {
  test.describe('Health Check', () => {
    test('should return healthy status', async ({ request }) => {
      const response = await request.get('/health');

      expect(response.ok()).toBe(true);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('OK');
    });
  });

  test.describe('Registration', () => {
    test('should reject registration with invalid email', async ({ request }) => {
      const response = await request.post(`${AUTH_BASE}/register`, {
        data: {
          name: TEST_CONSTANTS.VALID_USER.name,
          email: TEST_CONSTANTS.INVALID_EMAIL,
          password: TEST_CONSTANTS.VALID_USER.password,
        },
      });

      expect(response.status()).toBe(422);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject registration with weak password', async ({ request }) => {
      const response = await request.post(`${AUTH_BASE}/register`, {
        data: {
          name: TEST_CONSTANTS.VALID_USER.name,
          email: TEST_CONSTANTS.VALID_USER.email,
          password: TEST_CONSTANTS.WEAK_PASSWORD,
        },
      });

      expect(response.status()).toBe(422);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject registration without name', async ({ request }) => {
      const response = await request.post(`${AUTH_BASE}/register`, {
        data: {
          email: TEST_CONSTANTS.VALID_USER.email,
          password: TEST_CONSTANTS.VALID_USER.password,
        },
      });

      expect(response.status()).toBe(422);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  test.describe('Login', () => {
    test('should reject login with invalid email format', async ({ request }) => {
      const response = await request.post(`${AUTH_BASE}/login`, {
        data: {
          email: TEST_CONSTANTS.INVALID_EMAIL,
          password: TEST_CONSTANTS.VALID_USER.password,
        },
      });

      expect(response.status()).toBe(422);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject login with wrong credentials', async ({ request }) => {
      const response = await request.post(`${AUTH_BASE}/login`, {
        data: {
          email: 'nonexistent@example.com',
          password: 'WrongPass123!',
        },
      });

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  test.describe('Protected Routes', () => {
    test('should reject /me without authentication', async ({ request }) => {
      const response = await request.get(`${AUTH_BASE}/me`);

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject /logout without authentication', async ({ request }) => {
      const response = await request.post(`${AUTH_BASE}/logout`);

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject with invalid token', async ({ request }) => {
      const response = await request.get(`${AUTH_BASE}/me`, {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  test.describe('404 Handling', () => {
    test('should return 404 for unknown routes', async ({ request }) => {
      const response = await request.get('/api/v1/unknown-route');

      expect(response.status()).toBe(404);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });
});

