import axios from "axios";
import { ApiResponse } from "@/utils/api-response";

export async function POST(req: Request) {
  const { imageUrl } = await req.json();

  if (!imageUrl) {
    return ApiResponse.badRequest("Image URL is required");
  }

  try {
    console.log("Starting upscale for:", imageUrl);

    const { data: imageData, headers } = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    console.log("Image fetched, size:", imageData.byteLength);

    const base64 = Buffer.from(imageData).toString("base64");
    const contentType = headers["content-type"] || "image/jpeg";
    const dataUrl = `data:${contentType};base64,${base64}`;

    return ApiResponse.success({
      originalUrl: dataUrl,
      needsClientUpscale: true,
    });
  } catch (error) {
    console.error("Upscale error:", error);
    return ApiResponse.serverError(
      error instanceof Error ? error.message : "Failed to upscale image"
    );
  }
}
