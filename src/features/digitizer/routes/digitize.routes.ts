import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../../utils/asyncHandler";
import { digitizeController } from "../controllers/digitize.controller";
import { paginationMiddleware } from "../../../middleware/pagination.middleware";

const router = Router();

const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

router.post("/url", asyncHandler(digitizeController.digitizeByUrl));

router.post(
  "/upload",
  upload.single("image"),
  asyncHandler(digitizeController.digitizeByUpload)
);

router.get(
  "/result/:digitizationId",
  asyncHandler(digitizeController.getDigitizationResult)
);

router.get(
  "/jobs",
  paginationMiddleware,
  asyncHandler(digitizeController.listJobs)
);

router.delete(
  "/result/:digitizationId",
  asyncHandler(digitizeController.deleteJob)
);

export default router;
