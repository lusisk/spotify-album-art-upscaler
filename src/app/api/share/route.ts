import { NextRequest, NextResponse } from "next/server";

// In-memory storage for shared images (will be lost on deployment restarts)
// For production, use Vercel KV, Upstash Redis, or Vercel Blob Storage
const sharedImages = new Map<
  string,
  {
    data: string;
    albumName: string;
    timestamp: number;
  }
>();

// Cleanup expired shares every hour
const ONE_HOUR = 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of sharedImages.entries()) {
    if (now - value.timestamp > ONE_HOUR) {
      sharedImages.delete(key);
    }
  }
}, ONE_HOUR);

export async function POST(request: NextRequest) {
  try {
    const { shareId, imageData, albumName } = await request.json();

    if (!shareId || !imageData || !albumName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    sharedImages.set(shareId, {
      data: imageData,
      albumName,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error storing shared image:", error);
    return NextResponse.json(
      { error: "Failed to store image" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("id");

    if (!shareId) {
      return NextResponse.json({ error: "Missing share ID" }, { status: 400 });
    }

    const shareData = sharedImages.get(shareId);

    if (!shareData) {
      return NextResponse.json(
        { error: "Share not found or expired" },
        { status: 404 }
      );
    }

    if (Date.now() - shareData.timestamp > ONE_HOUR) {
      sharedImages.delete(shareId);
      return NextResponse.json({ error: "Share expired" }, { status: 404 });
    }

    return NextResponse.json({
      imageData: shareData.data,
      albumName: shareData.albumName,
    });
  } catch (error) {
    console.error("Error retrieving shared image:", error);
    return NextResponse.json(
      { error: "Failed to retrieve image" },
      { status: 500 }
    );
  }
}
