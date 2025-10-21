import app from "./app";
import { connectDB } from "./config/database";
import { config } from "./config/env";

async function startServer() {
  try {
    await connectDB();
    console.log("✅ Database connected successfully.");

    const server = app.listen(config.port, () => {
      console.log(
        `🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`
      );
    });

    process.on("unhandledRejection", (reason: any, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (error: Error) => {
      console.error("❌ Uncaught Exception:", error.message);
      process.exit(1);
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Failed to start server:", errorMessage);
    process.exit(1);
  }
}

startServer();
