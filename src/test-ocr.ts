import "dotenv/config";
import path from "path";
import { recognizeTextFromImage } from "./features/digitizer/ocr.service";

async function runOcrTest() {
  console.log("Starting Google Cloud Vision OCR test...");
  const imagePath = path.resolve(
    __dirname,
    "../test-assets/sample-image-2.png"
  );

  try {
    const recognizedText = await recognizeTextFromImage(imagePath);
    console.log("--- OCR Test Result ---");
    console.log(recognizedText);
    console.log("-----------------------");
    console.log("✅ OCR test completed successfully.");
  } catch (error) {
    console.error("❌ OCR test failed:", error);
  }
}

runOcrTest();
