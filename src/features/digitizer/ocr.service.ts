import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient();

export const recognizeTextFromImage = async (
  imageUrl: string
): Promise<string> => {
  try {
    const [result] = await client.documentTextDetection({
      image: { source: { imageUri: imageUrl } },
      imageContext: { languageHints: ["en", "hi", "kn"] },
    });

    const fullText = result.fullTextAnnotation?.text;

    if (!fullText) {
      throw new Error(
        "Failed to recognize text using Google Cloud Vision API."
      );
    }

    return fullText.trim();
  } catch (error) {
    console.error("Google Cloud Vision API Error:", error);
    throw new Error("Failed to recognize text using Google Cloud Vision API.");
  }
};
