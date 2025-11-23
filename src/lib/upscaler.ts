import * as ort from "onnxruntime-web";
import { ONNX_RUNTIME } from "../config/constants";

ort.env.wasm.wasmPaths = ONNX_RUNTIME.WASM_PATH;

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL("../workers/upscale.worker.ts", import.meta.url)
    );
  }
  return worker;
}

export async function upscaleImage(
  imageUrl: string,
  scale: number = 4
): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = getWorker();

    const handleMessage = (e: MessageEvent) => {
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleError);

      if (e.data.success) {
        const blob = new Blob([e.data.imageData], { type: "image/png" });
        const blobUrl = URL.createObjectURL(blob);
        resolve(blobUrl);
      } else {
        reject(new Error(e.data.error));
      }
    };

    const handleError = (error: ErrorEvent) => {
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleError);
      reject(error);
    };

    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleError);

    worker.postMessage({ imageUrl, scale });
  });
}

export async function loadUpscaleModel(): Promise<void> {
  console.log("Enhanced canvas upscaling ready");
}
