import pino from 'pino';
import { config, isDevelopment } from '../config/index.js';

const formatters = {
  level: (label: string) => {
    return { level: label };
  },
};

export const logger = pino({
  level: config.LOG_LEVEL,
  formatters,
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname,req,res,responseTime',
        singleLine: true,
      },
    },
  }),
});

export type Logger = typeof logger;

