import type { RequestHandler } from 'express';
import type { ZodTypeAny, z } from 'zod';

interface ValidateSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Factory: run the supplied Zod schemas against the incoming request and
 * replace the original values with the parsed (coerced, defaulted) output.
 *
 * Throws ZodError on failure — the global error handler turns that into a
 * 400 response.
 */
export const validate = (schemas: ValidateSchemas): RequestHandler =>
  (req, _res, next) => {
    try {
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.body) req.body = schemas.body.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };

export type Infer<T extends ZodTypeAny> = z.infer<T>;
