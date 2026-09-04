"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadImageFile } from "@/lib/admin/upload";
import { normalizeImageUrl } from "@/lib/utils";
import { readBind, writeBind } from "@/lib/editor/bind";
import type { MediaRow } from "@/lib/supabase/database.types";
import { useEditorStoreApi } from "./editor-store-context";

/**
 * The replace-image modal: media library · upload (browser-compressed) ·
 * paste URL · remove. Writes the resolved URL to `bind`. Shared by the hover
 * image overlay and the inspector's `image` fields.
 */
export function ImageDialog({
  bind,
  folder = "media",
  onClose,
  onPick,
}: {
  bind: string;
  folder?: string;
  onClose: () => void;
  /** When given, receives the chosen URL instead of writing it to `bind`. */
  onPick?: (url: string) => void;
}) {
  const api = useEditorStoreApi()!;
  const current = onPick ? "" : ((readBind<string>(api, bind) as string) ?? "");
  const [assets, setAssets] = useState<MediaRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"library" | "url">("library");
  const [url, setUrl] = useState(current);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    sb.from("media")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => setAssets((data ?? []) as unknown as MediaRow[]));
  }, []);

  const set = (v: string) => {
    if (onPick) onPick(v ? normalizeImageUrl(v) : "");
    else writeBind(api, bind, v ? normalizeImageUrl(v) : "");
    onClose();
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const res = await uploadImageFile(files[0], folder);
      set(res.url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      data-editor-ui=""
      className="co-img-dialog-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="co-img-dialog">
        <div className="co-img-dialog-head">
          <div className="flex gap-1">
            {(["library", "url"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={t === tab ? "co-tab co-tab-on" : "co-tab"}
              >
                {t === "library" ? "Media library" : "Paste URL"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="co-mini" disabled={busy} onClick={() => inputRef.current?.click()}>
              {busy ? "Uploading…" : "⬆ Upload"}
            </button>
            {current && (
              <button className="co-mini co-mini-danger" onClick={() => set("")}>
                Remove
              </button>
            )}
            <button className="co-mini" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => onFiles(e.target.files)}
        />

        {tab === "url" ? (
          <div className="co-img-url">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              autoFocus
            />
            <button className="co-mini" onClick={() => url.trim() && set(url.trim())}>
              Use
            </button>
          </div>
        ) : (
          <div className="co-img-grid">
            {assets.length === 0 && <p className="co-img-empty">No media yet — Upload one.</p>}
            {assets.map((a) => (
              <button
                key={a.id}
                className={a.url === current ? "co-img-cell co-img-cell-on" : "co-img-cell"}
                onClick={() => set(a.url)}
                title={a.path}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
