import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { config } from "../config/env";
import { Digitization } from "../features/digitizer/digitization.model";
import { recognizeTextFromImage } from "../features/digitizer/ocr.service";
import { translateText } from "../features/digitizer/translation.service";

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
    const { digitizationId, imageUrl, targetLanguage } = job.data;
    console.log(
      `⚙️ Processing job ${job.id} for digitization ${digitizationId}`
    );

    try {
      await job.updateProgress(5);
      await Digitization.findByIdAndUpdate(digitizationId, {
        status: "processing",
      });

      await job.updateProgress(25);
      const recognizedText = await recognizeTextFromImage(imageUrl);

      await job.updateProgress(75);
      const translatedText = await translateText(
        recognizedText,
        targetLanguage
      );

      await job.updateProgress(95);
      await Digitization.findByIdAndUpdate(digitizationId, {
        status: "completed",
        recognizedText,
        translatedText,
      });
      await job.updateProgress(100);

      return { success: true, digitizationId };
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      await Digitization.findByIdAndUpdate(digitizationId, {
        status: "failed",
      });
      throw error;
    }
  },
  {
    connection,
    concurrency: 1,
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
