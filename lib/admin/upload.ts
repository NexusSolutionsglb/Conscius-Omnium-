"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { recordMediaUpload } from "@/lib/admin/actions";
import { compressImage, type CompressOptions } from "./image-compress";

export const MEDIA_BUCKET = "media";

export type UploadedImage = {
  url: string;
  path: string;
  width: number;
  height: number;
  size: number;
  contentType: string;
  /** original size in bytes, for reporting the savings */
  originalSize: number;
};

function safeName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
}

/**
 * Compress an image in the browser, upload it to the `media` bucket under
 * `folder`, and record it in the media library. Returns the public URL and
 * intrinsic dimensions.
 */
export async function uploadImageFile(
  file: File,
  folder: string,
  opts?: CompressOptions,
): Promise<UploadedImage> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const compressed = await compressImage(file, opts);
  const path = `${folder}/${Date.now()}-${safeName(file.name)}.${compressed.ext}`;

  const { error: upErr } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, compressed.blob, {
      cacheControl: "31536000",
      upsert: false,
      contentType: compressed.contentType,
    });
  if (upErr) throw new Error(upErr.message);

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  await recordMediaUpload({
    bucket: MEDIA_BUCKET,
    path,
    url: data.publicUrl,
    folder,
    size: compressed.blob.size,
    contentType: compressed.contentType,
    width: compressed.width || undefined,
    height: compressed.height || undefined,
  });

  return {
    url: data.publicUrl,
    path,
    width: compressed.width,
    height: compressed.height,
    size: compressed.blob.size,
    contentType: compressed.contentType,
    originalSize: file.size,
  };
}
