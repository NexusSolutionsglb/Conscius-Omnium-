"use client";

import {
  createContext,
  useContext,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createEditorStore, type EditorStoreApi } from "@/lib/editor/store";
import type { EditorSnapshot } from "@/lib/editor/types";

/**
 * The editor store is a single instance created by the editor shell (parent
 * window) and shared, by reference, with the `?__edit=1` iframe via
 * `window.__coEditorStore`. Same-origin, so this is a plain property read — no
 * serialization, no message channel.
 */
declare global {
  interface Window {
    __coEditorStore?: EditorStoreApi;
  }
}

const StoreContext = createContext<EditorStoreApi | null>(null);

/** Used by the editor shell (parent). Creates + publishes the store. */
export function EditorStoreProvider({
  initial,
  children,
}: {
  initial: EditorSnapshot;
  children: ReactNode;
}) {
  const ref = useRef<EditorStoreApi | undefined>(undefined);
  if (!ref.current) {
    ref.current = createEditorStore(initial);
    if (typeof window !== "undefined") window.__coEditorStore = ref.current;
  }
  return <StoreContext.Provider value={ref.current}>{children}</StoreContext.Provider>;
}

/**
 * Used inside the `?__edit=1` iframe. Adopts the parent window's store. Always
 * mounted (even with `store={null}` on the public site) so adopting the store
 * later never remounts the page subtree.
 */
export function AdoptedEditorStoreProvider({
  store,
  children,
}: {
  store: EditorStoreApi | null;
  children: ReactNode;
}) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useEditorStoreApi(): EditorStoreApi | null {
  return useContext(StoreContext);
}

export function useEditorStore<T>(selector: (s: ReturnType<EditorStoreApi["getState"]>) => T): T {
  const api = useContext(StoreContext);
  if (!api) {
    throw new Error("useEditorStore must be used within an EditorStoreProvider");
  }
  return useSyncExternalStore(
    api.subscribe,
    () => selector(api.getState()),
    () => selector(api.getState()),
  );
}

/** Non-throwing variant for components that render both in and out of the editor. */
export function useOptionalEditorStore<T>(
  selector: (s: ReturnType<EditorStoreApi["getState"]>) => T,
): T | undefined {
  const api = useContext(StoreContext);
  return useSyncExternalStore(
    api ? api.subscribe : () => () => {},
    () => (api ? selector(api.getState()) : undefined),
    () => (api ? selector(api.getState()) : undefined),
  );
}
