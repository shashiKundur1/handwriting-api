import { TranslationServiceClient } from "@google-cloud/translate";
import { config } from "../../config/env";

const client = new TranslationServiceClient();

export const translateText = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  const request = {
    parent: `projects/${config.googleCloudProject}/locations/global`,
    contents: [text],
    mimeType: "text/plain",
    targetLanguageCode: targetLanguage,
  };

  try {
    const [response] = await client.translateText(request);
    const translation = response.translations?.[0]?.translatedText;

    if (!translation) {
      throw new Error("Received an empty translation result.");
    }

    return translation;
  } catch (error) {
    console.error("Google Translate API Error:", error);
    throw new Error("Failed to translate text using Google Translate API.");
  }
};
