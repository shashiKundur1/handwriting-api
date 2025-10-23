import mongoose, { Document, Schema } from "mongoose";

export interface IDigitization extends Document {
  status: "pending" | "processing" | "completed" | "failed";
  imageUrl: string;
  sourceLanguage: string[];
  detectedLanguage: string | null; // <-- Added
  recognizedText: string | null;
  translatedText?: string | null;
  targetLanguage?: string | null;
  failureReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const digitizationSchema: Schema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      required: [true, "Status is required"],
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    sourceLanguage: {
      type: [String],
      default: [],
    },
    detectedLanguage: {
      type: String,
      default: null,
    },
    recognizedText: {
      type: String,
      default: null,
    },
    translatedText: {
      type: String,
      default: null,
    },
    targetLanguage: {
      type: String,
      trim: true,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Digitization = mongoose.model<IDigitization>(
  "Digitization",
  digitizationSchema
);
