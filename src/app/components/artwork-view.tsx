"use client";

import { useState, useEffect } from "react";
import { upscaleImage, loadUpscaleModel } from "@/lib/upscaler";
import { DEVICE_PRESETS } from "@/config/devices";
import { generateQRCode, blobToDataUrl } from "@/utils/qr-code";
import type { SpotifyAlbum, DevicePreset } from "@/types";

interface ArtworkViewProps {
  data: SpotifyAlbum;
}

export default function ArtworkView({ data }: ArtworkViewProps) {
  const [upscaled, setUpscaled] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(
    DEVICE_PRESETS[10]
  );
  const [customWidth, setCustomWidth] = useState(2560);
  const [customHeight, setCustomHeight] = useState(2560);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    loadUpscaleModel()
      .then(() => setModelLoaded(true))
      .catch((err) => console.error("Failed to load model:", err));
  }, []);

  useEffect(() => {
    const prevUpscaled = upscaled;
    if (prevUpscaled && prevUpscaled.startsWith("blob:")) {
      URL.revokeObjectURL(prevUpscaled);
    }
    setUpscaled(null);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.imageUrl]);

  useEffect(() => {
    return () => {
      if (upscaled && upscaled.startsWith("blob:")) {
        URL.revokeObjectURL(upscaled);
      }
    };
  }, [upscaled]);

  const upscale = async () => {
    setLoading(true);
    setError(null);

    try {
      if (upscaled && upscaled.startsWith("blob:")) {
        URL.revokeObjectURL(upscaled);
      }

      const targetSize = Math.max(
        selectedDevice.id === "custom" ? customWidth : selectedDevice.width,
        selectedDevice.id === "custom" ? customHeight : selectedDevice.height
      );

      const originalSize = 640;
      const scale = Math.ceil(targetSize / originalSize);

      const upscaledBlobUrl = await upscaleImage(data.imageUrl, scale);
      setUpscaled(upscaledBlobUrl);

      try {
        const response = await fetch(upscaledBlobUrl);
        const blob = await response.blob();

        console.log(`Image size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);

        const shareId = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}`;

        const file = new File([blob], `${shareId}.png`, { type: "image/png" });

        const uploadResponse = await fetch(`/api/share`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "blob.generate-client-token",
            payload: {
              pathname: `${shareId}.png`,
              callbackUrl: `${window.location.origin}/api/share`,
            },
          }),
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to get upload token");
        }

        const { url, token } = await uploadResponse.json();

        const blobUploadResponse = await fetch(url, {
          method: "PUT",
          headers: {
            "x-vercel-blob-token": token,
          },
          body: file,
        });

        if (!blobUploadResponse.ok) {
          throw new Error("Failed to upload to blob storage");
        }

        const { url: blobUrl } = await blobUploadResponse.json();

        const qrDataUrl = await generateQRCode(blobUrl, {
          width: 400,
          errorCorrectionLevel: "M",
        });
        setQrCode(qrDataUrl);
      } catch (qrError) {
        console.error("Failed to generate QR code:", qrError);
        if (qrError instanceof Error && qrError.message.includes("too large")) {
          setError(
            "Image too large for QR sharing. Try a smaller device resolution."
          );
        }
        setQrCode(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upscaling failed");
      console.error("Upscale error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="artwork-view">
      <div className="artwork-view__metadata">
        <div className="artwork-view__metadata-content">
          {data.songName && (
            <h2 className="artwork-view__song-name">{data.songName}</h2>
          )}
          <p className="artwork-view__album-name">{data.name}</p>
          <p className="artwork-view__artist-name">{data.artist}</p>
        </div>
        {modelLoaded && (
          <div className="artwork-view__badge">
            <i className="bi bi-check-circle-fill artwork-view__badge-icon"></i>
            <span>AI Upscale Ready</span>
          </div>
        )}
      </div>

      <div className="artwork-view__image-container">
        {loading && (
          <div className="artwork-view__loader">
            <div className="artwork-view__spinner"></div>
            <p>Processing image...</p>
          </div>
        )}
        <img
          src={upscaled || data.imageUrl}
          alt={`${data.name} by ${data.artist}`}
          className="artwork-view__image"
          style={{ opacity: loading ? 0.5 : 1 }}
        />
      </div>

      <div className="artwork-view__actions">
        <div className="artwork-view__resolution-selector">
          <label htmlFor="device-select" className="artwork-view__label">
            Target Device / Resolution
          </label>
          <select
            id="device-select"
            value={selectedDevice.id}
            onChange={(e) => {
              const device = DEVICE_PRESETS.find(
                (d) => d.id === e.target.value
              );
              if (device) setSelectedDevice(device);
            }}
            className="artwork-view__select"
          >
            {DEVICE_PRESETS.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.width}x{device.height})
              </option>
            ))}
          </select>

          {selectedDevice.id === "custom" && (
            <div className="artwork-view__custom-inputs">
              <input
                type="number"
                placeholder="Width"
                value={customWidth}
                onChange={(e) =>
                  setCustomWidth(parseInt(e.target.value) || 2560)
                }
                className="artwork-view__input"
                min="640"
                max="8192"
              />
              <span className="artwork-view__separator">×</span>
              <input
                type="number"
                placeholder="Height"
                value={customHeight}
                onChange={(e) =>
                  setCustomHeight(parseInt(e.target.value) || 2560)
                }
                className="artwork-view__input"
                min="640"
                max="8192"
              />
            </div>
          )}
        </div>

        <div className="artwork-view__button-group">
          <button
            onClick={upscale}
            disabled={loading || !modelLoaded}
            className="artwork-view__button artwork-view__button--primary"
          >
            <i className="bi bi-arrow-up-circle artwork-view__button-icon"></i>
            {loading
              ? "Processing..."
              : !modelLoaded
              ? "Loading AI..."
              : upscaled
              ? "Upscale Again"
              : "AI Upscale"}
          </button>

          <button
            onClick={() => {
              if (upscaled) {
                const link = document.createElement("a");
                link.href = upscaled;
                link.download = `${data.name}-upscaled.png`;
                link.click();
              }
            }}
            disabled={!upscaled || loading}
            className="artwork-view__button artwork-view__button--success"
          >
            <i className="bi bi-download artwork-view__button-icon"></i>
            Download Image
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            disabled={!qrCode || loading}
            className="artwork-view__button artwork-view__button--secondary"
          >
            <i className="bi bi-qr-code artwork-view__button-icon"></i>
            Scan QR Code
          </button>
        </div>

        {error && <p className="artwork-view__error">{error}</p>}
      </div>

      {showQrModal && qrCode && (
        <div className="qr-modal" onClick={() => setShowQrModal(false)}>
          <div
            className="qr-modal__content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="qr-modal__close"
              onClick={() => setShowQrModal(false)}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <h3 className="qr-modal__title">Scan to Download on Your Phone</h3>
            <img src={qrCode} alt="QR Code" className="qr-modal__image" />
            <p className="qr-modal__instructions">
              Open your phone&apos;s camera and point it at the QR code to
              download the upscaled image.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
