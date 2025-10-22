import axios from "axios";

export const downloadFileAsBuffer = async (url: string): Promise<Buffer> => {
  const response = await axios.get<ArrayBuffer>(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
};
