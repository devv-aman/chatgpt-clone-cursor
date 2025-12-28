// Jest setup file for all tests

// Set test environment variables BEFORE any imports
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '3001';
process.env['SUPABASE_URL'] = 'https://test-project.supabase.co';
process.env['SUPABASE_PUBLISHABLE_KEY'] = 'sb_publishable_test-key-for-testing';
process.env['SUPABASE_SECRET_KEY'] = 'sb_secret_test-key-for-testing-only';
process.env['JWT_SECRET'] = 'test-jwt-secret-minimum-32-chars-long';
process.env['LOG_LEVEL'] = 'fatal'; // Use 'fatal' to minimize logging during tests
process.env['CORS_ORIGIN'] = 'http://localhost:5173';

// Increase timeout for async operations
jest.setTimeout(30000);

// Global test utilities
beforeAll(() => {
  // Setup before all tests
});

afterAll(() => {
  // Cleanup after all tests
});

beforeEach(() => {
  // Reset before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});
