import swaggerJsdoc from 'swagger-jsdoc';
import { API_CONFIG } from '../constants/api.js';
import { STRINGS } from '../constants/strings.js';

const SWAGGER_CONSTANTS = {
  OPENAPI_VERSION: '3.0.0',
  API_VERSION: '1.0.0',
  DOCS_PATH: '/api-docs',
  JSON_PATH: '/api-docs.json',
} as const;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: SWAGGER_CONSTANTS.OPENAPI_VERSION,
    info: {
      title: STRINGS.APP.NAME,
      version: SWAGGER_CONSTANTS.API_VERSION,
      description: STRINGS.APP.DESCRIPTION,
      contact: {
        name: 'API Support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:3000${API_CONFIG.PREFIX}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        UnauthorizedError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Invalid email or password',
                },
                code: {
                  type: 'string',
                  example: 'AUTH_1001',
                },
                statusCode: {
                  type: 'integer',
                  example: 401,
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },
          },
        },
        ConflictError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'An account with this email already exists',
                },
                code: {
                  type: 'string',
                  example: 'AUTH_1005',
                },
                statusCode: {
                  type: 'integer',
                  example: 409,
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'email: Invalid email address',
                },
                code: {
                  type: 'string',
                  example: 'VAL_2001',
                },
                statusCode: {
                  type: 'integer',
                  example: 422,
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      path: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                      message: {
                        type: 'string',
                      },
                    },
                  },
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },
          },
        },
        NotFoundError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Resource not found',
                },
                code: {
                  type: 'string',
                  example: 'RES_4001',
                },
                statusCode: {
                  type: 'integer',
                  example: 404,
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              example: 'user',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Login successful',
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User',
                },
                accessToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                refreshToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
          },
        },
        RegisterResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'User registered successfully',
              description: 'Message varies based on whether email confirmation is required',
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User',
                },
                accessToken: {
                  type: 'string',
                  nullable: true,
                  description: 'Only present if email confirmation is not required',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                refreshToken: {
                  type: 'string',
                  nullable: true,
                  description: 'Only present if email confirmation is not required',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                confirmationRequired: {
                  type: 'boolean',
                  description: 'True if email confirmation is required before login',
                  example: false,
                },
              },
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              minLength: 8,
              maxLength: 128,
              description: 'Must contain uppercase, lowercase, number, and special character',
              example: 'SecurePass123!',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              example: 'SecurePass123!',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'User details fetched successfully',
            },
            data: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Service is running',
            },
            data: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'OK',
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
export { SWAGGER_CONSTANTS };

