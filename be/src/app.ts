import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { config, isDevelopment } from './config/index.js';
import { swaggerSpec, SWAGGER_CONSTANTS } from './config/swagger.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { authRouter } from './modules/auth/index.js';
import { settingsRouter } from './modules/settings/index.js';
import { chatRouter, chatsRouter } from './modules/chat/index.js';
import { API_CONFIG, API_ROUTES, HTTP_STATUS } from './constants/api.js';
import { STRINGS } from './constants/strings.js';
import type { ApiResponse } from './types/common.types.js';

export const createApp = (): Express => {
  const app = express();

  // Security middleware - configure for Swagger UI
  if (isDevelopment) {
    // Disable CSP in development for Swagger UI
    app.use(helmet({ contentSecurityPolicy: false }));
  } else {
    app.use(helmet());
  }

  // CORS configuration
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request logging
  app.use(requestLogger);

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Swagger documentation
  app.use(
    SWAGGER_CONSTANTS.DOCS_PATH,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: STRINGS.APP.NAME,
    })
  );

  // Swagger JSON endpoint
  app.get(SWAGGER_CONSTANTS.JSON_PATH, (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Health check
   *     description: Check if the API server is running
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Server is healthy
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HealthResponse'
   */
  app.get(API_ROUTES.HEALTH, (_req, res) => {
    const response: ApiResponse<{ status: string }> = {
      success: true,
      message: STRINGS.HEALTH.MESSAGE,
      data: { status: STRINGS.HEALTH.OK },
    };
    res.status(HTTP_STATUS.OK).json(response);
  });

  // API routes
  app.use(`${API_CONFIG.FULL_PREFIX}${API_ROUTES.AUTH.BASE}`, authRouter);
  app.use(`${API_CONFIG.FULL_PREFIX}${API_ROUTES.SETTINGS.BASE}`, settingsRouter);
  app.use(`${API_CONFIG.FULL_PREFIX}${API_ROUTES.CHAT.BASE}`, chatRouter);
  app.use(`${API_CONFIG.FULL_PREFIX}${API_ROUTES.CHATS.BASE}`, chatsRouter);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};
