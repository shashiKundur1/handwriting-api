import { Router, Request, Response } from "express";
import multer from "multer";
import mongoose from "mongoose"; // Import mongoose to validate ObjectId
import { asyncHandler } from "../../../utils/asyncHandler";
import { downloadFileAsBuffer } from "../../../utils/download.util";
import { uploadImageBufferToCloudinary } from "../storage.service";
import { Digitization } from "../digitization.model";
import { digitizationQueue } from "../../../queues/digitizationQueue";
import { ApiResponse } from "../../../utils/apiResponse"; // Import ApiResponse

const router = Router();

// Configure Multer for in-memory storage
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

// --- Route for Uploading by URL ---
interface DigitizeByUrlBody {
  imageUrl: string;
  targetLanguage: string;
}

router.post(
  "/url",
  asyncHandler(
    async (req: Request<{}, {}, DigitizeByUrlBody>, res: Response) => {
      const { imageUrl, targetLanguage } = req.body;

      const imageBuffer = await downloadFileAsBuffer(imageUrl);
      const cloudinaryUrl = await uploadImageBufferToCloudinary(
        imageBuffer,
        "url-uploads"
      );

      const digitizationDoc = await Digitization.create({
        imageUrl: cloudinaryUrl,
        targetLanguage,
        status: "pending",
      });

      const digitizationId = String(digitizationDoc._id);

      await digitizationQueue.add("process-digitization", {
        imageUrl: cloudinaryUrl,
        targetLanguage,
        digitizationId,
      });

      ApiResponse.success(
        res,
        { digitizationId },
        "Digitization job queued successfully.",
        202
      );
    }
  )
);

// --- Route for Direct File Upload ---
interface DigitizeByUploadBody {
  targetLanguage: string;
}

router.post(
  "/upload",
  upload.single("image"), // Multer middleware for a single file in a field named 'image'
  asyncHandler(
    async (req: Request<{}, {}, DigitizeByUploadBody>, res: Response) => {
      if (!req.file) {
        return ApiResponse.error(res, "No image file uploaded.", null, 400);
      }

      const { targetLanguage } = req.body;
      const imageBuffer = req.file.buffer;

      const cloudinaryUrl = await uploadImageBufferToCloudinary(
        imageBuffer,
        "direct-uploads"
      );

      const digitizationDoc = await Digitization.create({
        imageUrl: cloudinaryUrl,
        targetLanguage,
        status: "pending",
      });

      const digitizationId = String(digitizationDoc._id);

      await digitizationQueue.add("process-digitization", {
        imageUrl: cloudinaryUrl,
        targetLanguage,
        digitizationId,
      });

      ApiResponse.success(
        res,
        { digitizationId },
        "Digitization job queued successfully.",
        202
      );
    }
  )
);

// --- NEW Route to Get Results by ID ---
router.get(
  "/result/:digitizationId",
  asyncHandler(async (req: Request, res: Response) => {
    const { digitizationId } = req.params;

    // Optional: Validate ObjectId format for robustness
    if (!mongoose.Types.ObjectId.isValid(digitizationId)) {
      return ApiResponse.error(
        res,
        "Invalid digitization ID format.",
        null,
        400
      );
    }

    const digitization = await Digitization.findById(digitizationId);

    if (!digitization) {
      return ApiResponse.error(res, "Digitization job not found.", null, 404);
    }

    // Return the full job document
    ApiResponse.success(
      res,
      digitization,
      "Digitization job fetched successfully.",
      200
    );
  })
);

export default router;
