import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/database";
import { Digitization } from "./features/digitizer/digitization.model";

async function runDatabaseTest() {
  console.log("Starting database test...");
  let testDocId: string | null = null;

  try {
    await connectDB();
    console.log("Database connected for test.");

    // 1. Test document creation
    const newDigitization = new Digitization({
      imageUrl: "https://example.com/test-image.jpg",
      targetLanguage: "en",
    });
    const savedDoc = await newDigitization.save();
    testDocId = String(savedDoc._id);
    console.log("✅ Document created successfully:", savedDoc);

    // 2. Test document retrieval
    const foundDoc = await Digitization.findById(testDocId);
    console.log("✅ Document retrieved successfully:", foundDoc);

    if (!foundDoc) {
      throw new Error("Could not find the created document.");
    }
  } catch (error) {
    console.error("❌ Database test failed:", error);
  } finally {
    if (testDocId) {
      await Digitization.findByIdAndDelete(testDocId);
      console.log("✅ Test document deleted.");
    }
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
}

runDatabaseTest();
