import { Queue } from "bullmq";
import IORedis from "ioredis";
import { config } from "../config/env";

const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

connection.on("connect", () => {
  console.log("✅ Connected to Redis");
});

connection.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export const digitizationQueue = new Queue("digitization", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 86400,
      count: 100,
    },
    removeOnFail: {
      age: 604800,
    },
  },
});
