"use client";

import { useRef, useState } from "react";
import type { ImageKind, WorkImage } from "@/lib/types";
import { getPath } from "@/lib/editor/paths";
import { bindToPath, writeBind } from "@/lib/editor/bind";
import { uploadImageFile } from "@/lib/admin/upload";
import { normalizeImageUrl } from "@/lib/utils";
import { newWorkImage } from "@/lib/editor/new-entities";
import { useEditorStore, useEditorStoreApi } from "./editor-store-context";
import { ImageDialog } from "./image-dialog";

const KINDS: ImageKind[] = [
  "cover",
  "gallery",
  "detail",
  "installation",
  "process",
  "drawing",
  "render",
];

/** Stable empty-array reference — a fresh `[]` per render would make
 *  `useSyncExternalStore` see a "changed" snapshot on every call and loop. */
const EMPTY_IMAGES: WorkImage[] = [];

/**
 * Full gallery manager for a work's `images` array. Reorder (drag or ↑↓),
 * add (upload / library), replace, remove, and per-image alt / caption / kind.
 * `bind` is the snapshot path of the array, e.g. `@works.3.images`.
 */
export function GalleryEditor({ bind, folder = "work" }: { bind: string; folder?: string }) {
  const api = useEditorStoreApi()!;
  const path = bindToPath(bind);
  const images = useEditorStore((s) => getPath<WorkImage[]>(s, path) ?? EMPTY_IMAGES);
  const [replaceIdx, setReplaceIdx] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const dragFrom = useRef<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    api.getState().reorderList(path, from, to);
  };
  const setField = (i: number, key: keyof WorkImage, v: unknown) =>
    writeBind(api, `${bind}.${i}.${key}`, v);

  const onAddFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const res = await uploadImageFile(file, folder);
        api.getState().insertItem(path, {
          ...newWorkImage(res.url),
          width: res.width,
          height: res.height,
        });
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-neutral-500">
          Gallery ({images.length})
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="rounded-md border border-neutral-300 px-2 py-0.5 text-[11px] hover:bg-neutral-50"
          >
            {busy ? "Uploading…" : "⬆ Upload"}
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-md border border-neutral-300 px-2 py-0.5 text-[11px] hover:bg-neutral-50"
          >
            Library
          </button>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => onAddFiles(e.target.files)}
      />

      <ul className="space-y-1.5">
        {images.map((im, i) => (
          <li
            key={im.id ?? i}
            draggable
            onDragStart={() => (dragFrom.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragFrom.current != null) move(dragFrom.current, i);
              dragFrom.current = null;
            }}
            className="rounded-md border border-neutral-200 bg-white p-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="cursor-grab text-neutral-300" title="Drag to reorder">
                ⠿
              </span>
              <button
                onClick={() => setReplaceIdx(i)}
                className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded bg-neutral-100"
                title="Replace"
              >
                {im.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={im.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[9px] text-neutral-400">none</span>
                )}
              </button>
              <div className="min-w-0 flex-1 truncate text-[11px] text-neutral-500">
                {im.alt || im.caption || im.kind}
              </div>
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="px-1 text-neutral-400 hover:text-neutral-900"
                title="Details"
              >
                {expanded === i ? "▾" : "▸"}
              </button>
              <button
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                className="px-1 text-neutral-400 enabled:hover:text-neutral-900 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => move(i, i + 1)}
                disabled={i === images.length - 1}
                className="px-1 text-neutral-400 enabled:hover:text-neutral-900 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                onClick={() => api.getState().removeAt(path, i)}
                className="px-1 text-red-400 hover:text-red-600"
                title="Remove"
              >
                ✕
              </button>
            </div>

            {expanded === i && (
              <div className="mt-1.5 space-y-1.5 border-t border-neutral-100 pt-1.5">
                <input
                  value={im.alt ?? ""}
                  onChange={(e) => setField(i, "alt", e.target.value)}
                  placeholder="Alt text (describe the image)"
                  className="w-full rounded border border-neutral-300 px-1.5 py-1 text-[11px]"
                />
                <input
                  value={im.caption ?? ""}
                  onChange={(e) => setField(i, "caption", e.target.value)}
                  placeholder="Caption (optional)"
                  className="w-full rounded border border-neutral-300 px-1.5 py-1 text-[11px]"
                />
                <select
                  value={im.kind}
                  onChange={(e) => setField(i, "kind", e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white px-1.5 py-1 text-[11px]"
                >
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </li>
        ))}
      </ul>

      {replaceIdx != null && (
        <ImageDialog
          bind={`${bind}.${replaceIdx}.url`}
          folder={folder}
          onClose={() => setReplaceIdx(null)}
        />
      )}
      {addOpen && (
        <ImageDialog
          bind="__gallery_add__"
          folder={folder}
          onClose={() => setAddOpen(false)}
          onPick={(url) => {
            if (url) api.getState().insertItem(path, newWorkImage(normalizeImageUrl(url)));
            setAddOpen(false);
          }}
        />
      )}
    </div>
  );
}
