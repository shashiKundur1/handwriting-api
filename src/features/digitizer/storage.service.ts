import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true,
});

export const uploadImageToCloudinary = async (
  imagePath: string,
  folder: string
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: `digitizer-app/${folder}`,
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    });

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Failed to upload image to Cloudinary.");
  }
};
