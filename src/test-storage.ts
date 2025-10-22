import "dotenv/config";
import path from "path";
import { uploadImageToCloudinary } from "./features/digitizer/storage.service";

async function runStorageTest() {
  console.log("Starting Cloudinary storage test...");
  const imagePath = path.resolve(__dirname, "../test-assets/sample-image.png");

  try {
    const imageUrl = await uploadImageToCloudinary(imagePath, "test-uploads");
    console.log("--- Cloudinary Test Result ---");
    console.log("Image uploaded successfully! URL:", imageUrl);
    console.log("----------------------------");
    console.log("✅ Storage test completed successfully.");
  } catch (error) {
    console.error("❌ Storage test failed:", error);
  }
}

runStorageTest();
