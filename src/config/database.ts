import mongoose from "mongoose";
import { config } from "./env";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri);

    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination (SIGINT)");
      process.exit(0);
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Failed to connect to MongoDB:", errorMessage);
    process.exit(1);
  }
}
