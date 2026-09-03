"use client";

/**
 * Client-side image compression for admin uploads.
 *
 * Goal: keep storage small without visibly degrading artwork. We resize the
 * longest edge down to `maxEdge` (only ever downscaling) and re-encode to WebP
 * at a high quality factor. Vector and animated formats are passed through
 * untouched, and if compression fails to help we keep the original bytes.
 */

export type CompressResult = {
  blob: Blob;
  width: number;
  height: number;
  contentType: string;
  /** file extension without the dot, e.g. "webp" or "png" */
  ext: string;
  /** true when the returned blob is the untouched source file */
  passthrough: boolean;
};

export type CompressOptions = {
  /** Longest edge in pixels. Larger images are scaled down to this. */
  maxEdge?: number;
  /** WebP quality, 0–1. 0.82 keeps artwork visually lossless at web sizes. */
  quality?: number;
};

const RASTER = ["image/jpeg", "image/png", "image/webp"];
const DEFAULTS: Required<CompressOptions> = { maxEdge: 2560, quality: 0.82 };

export async function compressImage(
  file: File,
  opts: CompressOptions = {},
): Promise<CompressResult> {
  const { maxEdge, quality } = { ...DEFAULTS, ...opts };

  // Leave SVG / GIF / AVIF and anything non-raster exactly as-is.
  if (!RASTER.includes(file.type) || typeof createImageBitmap !== "function") {
    const ext = extFor(file.type) ?? file.name.split(".").pop()?.toLowerCase() ?? "bin";
    return { blob: file, width: 0, height: 0, contentType: file.type, ext, passthrough: true };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    return { blob: file, width: 0, height: 0, contentType: file.type, ext, passthrough: true };
  }

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    return { blob: file, width: bitmap.width, height: bitmap.height, contentType: file.type, ext, passthrough: true };
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const webp = await toBlob(canvas, "image/webp", quality);

  // Keep the original when we neither resized nor shrank the byte count.
  if (webp && scale === 1 && webp.size >= file.size) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    return { blob: file, width, height, contentType: file.type, ext, passthrough: true };
  }

  if (!webp) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    return { blob: file, width, height, contentType: file.type, ext, passthrough: true };
  }

  return { blob: webp, width, height, contentType: "image/webp", ext: "webp", passthrough: false };
}

function makeCanvas(w: number, h: number): HTMLCanvasElement | OffscreenCanvas {
  if (typeof OffscreenCanvas === "function") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function toBlob(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  type: string,
  quality: number,
): Promise<Blob | null> {
  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type, quality }).catch(() => null);
  }
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
}

function extFor(mime: string): string | null {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
    "image/svg+xml": "svg",
    "video/mp4": "mp4",
  };
  return map[mime] ?? null;
}
