import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient();

export const recognizeTextFromImage = async (
  imagePath: string
): Promise<string> => {
  try {
    const [result] = await client.documentTextDetection({
      image: { source: { filename: imagePath } },
      imageContext: { languageHints: ["en", "hi", "kn"] },
    });

    const fullText = result.fullTextAnnotation?.text;

    if (!fullText) {
      console.warn("No text found in the image by Google Cloud Vision.");
      return "";
    }

    return fullText.trim();
  } catch (error) {
    console.error("Google Cloud Vision API Error:", error);
    throw new Error("Failed to recognize text using Google Cloud Vision API.");
  }
};
