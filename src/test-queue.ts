import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/database";
import { digitizationQueue } from "./queues/digitizationQueue";
import { Digitization } from "./features/digitizer/digitization.model";

async function runQueueTest() {
  console.log("Starting queue test...");
  let testDocId: string | null = null;

  try {
    await connectDB();
    console.log("Database connected for test.");

    const newDigitization = new Digitization({
      imageUrl: "https://example.com/queue-test.jpg",
      targetLanguage: "kn",
    });
    const savedDoc = await newDigitization.save();
    testDocId = String(savedDoc._id);
    console.log(`📝 Created dummy document with ID: ${testDocId}`);

    await digitizationQueue.add("test-job", {
      imageUrl: savedDoc.imageUrl,
      targetLanguage: savedDoc.targetLanguage!,
      digitizationId: testDocId,
    });
    console.log("✅ Job added to the queue successfully.");
    console.log(
      "➡️ Now, check your main server terminal to see the worker processing the job."
    );
  } catch (error) {
    console.error("❌ Queue test failed:", error);
  } finally {
    setTimeout(async () => {
      if (testDocId) {
        await Digitization.findByIdAndDelete(testDocId);
        console.log("🗑️ Cleaned up dummy document.");
      }
      await mongoose.disconnect();
      await digitizationQueue.close();
      console.log("Disconnected from database and Redis.");
    }, 5000);
  }
}

runQueueTest();
