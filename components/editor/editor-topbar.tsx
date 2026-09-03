"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EDITABLE_PAGE_SLUGS, type EditablePageSlug } from "@/lib/content/defaults";
import type { Device } from "@/lib/editor/types";
import { cn } from "@/lib/utils";
import { useEditorStore, useEditorStoreApi } from "./editor-store-context";

const PAGE_LABELS: Record<EditablePageSlug, string> = {
  home: "Home",
  about: "About",
  studio: "Studio",
  work: "Work",
  exhibitions: "Exhibitions",
  contact: "Contact",
};

const DEVICES: { id: Device; label: string; icon: string }[] = [
  { id: "desktop", label: "Desktop", icon: "🖥" },
  { id: "tablet", label: "Tablet", icon: "▭" },
  { id: "mobile", label: "Mobile", icon: "▯" },
];

export function EditorTopbar({
  slug,
  publishing,
  onPublish,
  settingsOpen,
  onToggleSettings,
}: {
  slug: EditablePageSlug;
  publishing: boolean;
  onPublish: () => void;
  settingsOpen: boolean;
  onToggleSettings: () => void;
}) {
  const router = useRouter();
  const api = useEditorStoreApi()!;
  const device = useEditorStore((s) => s.device);
  const mode = useEditorStore((s) => s.mode);
  const dirty = useEditorStore((s) => s.dirty);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);

  const goto = (next: EditablePageSlug) => {
    if (api.getState().dirty && !confirm("Switch pages? Unsaved edits stay in your draft.")) return;
    router.push(`/admin/edit/${next}`);
  };

  return (
    <header className="z-10 flex h-12 shrink-0 items-center gap-3 border-b border-neutral-300 bg-white px-3 text-[12.5px]">
      <Link
        href="/admin"
        className="rounded px-2 py-1 font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
      >
        ← Admin
      </Link>

      <select
        value={slug}
        onChange={(e) => goto(e.target.value as EditablePageSlug)}
        className="rounded-md border border-neutral-300 bg-white px-2 py-1 font-medium"
      >
        {EDITABLE_PAGE_SLUGS.map((s) => (
          <option key={s} value={s}>
            {PAGE_LABELS[s]}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-0.5 rounded-md bg-neutral-100 p-0.5">
        {DEVICES.map((d) => (
          <button
            key={d.id}
            title={d.label}
            onClick={() => api.getState().setDevice(d.id)}
            className={cn(
              "rounded px-2 py-1 text-[13px]",
              device === d.id ? "bg-white shadow-sm" : "text-neutral-500 hover:text-neutral-900",
            )}
          >
            {d.icon}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-0.5">
        <button
          title="Undo"
          disabled={!canUndo}
          onClick={() => api.getState().undo()}
          className="rounded px-2 py-1 text-neutral-500 enabled:hover:bg-neutral-100 enabled:hover:text-neutral-900 disabled:opacity-30"
        >
          ↶
        </button>
        <button
          title="Redo"
          disabled={!canRedo}
          onClick={() => api.getState().redo()}
          className="rounded px-2 py-1 text-neutral-500 enabled:hover:bg-neutral-100 enabled:hover:text-neutral-900 disabled:opacity-30"
        >
          ↷
        </button>
      </div>

      <button
        onClick={onToggleSettings}
        className={cn(
          "rounded px-2 py-1 font-medium",
          settingsOpen
            ? "bg-neutral-900 text-white"
            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
        )}
      >
        Theme &amp; nav
      </button>

      <button
        onClick={() => {
          if (
            confirm(
              "Restore the entire website to its default content? Your current edits stay in the draft until you publish.",
            )
          ) {
            api.getState().restoreAll();
          }
        }}
        className="rounded px-2 py-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
      >
        Restore defaults
      </button>

      <div className="ml-auto flex items-center gap-2">
        {dirty && <span className="text-[11px] text-amber-600">● Unsaved draft</span>}

        <button
          onClick={() => api.getState().setMode(mode === "edit" ? "preview" : "edit")}
          className={cn(
            "rounded-md border px-3 py-1.5 font-medium",
            mode === "preview"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 text-neutral-800 hover:bg-neutral-50",
          )}
        >
          {mode === "preview" ? "Exit preview" : "Preview"}
        </button>

        <button
          onClick={onPublish}
          disabled={publishing || !dirty}
          className="rounded-md bg-emerald-600 px-3.5 py-1.5 font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
        >
          {publishing ? "Publishing…" : "Publish"}
        </button>
      </div>
    </header>
  );
}
