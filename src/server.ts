import http from "http";
import mongoose from "mongoose";
import app from "./app";
import { connectDB } from "./config/database";
import { config } from "./config/env";
import logger from "./utils/logger";
import { digitizationWorker } from "./workers/digitizationWorker";
import redisConnection from "./config/redis";

async function startServer() {
  let server: http.Server;

  try {
    await connectDB();
    logger.info("✅ Database connected successfully.");

    server = app.listen(config.port, () => {
      logger.info(
        `🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`
      );
    });

    const shutdown = (signal: string) => {
      logger.warn(`Received ${signal}. Starting graceful shutdown...`);

      server.close(async (err) => {
        if (err) {
          logger.error("Error closing HTTP server", { error: err.message });
          process.exit(1);
        }
        logger.info("HTTP server closed.");

        try {
          await digitizationWorker.close();
          logger.info("BullMQ worker closed.");

          await mongoose.disconnect();
          logger.info("MongoDB connection closed.");

          redisConnection.disconnect();
          logger.info("Redis connection closed.");

          logger.info("Graceful shutdown complete.");
          process.exit(0);
        } catch (shutdownErr) {
          const errorMessage =
            shutdownErr instanceof Error
              ? shutdownErr.message
              : "Unknown shutdown error";
          logger.error("Error during graceful shutdown", {
            error: errorMessage,
          });
          process.exit(1);
        }
      });
    };

    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));

    process.on("unhandledRejection", (reason: Error, promise) => {
      logger.error("❌ Unhandled Rejection", {
        promise,
        reason: reason.message,
      });
      server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (error: Error) => {
      logger.error("❌ Uncaught Exception:", {
        message: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error("❌ Failed to start server:", { error: errorMessage });
    process.exit(1);
  }
}

startServer();
