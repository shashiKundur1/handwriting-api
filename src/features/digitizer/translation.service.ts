import { TranslationServiceClient } from "@google-cloud/translate";
import { config } from "../../config/env";
import logger from "../../utils/logger";

const client = new TranslationServiceClient();

interface TranslationResult {
  translatedText: string;
  detectedLanguageCode: string | null;
}

export const translateText = async (
  text: string,
  targetLanguage: string
): Promise<TranslationResult> => {
  const request = {
    parent: `projects/${config.googleCloudProject}/locations/global`,
    contents: [text],
    mimeType: "text/plain",
    targetLanguageCode: targetLanguage,
  };

  try {
    const [response] = await client.translateText(request);
    const firstResult = response.translations?.[0];
    const translatedText = firstResult?.translatedText;
    const detectedLanguageCode = firstResult?.detectedLanguageCode || null;

    if (!translatedText) {
      throw new Error("Received an empty translation result.");
    }

    return { translatedText, detectedLanguageCode };
  } catch (error) {
    const err = error as Error;
    logger.error("Google Translate API Error", { error: err.message });
    throw new Error("Failed to translate text using Google Translate API.");
  }
};
