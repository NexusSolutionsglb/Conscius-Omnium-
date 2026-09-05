"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { EditablePageSlug } from "@/lib/content/defaults";
import type { EditorSnapshot } from "@/lib/editor/types";
import { publishSite, refreshSitePreview } from "@/lib/admin/actions";
import { EditorStoreProvider, useEditorStore, useEditorStoreApi } from "./editor-store-context";
import { EditorTopbar } from "./editor-topbar";
import { InspectorPanel } from "./inspector-panel";
import { SettingsPanel } from "./settings-panel";
import { DEVICE_WIDTH } from "@/lib/editor/types";

/** Where each editable page slug actually lives on the public site. */
const PREVIEW_PATH: Record<EditablePageSlug, string> = {
  home: "/",
  about: "/about",
  studio: "/studio",
  work: "/gallery",
  exhibitions: "/exhibitions",
  contact: "/contact",
};

export function EditorShell({
  slug,
  snapshot,
}: {
  slug: EditablePageSlug;
  snapshot: EditorSnapshot;
}) {
  return (
    <EditorStoreProvider initial={snapshot}>
      <ShellInner slug={slug} snapshot={snapshot} />
    </EditorStoreProvider>
  );
}

function ShellInner({
  slug,
  snapshot,
}: {
  slug: EditablePageSlug;
  snapshot: EditorSnapshot;
}) {
  const api = useEditorStoreApi()!;
  const router = useRouter();
  const device = useEditorStore((s) => s.device);
  const mode = useEditorStore((s) => s.mode);
  const dirty = useEditorStore((s) => s.dirty);
  const selection = useEditorStore((s) => s.selection);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // The frame is mounted only once the cached public render has been purged,
  // so it never opens on a stale copy of the page.
  const [previewReady, setPreviewReady] = useState(false);

  const reloadFrame = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.location.reload();
    } catch {
      /* the frame may not have loaded yet */
    }
  }, []);

  // Purge the ISR-cached public pages before framing them.
  useEffect(() => {
    let alive = true;
    refreshSitePreview().finally(() => {
      if (alive) setPreviewReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  /**
   * Adopt every fresh server snapshot (first load, `router.refresh()`, after a
   * publish). Edits made in this session survive; everything untouched — works,
   * collections, gallery images changed in the admin panel or the database —
   * is taken from the new snapshot instead of an old local draft.
   */
  const signature = useMemo(() => JSON.stringify(snapshot), [snapshot]);
  const seeded = useRef<string | null>(null);
  useEffect(() => {
    if (seeded.current === null) {
      seeded.current = signature; // the store was created from this snapshot
      return;
    }
    if (seeded.current === signature) return;
    seeded.current = signature;
    api.getState().seed(snapshot);
    reloadFrame();
  }, [api, signature, snapshot, reloadFrame]);

  /** Throw away the local draft and pull the live content back in. */
  const reloadFromLive = useCallback(async () => {
    if (
      api.getState().dirty &&
      !confirm("Discard your unsaved draft and reload the live content?")
    )
      return;
    api.getState().discardDraft();
    await refreshSitePreview();
    router.refresh();
    reloadFrame();
    setToast("Reloaded the live content");
    setTimeout(() => setToast(null), 5000);
  }, [api, router, reloadFrame]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (api.getState().dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [api]);

  const publish = useCallback(async () => {
    setPublishing(true);
    const st = api.getState();
    const res = await publishSite({
      pages: st.pages as unknown as Record<string, unknown>,
      settings: st.settings as unknown as Record<string, unknown>,
      profile: st.profile,
      collections: st.collections,
      exhibitions: st.exhibitions,
      timeline: st.timeline,
      works: st.works,
      baseline: {
        collections: st.baseline.collections,
        exhibitions: st.baseline.exhibitions,
        timeline: st.baseline.timeline,
        works: st.baseline.works,
      },
    });
    setPublishing(false);
    if (res.ok) {
      api.getState().markPublished();
      setToast(res.message || "Published to the live site");
      // Re-render the iframe against the freshly published content.
      reloadFrame();
      router.refresh();
    } else {
      setToast(res.error || "Publish failed");
    }
    setTimeout(() => setToast(null), 5000);
  }, [api, router, reloadFrame]);

  const width = DEVICE_WIDTH[device];
  const showInspector = !settingsOpen && mode === "edit" && selection?.kind === "section";

  return (
    <>
      <EditorTopbar
        slug={slug}
        publishing={publishing}
        onPublish={publish}
        settingsOpen={settingsOpen}
        onToggleSettings={() => setSettingsOpen((v) => !v)}
        onReloadFromLive={reloadFromLive}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex flex-1 items-start justify-center overflow-auto bg-neutral-300/60 p-4">
          <div
            className="h-full bg-white shadow-xl ring-1 ring-black/10 transition-[width] duration-200"
            style={{ width: width ? `${width}px` : "100%", maxWidth: "100%" }}
          >
            {previewReady ? (
              <iframe
                ref={iframeRef}
                title="Site preview"
                src={`${PREVIEW_PATH[slug]}?__edit=1`}
                className="h-full w-full border-0"
              />
            ) : (
              <div className="grid h-full place-items-center text-[12px] text-neutral-400">
                Loading the live page…
              </div>
            )}
          </div>
        </div>

        {settingsOpen && mode === "edit" && (
          <aside className="w-[320px] shrink-0 overflow-hidden border-l border-neutral-300 bg-white">
            <SettingsPanel onClose={() => setSettingsOpen(false)} />
          </aside>
        )}
        {showInspector && (
          <aside className="w-[300px] shrink-0 overflow-y-auto border-l border-neutral-300 bg-white">
            <InspectorPanel />
          </aside>
        )}
      </div>

      {(toast || dirty) && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
          {toast ? (
            <div className="pointer-events-auto rounded-full bg-neutral-900 px-4 py-2 text-[12px] font-medium text-white shadow-lg">
              {toast}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
