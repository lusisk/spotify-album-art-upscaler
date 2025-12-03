import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const { shareId, imageData, albumName } = await request.json();

    if (!shareId || !imageData || !albumName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const base64Data = imageData.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const blob = await put(`${shareId}.png`, buffer, {
      access: "public",
      addRandomSuffix: false,
    });

    console.log(
      `Uploaded ${(buffer.length / 1024 / 1024).toFixed(2)}MB to Blob Storage`
    );

    return NextResponse.json({
      success: true,
      blobUrl: blob.url,
    });
  } catch (error) {
    console.error("Error storing shared image:", error);
    return NextResponse.json(
      { error: "Failed to store image" },
      { status: 500 }
    );
  }
}
