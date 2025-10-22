import vision from "@google-cloud/vision";
import logger from "../../utils/logger";

const client = new vision.ImageAnnotatorClient();

export const recognizeTextFromImage = async (
  imageUrl: string,
  languageHints: string[] = []
): Promise<string> => {
  try {
    const [result] = await client.documentTextDetection({
      image: { source: { imageUri: imageUrl } },
      imageContext: { languageHints },
    });

    const fullText = result.fullTextAnnotation?.text;

    if (!fullText) {
      throw new Error("No text found in the image.");
    }

    return fullText.trim();
  } catch (error) {
    const err = error as Error;
    logger.error("Google Cloud Vision API Error", {
      error: err.message,
      imageUrl,
    });
    throw new Error("Failed to recognize text using Google Cloud Vision API.");
  }
};
