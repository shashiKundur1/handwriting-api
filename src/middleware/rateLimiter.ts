import rateLimit from "express-rate-limit";
import { ApiResponse } from "../utils/apiResponse";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      "Too many requests from this IP, please try again after 15 minutes.",
      null,
      429
    );
  },
});
