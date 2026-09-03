"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { MediaAsset } from "@/lib/types";
import type { MediaRow } from "@/lib/supabase/database.types";

/**
 * Opens the media library in a dialog and returns the chosen public URL.
 * Falls back to a plain URL field when Supabase storage isn't reachable.
 */
export function MediaPickerButton({ onPick }: { onPick: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setLoading(true);
    supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(120)
      .then(({ data }) => {
        setAssets(
          ((data ?? []) as unknown as MediaRow[]).map((m) => ({
            id: m.id,
            bucket: m.bucket,
            path: m.path,
            url: m.url,
            alt: m.alt,
            folder: m.folder,
            width: m.width,
            height: m.height,
            size: m.size,
            contentType: m.content_type,
            createdAt: m.created_at,
          })),
        );
        setLoading(false);
      });
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-neutral-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-neutral-700"
      >
        Choose from media
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded-xl border border-neutral-200 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Media library
              </p>
              <button type="button" onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-900">
                ✕
              </button>
            </div>
            <div className="grid flex-1 gap-2 overflow-y-auto p-4 sm:grid-cols-4">
              {loading && <p className="col-span-full text-[13px] text-neutral-400">Loading…</p>}
              {!loading && assets.length === 0 && (
                <p className="col-span-full text-[13px] text-neutral-400">
                  No media yet. Upload from Media, or paste a URL.
                </p>
              )}
              {assets.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    onPick(a.url);
                    setOpen(false);
                  }}
                  className="group relative aspect-square overflow-hidden rounded-md border border-neutral-200"
                >
                  <Image src={a.url} alt={a.alt ?? ""} fill sizes="200px" className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
