import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
// import { ApiResponse } from "../utils/apiResponse";
import { config } from "../config/env";
import logger from "../utils/logger";
import { ApiError } from "../utils/ApiError";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "An unexpected error occurred on the server.";
  let errors: any = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = err.flatten().fieldErrors;
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    statusCode = 409; // Conflict
    message = `Duplicate value for field: ${field}`;
  }

  logger.error(message, {
    statusCode,
    error: err,
    stack: config.nodeEnv === "development" ? err.stack : undefined,
  });

  const errorResponse = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(errorResponse);
};
