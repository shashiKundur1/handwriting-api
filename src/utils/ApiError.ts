export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, identifier: string) {
    super(404, `${resource} with ID '${identifier}' not found.`);
  }
}

export class ExternalServiceError extends ApiError {
  constructor(serviceName: string, message: string = "An error occurred") {
    super(502, `[${serviceName}]: ${message}`);
  }
}
