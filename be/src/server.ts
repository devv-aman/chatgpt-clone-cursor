import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { STRINGS } from './constants/strings.js';

const startServer = (): void => {
  const app = createApp();

  const server = app.listen(config.PORT, () => {
    logger.info(`${STRINGS.SERVER.STARTED} ${config.PORT}`);
    logger.info(`Environment: ${config.NODE_ENV}`);
  });

  // Graceful shutdown handlers
  const gracefulShutdown = (signal: string): void => {
    logger.info(`${signal} received. ${STRINGS.SERVER.SHUTDOWN}`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error({ reason }, 'Unhandled Promise Rejection');
    throw reason;
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.fatal({ error }, 'Uncaught Exception');
    process.exit(1);
  });
};

startServer();

