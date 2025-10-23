import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ApiResponse } from "../utils/apiResponse";

const JOB_STATUSES = ["pending", "processing", "completed", "failed"] as const;

const jobListQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional().default("1"),
  limit: z.string().regex(/^\d+$/).optional().default("10"),
  status: z.enum(JOB_STATUSES).optional(),
});

type JobStatus = (typeof JOB_STATUSES)[number];

interface PaginationAndFilterParams {
  page: number;
  limit: number;
  skip: number;
  filters: {
    status?: JobStatus;
  };
}

declare global {
  namespace Express {
    interface Request {
      paginationAndFilters?: PaginationAndFilterParams;
    }
  }
}

export function paginationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const validatedQuery = jobListQuerySchema.parse(req.query);

    let page = parseInt(validatedQuery.page, 10);
    let limit = parseInt(validatedQuery.limit, 10);

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const skip = (page - 1) * limit;

    const filters: { status?: JobStatus } = {};
    if (validatedQuery.status) {
      filters.status = validatedQuery.status;
    }

    req.paginationAndFilters = {
      page,
      limit,
      skip,
      filters,
    };

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      ApiResponse.error(
        res,
        "Invalid query parameters",
        error.flatten().fieldErrors,
        400
      );
      return;
    }
    ApiResponse.error(res, "Invalid request parameters", null, 400);
  }
}
