import { Queue } from "bullmq";
import redisConnection from "../config/redis";

export const deadLetterQueue = new Queue("digitization-dlq", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: {
      age: 30 * 24 * 3600,
    },
    removeOnFail: {
      age: 30 * 24 * 3600,
    },
  },
});
