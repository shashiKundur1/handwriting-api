import { z } from "zod";

export const digitizeUrlSchema = z.object({
  body: z.object({
    imageUrl: z.string().url({ message: "A valid image URL is required" }),
    targetLanguage: z
      .string()
      .min(2, { message: "Target language must be at least 2 characters" }),
    sourceLanguage: z.array(z.string()).optional(),
  }),
});
