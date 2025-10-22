import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const digitizeUploadSchema = z.object({
  body: z.object({
    targetLanguage: z
      .string()
      .min(2, { message: "Target language must be at least 2 characters" }),
    sourceLanguage: z.preprocess((val) => {
      if (typeof val === "string") {
        return val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (Array.isArray(val)) {
        return val;
      }
      return undefined;
    }, z.array(z.string()).optional()),
  }),
  file: z
    .object({
      mimetype: z.string(),
      size: z.number(),
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.mimetype),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});
