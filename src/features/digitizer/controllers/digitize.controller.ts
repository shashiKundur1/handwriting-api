import { Request, Response } from "express";
import mongoose from "mongoose";
import { downloadFileAsBuffer } from "../../../utils/download.util";
import { uploadImageBufferToCloudinary } from "../storage.service";
import { Digitization, IDigitization } from "../digitization.model";
import { digitizationQueue } from "../../../queues/digitizationQueue";
import { ApiResponse } from "../../../utils/apiResponse";
import { digitizeUrlSchema } from "../../../schemas/digitizeUrl.schema";
import { digitizeUploadSchema } from "../../../schemas/digitizeUpload.schema";

class DigitizeController {
  async digitizeByUrl(req: Request, res: Response): Promise<void> {
    const { imageUrl, targetLanguage, sourceLanguage } =
      digitizeUrlSchema.shape.body.parse(req.body);

    const imageBuffer = await downloadFileAsBuffer(imageUrl);
    const cloudinaryUrl = await uploadImageBufferToCloudinary(
      imageBuffer,
      "url-uploads"
    );

    const digitizationDoc = await Digitization.create({
      imageUrl: cloudinaryUrl,
      targetLanguage,
      sourceLanguage,
      status: "pending",
    });

    const digitizationId = String(digitizationDoc._id);

    await digitizationQueue.add("process-digitization", {
      imageUrl: cloudinaryUrl,
      targetLanguage,
      digitizationId,
      sourceLanguage,
    });

    ApiResponse.success(
      res,
      { digitizationId },
      "Digitization job queued successfully.",
      202
    );
  }

  async digitizeByUpload(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      ApiResponse.error(res, "No image file uploaded.", null, 400);
      return;
    }
    digitizeUploadSchema.shape.file.parse(req.file);

    const { targetLanguage, sourceLanguage } =
      digitizeUploadSchema.shape.body.parse(req.body);

    const imageBuffer = req.file.buffer;
    const cloudinaryUrl = await uploadImageBufferToCloudinary(
      imageBuffer,
      "direct-uploads"
    );

    const digitizationDoc = await Digitization.create({
      imageUrl: cloudinaryUrl,
      targetLanguage,
      sourceLanguage,
      status: "pending",
    });

    const digitizationId = String(digitizationDoc._id);

    await digitizationQueue.add("process-digitization", {
      imageUrl: cloudinaryUrl,
      targetLanguage,
      digitizationId,
      sourceLanguage,
    });

    ApiResponse.success(
      res,
      { digitizationId },
      "Digitization job queued successfully.",
      202
    );
  }

  async getDigitizationResult(req: Request, res: Response): Promise<void> {
    const { digitizationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(digitizationId)) {
      ApiResponse.error(res, "Invalid digitization ID format.", null, 400);
      return;
    }

    const digitization = await Digitization.findById(digitizationId);

    if (!digitization) {
      ApiResponse.error(res, "Digitization job not found.", null, 404);
      return;
    }

    ApiResponse.success(
      res,
      digitization,
      "Digitization job fetched successfully.",
      200
    );
  }

  async listJobs(req: Request, res: Response): Promise<void> {
    const { page, limit, skip, filters } = req.paginationAndFilters!;

    const filterQuery: mongoose.FilterQuery<IDigitization> = {};
    if (filters.status) {
      filterQuery.status = filters.status;
    }

    const [jobs, totalJobs] = await Promise.all([
      Digitization.find(filterQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Digitization.countDocuments(filterQuery),
    ]);

    const totalPages = Math.ceil(totalJobs / limit);

    const paginationData = {
      totalJobs,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      appliedFilters: filters,
    };

    ApiResponse.success(
      res,
      { jobs, pagination: paginationData },
      "Jobs fetched successfully"
    );
  }

  async deleteJob(req: Request, res: Response): Promise<void> {
    const { digitizationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(digitizationId)) {
      ApiResponse.error(res, "Invalid digitization ID format.", null, 400);
      return;
    }

    const job = await digitizationQueue.getJob(digitizationId);

    if (job) {
      const state = await job.getState();
      if (state === "active") {
        ApiResponse.error(
          res,
          "Cannot delete a job that is currently being processed.",
          null,
          409
        );
        return;
      }
      await job.remove();
    }

    const deletedDoc = await Digitization.findByIdAndDelete(digitizationId);

    if (!job && !deletedDoc) {
      ApiResponse.error(res, "Digitization job not found.", null, 404);
      return;
    }

    ApiResponse.success(
      res,
      { digitizationId },
      "Digitization job deleted successfully.",
      200
    );
  }
}

export const digitizeController = new DigitizeController();
