import IORedis from "ioredis";
import { config } from "./env";
import logger from "../utils/logger";

const redisConnection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on("connect", () => {
  logger.info("✅ Connected to Redis");
});

redisConnection.on("error", (err) => {
  logger.error("❌ Redis connection error:", { error: err.message });
});

export default redisConnection;
