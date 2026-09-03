"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PageContentMap } from "@/lib/types";
import type { EditablePageSlug } from "@/lib/content/defaults";
import type { EditorSettings } from "@/lib/editor/types";
import { publishSite } from "@/lib/admin/actions";
import { EditorStoreProvider, useEditorStore, useEditorStoreApi } from "./editor-store-context";
import { EditorTopbar } from "./editor-topbar";
import { InspectorPanel } from "./inspector-panel";
import { SettingsPanel } from "./settings-panel";
import { DEVICE_WIDTH } from "@/lib/editor/types";

export function EditorShell({
  slug,
  pages,
  settings,
}: {
  slug: EditablePageSlug;
  pages: PageContentMap;
  settings: EditorSettings;
}) {
  const initial = useMemo(() => ({ pages, settings }), [pages, settings]);
  return (
    <EditorStoreProvider initial={initial}>
      <ShellInner slug={slug} />
    </EditorStoreProvider>
  );
}

function ShellInner({ slug }: { slug: EditablePageSlug }) {
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
    const { pages, settings } = api.getState();
    const res = await publishSite({
      pages: pages as unknown as Record<string, unknown>,
      settings,
    });
    setPublishing(false);
    if (res.ok) {
      api.getState().markPublished();
      setToast(res.message || "Published to the live site");
      // Re-render the iframe against the freshly published content.
      iframeRef.current?.contentWindow?.location.reload();
      router.refresh();
    } else {
      setToast(res.error || "Publish failed");
    }
    setTimeout(() => setToast(null), 5000);
  }, [api, router]);

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
      />

      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex flex-1 items-start justify-center overflow-auto bg-neutral-300/60 p-4">
          <div
            className="h-full bg-white shadow-xl ring-1 ring-black/10 transition-[width] duration-200"
            style={{ width: width ? `${width}px` : "100%", maxWidth: "100%" }}
          >
            <iframe
              ref={iframeRef}
              title="Site preview"
              src={`/${slug === "home" ? "" : slug}?__edit=1`}
              className="h-full w-full border-0"
            />
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
