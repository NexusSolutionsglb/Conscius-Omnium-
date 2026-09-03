"use client";

import { useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import {
  AdoptedEditorStoreProvider,
} from "./editor-store-context";
import type { EditorStoreApi } from "@/lib/editor/store";

const EditBridge = dynamic(() => import("./edit-bridge").then((m) => m.EditBridge), {
  ssr: false,
});

/**
 * Wraps the site's page tree. On the public site it is a transparent
 * pass-through — no context, no extra DOM, no editor code loaded. Only when the
 * page is the `?__edit=1` iframe *inside the editor shell* (same-origin parent
 * exposing `window.__coEditorStore`) does it adopt that store and mount the
 * editing overlay.
 */
export function MaybeEditorProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<EditorStoreApi | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (!params.has("__edit")) return;
      if (window.parent === window) return; // not framed
      const parentStore = window.parent.__coEditorStore;
      if (parentStore) setStore(parentStore);
    } catch {
      /* cross-origin parent or blocked storage — stay a pass-through */
    }
  }, []);

  if (!store) return <>{children}</>;

  return (
    <AdoptedEditorStoreProvider store={store}>
      {children}
      <EditBridge />
    </AdoptedEditorStoreProvider>
  );
}
