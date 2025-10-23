import { Worker, Job } from "bullmq";
import redisConnection from "../config/redis";
import { Digitization } from "../features/digitizer/digitization.model";
import { recognizeTextFromImage } from "../features/digitizer/ocr.service";
import { translateText } from "../features/digitizer/translation.service";
import logger from "../utils/logger";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

interface DigitizationJobData {
  imageUrl: string;
  targetLanguage?: string;
  digitizationId: string;
  sourceLanguage?: string[];
}

export const digitizationWorker = new Worker<DigitizationJobData>(
  "digitization",
  async (job: Job<DigitizationJobData>) => {
    const { digitizationId, imageUrl, targetLanguage, sourceLanguage } =
      job.data;

    logger.info(`Processing job for digitization`, {
      jobId: job.id,
      digitizationId,
    });

    try {
      await job.updateProgress(5);
      await Digitization.findByIdAndUpdate(digitizationId, {
        status: "processing",
      });

      await job.updateProgress(25);
      const recognizedText = await recognizeTextFromImage(
        imageUrl,
        sourceLanguage
      );

      if (targetLanguage) {
        logger.info("Translating text", { jobId: job.id, targetLanguage });
        await job.updateProgress(75);
        const { translatedText, detectedLanguageCode } = await translateText(
          recognizedText,
          targetLanguage
        );

        await job.updateProgress(95);
        await Digitization.findByIdAndUpdate(digitizationId, {
          status: "completed",
          recognizedText,
          translatedText,
          detectedLanguage: detectedLanguageCode,
        });
      } else {
        logger.info("Skipping translation step", { jobId: job.id });
        await job.updateProgress(95);
        await Digitization.findByIdAndUpdate(digitizationId, {
          status: "completed",
          recognizedText,
        });
      }
      await job.updateProgress(100);

      return {
        success: true,
        digitizationId,
        translationSkipped: !targetLanguage,
      };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      logger.error(`Job failed`, {
        jobId: job.id,
        digitizationId,
        error: errorMessage,
      });

      await Digitization.findByIdAndUpdate(digitizationId, {
        status: "failed",
        failureReason: errorMessage,
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1,
    autorun: true,
  }
);

digitizationWorker.on("completed", (job, result) => {
  logger.info(`Job completed successfully`, { jobId: job.id, result });
});

digitizationWorker.on("failed", (job, err) => {
  if (job) {
    logger.error(`Job failed after all attempts`, {
      jobId: job.id,
      attemptsMade: job.attemptsMade,
      error: err.message,
    });
  }
});

digitizationWorker.on("active", (job) => {
  logger.info(`Job is now active`, { jobId: job.id });
});

digitizationWorker.on("progress", (job, progress) => {
  logger.info(`Job progress`, { jobId: job.id, progress: `${progress}%` });
});
