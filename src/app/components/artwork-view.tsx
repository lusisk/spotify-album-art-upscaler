"use client";

import { useState, useEffect } from "react";
import { upscaleImage, loadUpscaleModel } from "@/lib/upscaler";
import { DEVICE_PRESETS } from "@/config/devices";
import { generateQRCode } from "@/utils/qr-code";
import { storeSharedImage, cleanupExpiredShares } from "@/utils/indexeddb";
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

        const shareId = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}`;

        await storeSharedImage(shareId, blob, data.name);

        const downloadUrl = `${window.location.origin}/download/${shareId}`;
        const qrDataUrl = await generateQRCode(downloadUrl, {
          width: 400,
          errorCorrectionLevel: "M",
        });
        setQrCode(qrDataUrl);

        cleanupExpiredShares().catch(console.error);
      } catch (qrError) {
        console.error("Failed to generate QR code:", qrError);
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
            <svg
              className="artwork-view__badge-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
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
            <svg
              className="artwork-view__button-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7" />
              <polyline points="16 8 12 4 8 8" />
              <line x1="12" y1="4" x2="12" y2="16" />
            </svg>
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
            <svg
              className="artwork-view__button-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Image
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            disabled={!qrCode || loading}
            className="artwork-view__button artwork-view__button--secondary"
          >
            <svg
              className="artwork-view__button-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <path d="M14 14h1v1h-1v-1z" />
              <path d="M16 14h1v1h-1v-1z" />
              <path d="M18 14h1v1h-1v-1z" />
              <path d="M20 14h1v1h-1v-1z" />
              <path d="M14 16h1v1h-1v-1z" />
              <path d="M16 16h1v1h-1v-1z" />
              <path d="M18 16h1v1h-1v-1z" />
              <path d="M20 16h1v1h-1v-1z" />
              <path d="M14 18h1v1h-1v-1z" />
              <path d="M16 18h1v1h-1v-1z" />
              <path d="M18 18h1v1h-1v-1z" />
              <path d="M20 18h1v1h-1v-1z" />
              <path d="M14 20h1v1h-1v-1z" />
              <path d="M16 20h1v1h-1v-1z" />
              <path d="M18 20h1v1h-1v-1z" />
              <path d="M20 20h1v1h-1v-1z" />
            </svg>
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
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h3 className="qr-modal__title">Scan to Download on Your Phone</h3>
            <img src={qrCode} alt="QR Code" className="qr-modal__image" />
            <p className="qr-modal__instructions">
              Open your phone's camera and point it at the QR code to download
              the upscaled image.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
