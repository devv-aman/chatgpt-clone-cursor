import type { IncomingMessage, ServerResponse } from 'http';
import { pinoHttp, type Options } from 'pino-http';
import { logger } from '../utils/logger.js';

// Extended request type to access raw body if needed
interface ExtendedRequest extends IncomingMessage {
  body?: unknown;
}

const options: Options = {
  logger,
  // Log all requests
  autoLogging: true,
  customLogLevel: (
    _req: IncomingMessage,
    res: ServerResponse,
    err: Error | undefined
  ) => {
    if (res.statusCode >= 500 || err) {
      return 'error';
    } else if (res.statusCode >= 400) {
      return 'warn';
    }
    return 'info';
  },
  // Clean log message: METHOD /path - STATUS
  customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
    return `${req.method} ${req.url} - ${res.statusCode}`;
  },
  customErrorMessage: (
    req: IncomingMessage,
    res: ServerResponse,
    err: Error
  ) => {
    return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
  },
  // Add request details for errors via customProps
  customProps: (req: IncomingMessage, res: ServerResponse) => {
    const extReq = req as ExtendedRequest;
    // Only include details for 4xx and 5xx responses
    if (res.statusCode >= 400) {
      return {
        request: {
          method: req.method,
          url: req.url,
          headers: {
            'content-type': req.headers['content-type'],
            'user-agent': req.headers['user-agent'],
          },
          body: extReq.body,
        },
        response: {
          statusCode: res.statusCode,
        },
      };
    }
    return {};
  },
  // Don't use default req/res serializers
  serializers: {
    req: () => undefined,
    res: () => undefined,
  },
};

export const requestLogger = pinoHttp(options);
