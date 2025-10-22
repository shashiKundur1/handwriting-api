import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { ApiResponse } from "../utils/apiResponse";

type ValidationSchemas = {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
  file?: ZodSchema;
};

export const validate =
  (schemas: ValidationSchemas) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.validatedParams = await schemas.params.parseAsync(req.params);
      }
      if (schemas.body) {
        req.validatedBody = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.validatedQuery = await schemas.query.parseAsync(req.query);
      }
      if (schemas.file && req.file) {
        req.validatedFile = (await schemas.file.parseAsync(
          req.file
        )) as Express.Multer.File;
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return ApiResponse.error(
          res,
          "Validation failed",
          error.flatten().fieldErrors,
          400
        );
      }
      return next(error);
    }
  };
