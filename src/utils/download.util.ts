import axios from "axios";
import { ApiError } from "./ApiError";

export const downloadFileAsBuffer = async (url: string): Promise<Buffer> => {
  const response = await axios.get<ArrayBuffer>(url, {
    responseType: "arraybuffer",
  });

  const contentType = response.headers["content-type"];
  if (!contentType || !contentType.startsWith("image/")) {
    throw new ApiError(400, "Invalid URL: Content-Type is not an image.");
  }

  return Buffer.from(response.data);
};
