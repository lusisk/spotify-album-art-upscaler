import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { error: "Missing filename parameter" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Missing file in request" },
        { status: 400 }
      );
    }

    console.log(
      `Uploading ${(file.size / 1024 / 1024).toFixed(2)}MB to Blob Storage`
    );

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const blob = await put(filename, buffer, {
      access: "public",
      addRandomSuffix: false,
    });

    console.log(`Successfully uploaded to: ${blob.url}`);

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
