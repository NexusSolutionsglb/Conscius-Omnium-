"use client";

import { useState } from "react";
import { getPath } from "@/lib/editor/paths";
import { bindToPath, writeBind } from "@/lib/editor/bind";
import { pageContentDefaults } from "@/lib/content/defaults";
import {
  APPEARANCE_SCHEMA,
  getSchema,
  type FieldSpec,
} from "@/lib/editor/inspector-schema";
import type { CustomBlock } from "@/lib/types";
import { useEditorStore, useEditorStoreApi } from "./editor-store-context";
import { ImageDialog } from "./image-dialog";
import { GalleryEditor } from "./gallery-editor";

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
  const selection = useEditorStore((s) => s.selection);
  const blocks = useEditorStore((s) =>
    selection?.slug === "home" ? (s.pages.home.blocks ?? {}) : {},
  );
  if (!selection || selection.kind !== "section") return null;

  // A custom block section: `@section:block:<id>` → schema by block type.
  if (selection.id.startsWith("@section:block:")) {
    const id = selection.id.slice("@section:block:".length);
    const block = (blocks as Record<string, CustomBlock>)[id];
    if (!block) return <Empty />;
    return (
      <SchemaInspector
        schema={`block-${block.type}`}
        bind={`${selection.slug}.blocks.${id}`}
        label={selection.label}
      />
    );
  }

  if (selection.schema && selection.bind) {
    return <SchemaInspector schema={selection.schema} bind={selection.bind} label={selection.label} />;
  }
  if (selection.id.startsWith("@node:")) return <Empty />;
  return <SectionInspector />;
}

/* ─────────────── schema-driven record inspector ─────────────── */

function SchemaInspector({
  schema: schemaKey,
  bind,
  label: fallbackLabel,
}: {
  schema: string;
  bind: string;
  label?: string;
}) {
  const api = useEditorStoreApi()!;
  const schema = getSchema(schemaKey);
  // Subscribe so field values re-render on every edit.
  const record = useEditorStore((s) => getPath<Record<string, unknown>>(s, bindToPath(bind)));
  if (!schema || !record) return <Empty />;

  return (
    <div className="space-y-4 p-4 text-[12.5px]">
      <Head
        title={fallbackLabel || schema.title}
        onClose={() => api.getState().select(null)}
      />
      <div className="space-y-3">
        {schema.fields.map((f) => (
          <SchemaField key={f.key} field={f} bind={`${bind}.${f.key}`} />
        ))}
      </div>
    </div>
  );
}

function SchemaField({ field, bind }: { field: FieldSpec; bind: string }) {
  const api = useEditorStoreApi()!;
  const value = useEditorStore((s) => getPath<unknown>(s, bindToPath(bind)));
  const works = useEditorStore((s) => s.works);
  const collections = useEditorStore((s) => s.collections);
  const [imgOpen, setImgOpen] = useState(false);

  const set = (v: unknown) => writeBind(api, bind, v);

  const options =
    field.optionsFrom === "works"
      ? works.map((w) => ({ value: w.slug, label: w.title }))
      : field.optionsFrom === "collections"
        ? collections.map((c) => ({ value: c.slug, label: c.title }))
        : (field.options ?? []);

  const wrap = (children: React.ReactNode) => (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-neutral-500">{field.label}</span>
      {children}
      {field.help && <span className="mt-1 block text-[10.5px] text-neutral-400">{field.help}</span>}
    </label>
  );

  switch (field.type) {
    case "gallery":
      return (
        <div>
          <span className="mb-1 block text-[11px] font-medium text-neutral-500">{field.label}</span>
          <GalleryEditor bind={bind} folder={field.folder ?? "work"} />
        </div>
      );

    case "toggle":
      return (
        <label className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium text-neutral-500">{field.label}</span>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => set(e.target.checked)}
            className="h-4 w-4 cursor-pointer"
          />
        </label>
      );

    case "color":
      return wrap(
        <span className="flex items-center gap-2">
          <input
            type="color"
            value={typeof value === "string" && value ? value : "#4a4a4a"}
            onChange={(e) => set(e.target.value)}
            className="h-7 w-10 cursor-pointer rounded border border-neutral-300"
          />
          <input
            value={typeof value === "string" ? value : ""}
            onChange={(e) => set(e.target.value || null)}
            placeholder="#rrggbb / empty"
            className="flex-1 rounded-md border border-neutral-300 px-2 py-1"
          />
        </span>,
      );

    case "number":
      return wrap(
        <input
          type="number"
          value={value == null ? "" : String(value)}
          onChange={(e) => set(e.target.value === "" ? null : Number(e.target.value))}
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5"
        />,
      );

    case "select":
      return wrap(
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(e) => set(e.target.value === "" && field.nullable ? null : e.target.value)}
          className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5"
        >
          {field.nullable && <option value="">— None —</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>,
      );

    case "image": {
      const url = typeof value === "string" ? value : "";
      return (
        <div>
          {wrap(
            <div className="flex items-center gap-2">
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded border border-neutral-300 bg-neutral-100 text-[9px] text-neutral-400">
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="h-full w-full object-cover" />
                ) : (
                  "none"
                )}
              </div>
              <button
                onClick={() => setImgOpen(true)}
                className="rounded-md border border-neutral-300 px-2.5 py-1 hover:bg-neutral-50"
              >
                {url ? "Replace" : "Choose"}
              </button>
              {url && (
                <button
                  onClick={() => set("")}
                  className="rounded-md border border-neutral-200 px-2 py-1 text-red-500 hover:bg-red-50"
                >
                  Remove
                </button>
              )}
            </div>,
          )}
          {imgOpen && (
            <ImageDialog
              bind={bind}
              folder={field.folder ?? "media"}
              onClose={() => setImgOpen(false)}
            />
          )}
        </div>
      );
    }

    case "paragraphs": {
      const text = Array.isArray(value) ? (value as string[]).join("\n\n") : String(value ?? "");
      return wrap(
        <textarea
          value={text}
          onChange={(e) =>
            set(
              e.target.value
                .split(/\n{2,}/)
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          rows={field.rows ?? 5}
          className="w-full resize-y rounded-md border border-neutral-300 px-2 py-1.5 leading-relaxed"
        />,
      );
    }

    case "textarea":
      return wrap(
        <textarea
          value={String(value ?? "")}
          onChange={(e) => set(e.target.value)}
          rows={field.rows ?? 3}
          placeholder={field.placeholder}
          className="w-full resize-y rounded-md border border-neutral-300 px-2 py-1.5 leading-relaxed"
        />,
      );

    default: // text | link
      return wrap(
        <input
          value={String(value ?? "")}
          onChange={(e) => set(e.target.value)}
          placeholder={field.placeholder ?? (field.type === "link" ? "/path or https://…" : undefined)}
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5"
        />,
      );
  }
}

/* ─────────────── generic page-section inspector (unchanged) ─────────────── */

function SectionInspector() {
  const api = useEditorStoreApi()!;
  const selection = useEditorStore((s) => s.selection);
  const pages = useEditorStore((s) => s.pages);

  if (!selection || selection.kind !== "section") return null;

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

  // Built-in home sections also get background + spacing controls.
  const showAppearance = !isItem && selection.slug === "home";

  return (
    <div className="space-y-4 p-4 text-[12.5px]">
      <Head title={label(titleKey)} onClose={() => api.getState().select(null)} />

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

      {showAppearance && (
        <div className="space-y-3 border-t border-neutral-200 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
            Appearance
          </p>
          {APPEARANCE_SCHEMA.fields.map((f) => (
            <SchemaField key={f.key} field={f} bind={`${selection.slug}.sectionStyles.${key}.${f.key}`} />
          ))}
        </div>
      )}

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

function Head({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
        {title}
      </p>
      <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900">
        ✕
      </button>
    </div>
  );
}

function Empty() {
  return <p className="p-4 text-[12px] text-neutral-400">Nothing to edit here.</p>;
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
