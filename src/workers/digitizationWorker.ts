import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { config } from "../config/env";

// Define job data interface
interface DigitizationJobData {
  imageUrl: string;
  targetLanguage: string;
  digitizationId: string;
}

const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const digitizationWorker = new Worker<DigitizationJobData>(
  "digitization",
  async (job: Job<DigitizationJobData>) => {
    console.log(
      `⚙️ Processing job ${job.id} for digitization ${job.data.digitizationId}`
    );

    await job.updateProgress(10);
    console.log(`Job ${job.id}: Calling OCR for ${job.data.imageUrl}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const recognizedText = "Simulated Recognized Text";

    await job.updateProgress(50);
    console.log(
      `Job ${job.id}: Translating text to ${job.data.targetLanguage}`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const translatedText = "Simulated Translated Text";

    await job.updateProgress(90);
    console.log(
      `Job ${job.id}: Updating database for ${job.data.digitizationId}`
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    await job.updateProgress(100);

    return {
      success: true,
      digitizationId: job.data.digitizationId,
      recognizedText,
      translatedText,
    };
  },
  {
    connection,
    concurrency: 1, // Start with 1 to easily see logs
    autorun: true,
  }
);

digitizationWorker.on("completed", (job, result) => {
  console.log(`✅ Job ${job.id} completed successfully:`, result);
});

digitizationWorker.on("failed", (job, err) => {
  if (job) {
    console.error(
      `❌ Job ${job.id} failed after ${job.attemptsMade} attempts:`,
      err.message
    );
  }
});

digitizationWorker.on("active", (job) => {
  console.log(`⚙️ Job ${job.id} is now active`);
});

digitizationWorker.on("progress", (job, progress) => {
  console.log(`📊 Job ${job.id} progress: ${progress}%`);
});
