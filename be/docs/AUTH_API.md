# Auth API Documentation

Authentication endpoints for user registration, login, and token refresh.

**Base URL:** `/api/v1/auth`

---

## Endpoints

### Register

Create a new user account.

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass1!"
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | 1-100 characters |
| email | string | Yes | Valid email address |
| password | string | Yes | 8-128 chars, must include: uppercase, lowercase, number, special char (`@$!%*?&`) |

**Response (201):**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "confirmationRequired": false
  }
}
```

> **Note:** If email confirmation is enabled in Supabase, `accessToken` and `refreshToken` will be `null` and `confirmationRequired` will be `true`.

**Errors:**

| Status | Code      | Message                                               |
| ------ | --------- | ----------------------------------------------------- |
| 409    | AUTH_1005 | An account with this email already exists             |
| 422    | VAL_2001  | Validation error (invalid email, weak password, etc.) |

---

### Login

Authenticate with email and password.

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass1!"
  }'
```

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**

| Status | Code      | Message                   |
| ------ | --------- | ------------------------- |
| 401    | AUTH_1001 | Invalid email or password |
| 422    | VAL_2001  | Validation error          |

---

### Refresh Token

Get a new access token using a refresh token.

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| refreshToken | string | Yes |

**Response (200):**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**

| Status | Code      | Message          |
| ------ | --------- | ---------------- |
| 401    | AUTH_1004 | Invalid token    |
| 422    | VAL_2001  | Validation error |

---

## Error Codes

| Code      | Description                          |
| --------- | ------------------------------------ |
| AUTH_1001 | Invalid credentials                  |
| AUTH_1002 | Unauthorized (missing/invalid token) |
| AUTH_1003 | Token expired                        |
| AUTH_1004 | Invalid token                        |
| AUTH_1005 | Email already exists                 |
| VAL_2001  | Validation error                     |

---

## Usage with Protected Endpoints

After login/register, include the access token in subsequent requests:

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

When the access token expires, use the refresh endpoint to obtain new tokens.
