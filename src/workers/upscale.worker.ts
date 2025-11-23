self.addEventListener("message", async (e: MessageEvent) => {
  const { imageUrl, scale } = e.data;

  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    const originalWidth = bitmap.width;
    const originalHeight = bitmap.height;
    const targetWidth = originalWidth * scale;
    const targetHeight = originalHeight * scale;

    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
      willReadFrequently: false,
    });

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const sharpened = sharpenImage(imageData, 0.5);
    ctx.putImageData(sharpened, 0, 0);

    const resultBlob = await canvas.convertToBlob({
      type: "image/png",
      quality: 1.0,
    });

    const arrayBuffer = await resultBlob.arrayBuffer();

    self.postMessage({
      success: true,
      imageData: arrayBuffer,
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : "Upscaling failed",
    });
  }
});

function sharpenImage(imageData: ImageData, amount: number): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);

  const kernel = [
    0,
    -amount,
    0,
    -amount,
    1 + 4 * amount,
    -amount,
    0,
    -amount,
    0,
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            sum += data[idx] * kernel[kernelIdx];
          }
        }
        const outIdx = (y * width + x) * 4 + c;
        output.data[outIdx] = Math.min(255, Math.max(0, sum));
      }
      const alphaIdx = (y * width + x) * 4 + 3;
      output.data[alphaIdx] = data[alphaIdx];
    }
  }

  for (let x = 0; x < width; x++) {
    for (let c = 0; c < 4; c++) {
      output.data[x * 4 + c] = data[x * 4 + c];
      output.data[((height - 1) * width + x) * 4 + c] =
        data[((height - 1) * width + x) * 4 + c];
    }
  }
  for (let y = 0; y < height; y++) {
    for (let c = 0; c < 4; c++) {
      output.data[y * width * 4 + c] = data[y * width * 4 + c];
      output.data[(y * width + width - 1) * 4 + c] =
        data[(y * width + width - 1) * 4 + c];
    }
  }

  return output;
}

export {};
