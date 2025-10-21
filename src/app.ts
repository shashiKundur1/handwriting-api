import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config/env";
import mainRouter from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

// Security middleware - should be applied early
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.nodeEnv === "development" ? "*" : config.clientOrigin,
    credentials: true,
  })
);

// Logging middleware - only in development
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Main API routes
app.use("/api/v1", mainRouter);

// 404 Not Found handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// Global error handler (must be the last middleware)
app.use(errorHandler);

export default app;
