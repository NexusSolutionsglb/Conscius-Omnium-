"use client";

import { useId, useRef, useState } from "react";
import { uploadImageFile, type UploadedImage } from "@/lib/admin/upload";

/**
 * "Upload from computer" button. Compresses each picked image in the browser,
 * uploads it to the media library under `folder`, and calls `onUploaded` for
 * every file. Shows progress and a compression summary.
 */
export function UploadButton({
  folder,
  onUploaded,
  label = "Upload from computer",
  multiple = true,
  className,
}: {
  folder: string;
  onUploaded: (img: UploadedImage) => void;
  label?: string;
  multiple?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const files = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      setError("Pick image files only.");
      return;
    }
    setBusy(true);
    setError(null);
    let savedBytes = 0;
    let done = 0;
    for (const file of files) {
      setProgress(`Uploading ${done + 1} / ${files.length}…`);
      try {
        const res = await uploadImageFile(file, folder);
        savedBytes += Math.max(0, res.originalSize - res.size);
        onUploaded(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
      done += 1;
    }
    setBusy(false);
    setProgress(
      savedBytes > 0
        ? `Done — saved ${(savedBytes / 1024 / 1024).toFixed(1)} MB via compression`
        : "Done",
    );
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        className="inline-flex cursor-pointer items-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-800 hover:bg-neutral-50"
        aria-disabled={busy}
      >
        {busy ? "Uploading…" : label}
      </label>
      {progress && !error && (
        <span className="ml-2 text-[11px] text-neutral-400">{progress}</span>
      )}
      {error && <span className="ml-2 text-[11px] text-red-600">{error}</span>}
    </div>
  );
}
