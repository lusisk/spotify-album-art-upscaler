"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function DownloadPage() {
  const params = useParams();
  const blobUrl = params.id as string;
  const [status, setStatus] = useState<"loading" | "downloading" | "error">(
    "loading"
  );

  useEffect(() => {
    const downloadImage = async () => {
      try {
        setStatus("downloading");

        window.location.href = blobUrl;
      } catch (error) {
        console.error("Download error:", error);
        setStatus("error");
      }
    };

    if (blobUrl) {
      downloadImage();
    }
  }, [blobUrl]);

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
        {status === "error" && (
          <>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              Download Error
            </h1>
            <p style={{ color: "#a1a1aa" }}>
              There was an error downloading the image.
            </p>
            <p style={{ color: "#a1a1aa", marginTop: "1rem" }}>
              The link may have expired or is invalid.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
