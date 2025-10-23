import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import { config } from "./config/env";
import mainRouter from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
import redisConnection from "./config/redis";

const app: Application = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: { action: "deny" },
    hsts:
      config.nodeEnv === "production"
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
  })
);

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
app.get("/health", async (_req: Request, res: Response) => {
  const healthCheck = {
    uptime: process.uptime(),
    status: "ok",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    dependencies: {
      database: { status: "up", message: "Connected" },
      redis: { status: "up", message: "Connected" },
    },
  };

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
      throw new Error("MongoDB not connected");
    }
    await mongoose.connection.db.admin().ping();

    // Check Redis connection
    const redisPing = await redisConnection.ping();
    if (redisPing !== "PONG") {
      throw new Error("Redis not responding correctly");
    }

    res.status(200).json(healthCheck);
  } catch (error) {
    const err = error as Error;
    healthCheck.status = "error";
    healthCheck.message = "Server is unhealthy";

    if (err.message.includes("MongoDB")) {
      healthCheck.dependencies.database = {
        status: "down",
        message: err.message,
      };
    } else if (err.message.includes("Redis")) {
      healthCheck.dependencies.redis = { status: "down", message: err.message };
    }

    res.status(503).json(healthCheck);
  }
});

// Main API routes
app.use("/api/v1", apiLimiter, mainRouter);

// 404 Not Found handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url}`,
  });
});

app.use(errorHandler);

export default app;
