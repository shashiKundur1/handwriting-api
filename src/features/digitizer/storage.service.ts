import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { ExternalServiceError } from "../../utils/ApiError";
import logger from "../../utils/logger";

cloudinary.config({
  secure: true,
});

export const uploadImageBufferToCloudinary = async (
  imageBuffer: Buffer,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `digitizer-app/${folder}`,
        resource_type: "image",
        timeout: 120000,
      },
      (error, result) => {
        if (error) {
          logger.error("Cloudinary Upload Error", { error });
          return reject(
            new ExternalServiceError("Cloudinary", "Failed to upload image.")
          );
        }
        if (!result) {
          return reject(
            new ExternalServiceError(
              "Cloudinary",
              "Upload result is undefined."
            )
          );
        }
        resolve(result.secure_url);
      }
    );

    const readableStream = Readable.from(imageBuffer);

    readableStream.on("error", (error) => {
      logger.error("Readable stream error", { error });
      reject(error);
    });

    readableStream.pipe(uploadStream);
  });
};
