import "dotenv/config";
import { translateText } from "./features/digitizer/translation.service";

async function runTranslationTest() {
  console.log("Starting Google Translate test...");
  const sampleText = "yashu is donkey";
  const targetLanguage = "kan";

  try {
    const translatedResult = await translateText(sampleText, targetLanguage);
    console.log("--- Translation Test Result ---");
    console.log(`Original: ${sampleText}`);
    console.log(`Translated (${targetLanguage}): ${translatedResult}`);
    console.log("-------------------------------");
    console.log("✅ Translation test completed successfully.");
  } catch (error) {
    console.error("❌ Translation test failed:", error);
  }
}

runTranslationTest();
