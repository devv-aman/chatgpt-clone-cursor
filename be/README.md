# ChatGPT Clone Backend

A production-ready Express.js backend API built with TypeScript, Supabase Auth, and modern best practices.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Jest, Supertest, Playwright

## Project Structure

```
be/
├── src/
│   ├── config/          # Environment configuration with Zod validation
│   ├── constants/       # API routes, strings, error messages
│   ├── db/              # Supabase client and database types
│   ├── middleware/      # Auth, error, logger, validation middleware
│   ├── modules/         # Feature modules (auth, etc.)
│   ├── types/           # TypeScript types and Express augmentation
│   ├── utils/           # Logger and error utilities
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── supabase/
│   └── migrations/      # SQL migration files
├── tests/
│   ├── unit/            # Unit tests (Jest)
│   ├── integration/     # Integration tests (Supertest)
│   └── e2e/             # End-to-end tests (Playwright)
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm package manager
- Supabase project

### Installation

1. Clone the repository and navigate to the backend directory:

```bash
cd be
```

2. Install dependencies:

```bash
pnpm install
```

3. Copy the environment example file:

```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-publishable-key
SUPABASE_SECRET_KEY=sb_secret_your-secret-key
JWT_SECRET=your-jwt-secret-minimum-32-characters-long
```

5. Run the database migration in your Supabase project:

```sql
-- Copy and run the contents of supabase/migrations/001_initial_schema.sql
-- in your Supabase SQL editor
```

### Development

Start the development server with hot reload:

```bash
pnpm dev
```

The server will start on `http://localhost:3000`.

### API Documentation

Swagger UI is available at `http://localhost:3000/api-docs` when the server is running.

To generate/update the `swagger.json` file:

```bash
pnpm swagger:generate
```

### Production Build

Build the TypeScript code:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## API Endpoints

### Documentation

| Method | Endpoint         | Description                  |
| ------ | ---------------- | ---------------------------- |
| GET    | `/api-docs`      | Swagger UI documentation     |
| GET    | `/api-docs.json` | OpenAPI specification (JSON) |

### Health Check

| Method | Endpoint  | Description         |
| ------ | --------- | ------------------- |
| GET    | `/health` | Check server status |

### Authentication

| Method | Endpoint                | Description              | Auth Required |
| ------ | ----------------------- | ------------------------ | ------------- |
| POST   | `/api/v1/auth/register` | Register a new user      | No            |
| POST   | `/api/v1/auth/login`    | Login user               | No            |
| POST   | `/api/v1/auth/logout`   | Logout user              | Yes           |
| GET    | `/api/v1/auth/me`       | Get current user details | Yes           |

### Request/Response Examples

#### Register

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Get Current User

```bash
GET /api/v1/auth/me
Authorization: Bearer <access-token>
```

## Testing

### Unit Tests

```bash
pnpm test:unit
```

### Integration Tests

```bash
pnpm test:integration
```

### All Tests

```bash
pnpm test
```

### Test Coverage

```bash
pnpm test:coverage
```

### E2E Tests

First, install Playwright browsers:

```bash
pnpm exec playwright install
```

Run E2E tests:

```bash
pnpm test:e2e
```

## Environment Variables

| Variable                   | Description                               | Required | Default               |
| -------------------------- | ----------------------------------------- | -------- | --------------------- |
| `NODE_ENV`                 | Environment (development/production/test) | No       | development           |
| `PORT`                     | Server port                               | No       | 3000                  |
| `SUPABASE_URL`             | Supabase project URL                      | Yes      | -                     |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (client-side)    | Yes      | -                     |
| `SUPABASE_SECRET_KEY`      | Supabase secret key (server-side only)    | Yes      | -                     |
| `JWT_SECRET`               | JWT secret (min 32 chars)                 | Yes      | -                     |
| `LOG_LEVEL`                | Logging level                             | No       | info                  |
| `CORS_ORIGIN`              | Allowed CORS origin                       | No       | http://localhost:5173 |

## Database Schema

The backend uses three main tables:

- **profiles**: User profile data (linked to Supabase Auth)
- **chats**: Chat sessions for each user
- **messages**: Individual messages within chats

All tables include Row Level Security (RLS) policies to ensure users can only access their own data.

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## License

MIT
