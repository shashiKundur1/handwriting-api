import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.string().url(),
  JWT_SECRET: z.string().min(10),
  CLIENT_ORIGIN: z.string().optional().default("*"),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1),
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
};
