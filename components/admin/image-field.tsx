"use client";

import { useState } from "react";
import Image from "next/image";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { UploadButton } from "./upload-button";
import { MediaPickerButton } from "./media-picker";

/**
 * A single-image form field: a URL input backed by an "Upload from computer"
 * button (browser-side compression) and the media-library picker, with a live
 * thumbnail. Submits as a normal form field named `name`.
 */
export function ImageField({
  label,
  name,
  defaultValue = "",
  folder,
  hint,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  folder: string;
  hint?: string;
  className?: string;
}) {
  const [url, setUrl] = useState(defaultValue);

  return (
    <div className={cn("block", className)}>
      <span className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-500">
        {label}
        <span className="text-neutral-300">optional</span>
      </span>

      <div className="mt-1 flex gap-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
          {url ? (
            <Image src={url} alt="" fill sizes="96px" className="object-cover" unoptimized />
          ) : (
            <span className="flex h-full items-center justify-center text-[10px] text-neutral-400">
              no image
            </span>
          )}
        </div>

        <div className="flex-1 space-y-1.5">
          <input
            name={name}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={(e) => setUrl(normalizeImageUrl(e.target.value))}
            placeholder="https://…  or upload / choose"
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-[13.5px] text-neutral-900 outline-none focus:border-neutral-900"
          />
          <div className="flex flex-wrap items-center gap-2">
            <UploadButton
              folder={folder}
              multiple={false}
              label="Upload from computer"
              onUploaded={(img) => setUrl(img.url)}
            />
            <MediaPickerButton onPick={(u) => setUrl(u)} />
            {url && (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="text-[11px] text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {hint && <span className="mt-1 block text-[11px] text-neutral-400">{hint}</span>}
    </div>
  );
}
