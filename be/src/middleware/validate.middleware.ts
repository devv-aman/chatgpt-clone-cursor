import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodSchema, ZodTypeDef } from 'zod';

export interface ValidationSchemas {
  body?: ZodSchema<unknown, ZodTypeDef, unknown>;
  query?: ZodSchema<unknown, ZodTypeDef, unknown>;
  params?: ZodSchema<unknown, ZodTypeDef, unknown>;
}

export const validate = (schemas: ValidationSchemas): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        const parsedQuery = await schemas.query.parseAsync(req.query);
        Object.assign(req.query, parsedQuery);
      }
      if (schemas.params) {
        const parsedParams = await schemas.params.parseAsync(req.params);
        Object.assign(req.params, parsedParams);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
