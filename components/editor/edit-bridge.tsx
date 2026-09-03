"use client";

import { useEffect } from "react";
import { themeToCss } from "@/lib/editor/theme";
import { useEditorStore, useEditorStoreApi } from "./editor-store-context";
import { EDITOR_CSS } from "./editor-css";
import { SectionOverlay } from "./section-overlay";

/**
 * Mounted inside the `?__edit=1` iframe. Adds the editing affordances on top of
 * the real, unmodified page: editor stylesheet, link suppression while editing,
 * and the section hover / selection overlay. Unmounting it (preview mode does
 * not — it stays but goes dormant) would leave the page pristine.
 */
export function EditBridge() {
  const api = useEditorStoreApi();
  const mode = useEditorStore((s) => s.mode);
  const theme = useEditorStore((s) => s.settings.theme);
  const themeCss = themeToCss(theme);

  // Tell the shell the frame is ready (re-fires on client navigation remount).
  useEffect(() => {
    try {
      window.dispatchEvent(new Event("co-edit-bridge-ready"));
      window.parent?.dispatchEvent?.(new Event("co-edit-bridge-ready"));
    } catch {
      /* ignore */
    }
  }, []);

  // While editing, clicks must place a caret / select — never navigate.
  useEffect(() => {
    if (!api) return;
    const onClick = (e: MouseEvent) => {
      if (api.getState().mode !== "edit") return;
      const el = e.target as HTMLElement | null;
      const anchor = el?.closest("a");
      if (anchor && !anchor.closest("[data-editor-ui]")) {
        e.preventDefault();
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [api]);

  // Reflect the current mode on <html> so the stylesheet can react.
  useEffect(() => {
    document.documentElement.dataset.coEdit = mode;
    return () => {
      delete document.documentElement.dataset.coEdit;
    };
  }, [mode]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: EDITOR_CSS }} data-editor-ui="" />
      {themeCss && (
        <style dangerouslySetInnerHTML={{ __html: themeCss }} data-editor-theme="" />
      )}
      <SectionOverlay />
    </>
  );
}
