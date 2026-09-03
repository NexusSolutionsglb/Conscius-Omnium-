"use client";

import { getPath } from "@/lib/editor/paths";
import { pageContentDefaults } from "@/lib/content/defaults";
import { useEditorStore, useEditorStoreApi } from "./editor-store-context";

const LABELS: Record<string, string> = {
  eyebrow: "Eyebrow",
  heading: "Heading",
  body: "Body",
  linkLabel: "Link label",
  ctaLabel: "Button label",
  supporting: "Supporting text",
  intro: "Intro",
  caption: "Caption",
  image: "Image URL",
  portraitFallbackCaption: "Portrait fallback caption",
  heroEyebrow: "Eyebrow",
  educationEyebrow: "Education heading",
  listEyebrow: "List heading",
  listEmpty: "Empty message",
  trainingEyebrow: "Training heading",
  endCtaLabel: "Button label",
};

function label(key: string) {
  return LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export function InspectorPanel() {
  const api = useEditorStoreApi()!;
  const selection = useEditorStore((s) => s.selection);
  const pages = useEditorStore((s) => s.pages);

  if (!selection || selection.kind !== "section") return null;

  // `@section:<key>` → an object at `pages[slug][key]`
  // `@item:<path>:<index>` → an object at `pages[slug][path][index]`
  const isItem = selection.id.startsWith("@item:");
  const key = isItem
    ? (() => {
        const rest = selection.id.slice("@item:".length);
        const i = rest.lastIndexOf(":");
        return `${rest.slice(0, i)}.${rest.slice(i + 1)}`;
      })()
    : selection.id.replace("@section:", "");

  const titleKey = isItem ? key.split(".")[0] : key;
  const value = getPath<Record<string, unknown>>(pages[selection.slug], key) ?? {};
  const hasDefault =
    !isItem &&
    Object.prototype.hasOwnProperty.call(pageContentDefaults[selection.slug], key);
  const page = pages[selection.slug] as { hidden?: string[] };
  const isHidden = !isItem && page.hidden?.includes(key);

  const set = (path: string, v: unknown) => api.getState().setValue(selection.slug, path, v);

  return (
    <div className="space-y-4 p-4 text-[12.5px]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
          {label(titleKey)}
        </p>
        <button
          onClick={() => api.getState().select(null)}
          className="text-neutral-400 hover:text-neutral-900"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(value).map(([field, fieldValue]) => (
          <Field
            key={field}
            fieldKey={field}
            value={fieldValue}
            onChange={(v) => set(`${key}.${field}`, v)}
            onNestedChange={(nk, v) => set(`${key}.${field}.${nk}`, v)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-neutral-200 pt-3">
        {"hidden" in page && (
          <button
            onClick={() => api.getState().toggleHidden(selection.slug, key)}
            className="rounded-md border border-neutral-300 px-2.5 py-1 hover:bg-neutral-50"
          >
            {isHidden ? "Show section" : "Hide section"}
          </button>
        )}
        {hasDefault && (
          <button
            onClick={() => {
              if (confirm(`Restore "${label(key)}" to its default text?`)) {
                api.getState().restoreSection(selection.slug, key);
              }
            }}
            className="rounded-md border border-neutral-300 px-2.5 py-1 hover:bg-neutral-50"
          >
            Restore section
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  fieldKey,
  value,
  onChange,
  onNestedChange,
}: {
  fieldKey: string;
  value: unknown;
  onChange: (v: unknown) => void;
  onNestedChange: (nestedKey: string, v: unknown) => void;
}) {
  if (typeof value === "string") {
    const long = value.length > 60 || fieldKey === "body" || fieldKey === "supporting";
    return (
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium text-neutral-500">{label(fieldKey)}</span>
        {long ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full resize-y rounded-md border border-neutral-300 px-2 py-1.5 leading-relaxed"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5"
          />
        )}
      </label>
    );
  }

  if (Array.isArray(value)) {
    return (
      <p className="text-[11px] text-neutral-400">
        {label(fieldKey)}: {value.length} item(s) — edit on the page.
      </p>
    );
  }

  if (value && typeof value === "object") {
    return (
      <div className="rounded-md border border-neutral-200 p-2">
        <p className="mb-1.5 text-[11px] font-medium text-neutral-500">{label(fieldKey)}</p>
        <div className="space-y-2">
          {Object.entries(value as Record<string, unknown>).map(([nk, nv]) => (
            <label key={nk} className="block">
              <span className="mb-0.5 block text-[10px] text-neutral-400">{label(nk)}</span>
              <textarea
                value={String(nv ?? "")}
                onChange={(e) => onNestedChange(nk, e.target.value)}
                rows={2}
                className="w-full resize-y rounded-md border border-neutral-300 px-2 py-1 text-[12px]"
              />
            </label>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
