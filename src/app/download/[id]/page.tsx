"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSharedImage } from "@/utils/indexeddb";

export default function DownloadPage() {
  const params = useParams();
  const shareId = params.id as string;
  const [status, setStatus] = useState<"loading" | "downloading" | "notfound">(
    "loading"
  );

  useEffect(() => {
    const downloadImage = async () => {
      try {
        const shareData = await getSharedImage(shareId);

        if (shareData) {
          setStatus("downloading");

          const url = URL.createObjectURL(shareData.blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = `${shareData.albumName}-upscaled.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          setStatus("notfound");
        }
      } catch (error) {
        console.error("Download error:", error);
        setStatus("notfound");
      }
    };

    if (shareId) {
      downloadImage();
    }
  }, [shareId]);

  return (
    <div
      className="page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div>
        {status === "loading" && (
          <>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              Loading...
            </h1>
            <p style={{ color: "#a1a1aa" }}>Preparing your download</p>
          </>
        )}
        {status === "downloading" && (
          <>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              Download Started!
            </h1>
            <p style={{ color: "#a1a1aa" }}>
              Your upscaled image should start downloading shortly.
            </p>
            <p style={{ color: "#a1a1aa", marginTop: "1rem" }}>
              You can close this page.
            </p>
          </>
        )}
        {status === "notfound" && (
          <>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              Not Found
            </h1>
            <p style={{ color: "#a1a1aa" }}>
              This download link has expired or doesn&apos;t exist.
            </p>
            <p style={{ color: "#a1a1aa", marginTop: "1rem" }}>
              QR codes expire after 1 hour for security.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
