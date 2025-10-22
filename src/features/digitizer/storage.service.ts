import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

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
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(new Error("Failed to upload image to Cloudinary."));
        }
        if (!result) {
          return reject(new Error("Cloudinary upload result is undefined."));
        }
        resolve(result.secure_url);
      }
    );

    Readable.from(imageBuffer).pipe(uploadStream);
  });
};
