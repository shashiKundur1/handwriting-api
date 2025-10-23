import dotenv from "dotenv";
import { z } from "zod";
import fs from "fs";
import path from "path";

dotenv.config();

if (
  process.env.NODE_ENV === "production" &&
  process.env.GCP_CREDENTIALS_BASE64
) {
  const decodedKey = Buffer.from(
    process.env.GCP_CREDENTIALS_BASE64,
    "base64"
  ).toString("utf-8");
  const keyFilePath = path.join(__dirname, "gcp-key.json");
  fs.writeFileSync(keyFilePath, decodedKey);

  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyFilePath;
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.string().url(),
  JWT_SECRET: z.string().min(10),
  CLIENT_ORIGIN: z.string().optional().default("*"),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1),
  CLOUDINARY_URL: z.string().url(),
  GOOGLE_CLOUD_PROJECT: z.string().min(1),
  REDIS_URL: z.string().url(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables.");
}

export const config = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  mongoUri: parsedEnv.data.MONGO_URI,
  jwtSecret: parsedEnv.data.JWT_SECRET,
  clientOrigin: parsedEnv.data.CLIENT_ORIGIN,
  googleAppCreds: parsedEnv.data.GOOGLE_APPLICATION_CREDENTIALS,
  cloudinaryUrl: parsedEnv.data.CLOUDINARY_URL,
  googleCloudProject: parsedEnv.data.GOOGLE_CLOUD_PROJECT,
  redisUrl: parsedEnv.data.REDIS_URL,
};
