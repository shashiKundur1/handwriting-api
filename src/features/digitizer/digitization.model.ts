import mongoose, { Document, Schema } from "mongoose";

export interface IDigitization extends Document {
  status: "pending" | "processing" | "completed" | "failed";
  imageUrl: string;
  originalLanguage: string | null;
  recognizedText: string | null;
  translatedText: string | null;
  targetLanguage: string | null;
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
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    originalLanguage: {
      type: String,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

// Create and export the Mongoose model
export const Digitization = mongoose.model<IDigitization>(
  "Digitization",
  digitizationSchema
);
