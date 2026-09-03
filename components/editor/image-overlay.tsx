"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadImageFile } from "@/lib/admin/upload";
import { normalizeImageUrl } from "@/lib/utils";
import { readBind, writeBind } from "@/lib/editor/bind";
import type { MediaRow } from "@/lib/supabase/database.types";
import { useEditorStore, useEditorStoreApi } from "./editor-store-context";

type ImgTarget = { bind: string; folder: string; wrap: HTMLElement; el: HTMLElement };

function measurable(el: HTMLElement): HTMLElement {
  return getComputedStyle(el).display === "contents"
    ? ((el.firstElementChild as HTMLElement) ?? el)
    : el;
}

function insideRect(el: HTMLElement, x: number, y: number, pad = 44): boolean {
  const r = el.getBoundingClientRect();
  return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
}

function parse(el: HTMLElement): ImgTarget | null {
  const attr = el.dataset.editImage;
  if (!attr) return null;
  const i = attr.lastIndexOf("|");
  return {
    bind: attr.slice(0, i),
    folder: attr.slice(i + 1) || "media",
    wrap: el,
    el: measurable(el),
  };
}

/** Hover affordance + replace dialog for `<EditableImage>` images. */
export function ImageOverlay() {
  const api = useEditorStoreApi();
  const mode = useEditorStore((s) => s.mode);
  const [hover, setHover] = useState<ImgTarget | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [dialog, setDialog] = useState<ImgTarget | null>(null);
  const hoverRef = useRef<ImgTarget | null>(null);
  hoverRef.current = hover;

  useEffect(() => {
    if (mode !== "edit") {
      setHover(null);
      setRect(null);
      return;
    }
    const onMove = (e: MouseEvent) => {
      const t = e.target instanceof HTMLElement ? e.target : null;
      if (!t || t.closest("[data-editor-ui]")) return;
      const el = t.closest<HTMLElement>("[data-edit-image]");
      setHover((prev) => {
        if (el) return parse(el);
        // keep the current target if we're still within its bounds (small gap
        // between the image and the "Replace" button)
        return prev && insideRect(prev.el, e.clientX, e.clientY) ? prev : null;
      });
    };
    document.addEventListener("mousemove", onMove, { passive: true });
    return () => document.removeEventListener("mousemove", onMove);
  }, [mode]);

  useEffect(() => {
    if (!hover) {
      setRect(null);
      return;
    }
    let raf = 0;
    const tick = () => {
      if (hoverRef.current?.el) setRect(hoverRef.current.el.getBoundingClientRect());
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [hover]);

  if (mode !== "edit" || !api) return dialog ? <ImageDialog target={dialog} onClose={() => setDialog(null)} /> : null;

  return (
    <div data-editor-ui="">
      {rect && hover && (
        <>
          <div
            className="co-img-frame"
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          />
          <button
            className="co-img-btn"
            style={{
              top: Math.max(8, rect.top + 8),
              left: Math.min(rect.left + 8, window.innerWidth - 150),
            }}
            onClick={() => setDialog(hover)}
          >
            🖼 Replace image
          </button>
        </>
      )}
      {dialog && <ImageDialog target={dialog} onClose={() => setDialog(null)} />}
    </div>
  );
}

function ImageDialog({ target, onClose }: { target: ImgTarget; onClose: () => void }) {
  const api = useEditorStoreApi()!;
  const current = (readBind<string>(api, target.bind) as string) ?? "";
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
    writeBind(api, target.bind, normalizeImageUrl(v));
    onClose();
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const res = await uploadImageFile(files[0], target.folder);
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
