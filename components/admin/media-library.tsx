"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { MediaAsset } from "@/lib/types";
import type { MediaRow } from "@/lib/supabase/database.types";
import { formatDate } from "@/lib/utils";
import { deleteMedia, recordMediaUpload } from "@/lib/admin/actions";
import { uploadImageFile } from "@/lib/admin/upload";
import { Card } from "./ui";

function toAsset(m: MediaRow): MediaAsset {
  return {
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
  };
}

const BUCKET = "media";
const FOLDERS = ["works", "projects", "profile", "studio", "exhibitions", "og", "process"];

export function MediaLibrary() {
  const supabase = getSupabaseBrowserClient();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [folder, setFolder] = useState("works");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });
    setAssets(((data ?? []) as unknown as MediaRow[]).map(toAsset));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onFiles(files: FileList | null) {
    if (!files || !supabase) return;
    setBusy(true);
    setError(null);
    for (const file of Array.from(files)) {
      try {
        if (file.type.startsWith("image/")) {
          // Compress + upload + record in one step.
          await uploadImageFile(file, folder);
          continue;
        }
        // Non-images (e.g. video/mp4) are stored as-is.
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
        const safe = file.name
          .replace(/\.[^.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 60);
        const path = `${folder}/${Date.now()}-${safe}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: "31536000", upsert: false });
        if (upErr) {
          setError(upErr.message);
          continue;
        }
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        await recordMediaUpload({
          bucket: BUCKET,
          path,
          url: data.publicUrl,
          folder,
          size: file.size,
          contentType: file.type,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    load();
  }

  const shown = assets.filter(
    (a) =>
      (!filter || a.path.includes(filter) || (a.alt ?? "").includes(filter)),
  );

  if (!supabase) {
    return (
      <Card>
        <p className="text-[13px] text-neutral-500">
          Connect Supabase (with a public <code>media</code> storage bucket) to
          use the library.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card title="Upload">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-[13px]"
          >
            {FOLDERS.map((f) => (
              <option key={f} value={f}>
                /{f}
              </option>
            ))}
          </select>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/mp4"
            multiple
            onChange={(e) => onFiles(e.target.files)}
            className="text-[12px]"
          />
          {busy && <span className="text-[12px] text-neutral-400">Uploading…</span>}
          {error && <span className="text-[12px] text-red-600">{error}</span>}
        </div>
        <p className="mt-2 text-[11px] text-neutral-400">
          Images are compressed in your browser (resized to 2560px max edge,
          re-encoded as WebP at high quality) before being stored in the{" "}
          <code>media</code> bucket under the chosen folder. Public URLs are used
          by <code>next/image</code>.
        </p>
      </Card>

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by name…"
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-[13px] sm:max-w-xs"
      />

      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center text-[13px] text-neutral-400">
          Nothing here yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((a) => (
            <div key={a.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <div className="relative aspect-square bg-neutral-100">
                <Image src={a.url} alt={a.alt ?? ""} fill sizes="240px" className="object-cover" unoptimized />
              </div>
              <div className="space-y-1 p-2.5 text-[11px]">
                <p className="truncate text-neutral-600" title={a.path}>
                  {a.path.split("/").pop()}
                </p>
                <p className="text-neutral-400">
                  /{a.folder} · {a.size ? `${Math.round(a.size / 1024)} KB` : "—"} ·{" "}
                  {formatDate(a.createdAt)}
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(a.url)}
                    className="text-neutral-500 hover:text-neutral-900"
                  >
                    Copy URL
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("Delete this file?")) return;
                      await deleteMedia(a.id, a.bucket, a.path);
                      load();
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
