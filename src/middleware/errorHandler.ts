import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/apiResponse";
import { config } from "../config/env";
import logger from "../utils/logger";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred on the server.";

  logger.error(message, {
    statusCode,
    stack: err.stack,
    name: err.name,
  });

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    return ApiResponse.error(res, "Validation Error", { errors }, 400);
  }

  if (err instanceof ZodError) {
    const errors = err.flatten().fieldErrors;
    return ApiResponse.error(res, "Invalid request data", { errors }, 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for '${field}' field, please choose another value`;
    return ApiResponse.error(res, message, null, 409);
  }

  const errorDetails =
    config.nodeEnv === "development" ? { stack: err.stack } : null;

  return ApiResponse.error(res, message, errorDetails, statusCode);
};
