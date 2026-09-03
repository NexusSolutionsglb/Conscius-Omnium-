"use client";

import { useState } from "react";
import { FONT_CHOICES, THEME_DEFAULTS } from "@/lib/editor/theme";
import type { ThemeTokens } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEditorStore, useEditorStoreApi } from "./editor-store-context";

const COLOR_FIELDS: { key: keyof ThemeTokens; label: string }[] = [
  { key: "colorPaper", label: "Page background" },
  { key: "colorInk", label: "Headings / dark text" },
  { key: "colorInkSoft", label: "Body text" },
  { key: "colorInkMute", label: "Muted / captions" },
  { key: "colorAccent", label: "Accent" },
  { key: "colorAccentDeep", label: "Accent (hover)" },
];

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const api = useEditorStoreApi()!;
  const [tab, setTab] = useState<"theme" | "chrome">("theme");
  const theme = useEditorStore((s) => s.settings.theme);
  const nav = useEditorStore((s) => s.settings.nav);
  const brand = useEditorStore((s) => s.settings.brand);
  const brandLine = useEditorStore((s) => s.settings.brandLine);
  const tagline = useEditorStore((s) => s.settings.tagline);
  const footerNote = useEditorStore((s) => s.settings.footerNote);

  const setTheme = (key: keyof ThemeTokens, value: unknown) =>
    api.getState().setSettings(`theme.${key}`, value === "" ? undefined : value);
  const setField = (path: string, value: unknown) => api.getState().setSettings(path, value);

  return (
    <div className="flex h-full flex-col text-[12.5px]">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <div className="flex gap-1">
          {(["theme", "chrome"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium",
                tab === t ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100",
              )}
            >
              {t === "theme" ? "Theme" : "Navigation & footer"}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900">
          ✕
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {tab === "theme" ? (
          <>
            <section className="space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Colours
              </p>
              {COLOR_FIELDS.map(({ key, label }) => {
                const value = (theme[key] as string) ?? THEME_DEFAULTS[key as keyof typeof THEME_DEFAULTS] ?? "#000000";
                return (
                  <label key={key} className="flex items-center justify-between gap-3">
                    <span className="text-neutral-600">{label}</span>
                    <span className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={String(value)}
                        onChange={(e) => setTheme(key, e.target.value)}
                        className="h-7 w-10 cursor-pointer rounded border border-neutral-300"
                      />
                      {theme[key] !== undefined && (
                        <button
                          onClick={() => setTheme(key, "")}
                          title="Reset"
                          className="text-neutral-400 hover:text-neutral-900"
                        >
                          ⟲
                        </button>
                      )}
                    </span>
                  </label>
                );
              })}
            </section>

            <section className="space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Typography
              </p>
              <label className="block">
                <span className="mb-1 block text-neutral-500">Headings font</span>
                <select
                  value={theme.fontDisplay ?? "fraunces"}
                  onChange={(e) => setTheme("fontDisplay", e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-2 py-1.5"
                >
                  {Object.entries(FONT_CHOICES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-neutral-500">Body font</span>
                <select
                  value={theme.fontSans ?? "inter"}
                  onChange={(e) => setTheme("fontSans", e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-2 py-1.5"
                >
                  {Object.entries(FONT_CHOICES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 flex justify-between text-neutral-500">
                  <span>Type scale</span>
                  <span>{(theme.typeScale ?? 1).toFixed(2)}×</span>
                </span>
                <input
                  type="range"
                  min={0.85}
                  max={1.2}
                  step={0.01}
                  value={theme.typeScale ?? 1}
                  onChange={(e) => setTheme("typeScale", Number(e.target.value))}
                  className="w-full"
                />
              </label>
              <label className="block">
                <span className="mb-1 flex justify-between text-neutral-500">
                  <span>Max content width</span>
                  <span>{theme.containerWidth ?? 1560}px</span>
                </span>
                <input
                  type="range"
                  min={1100}
                  max={2000}
                  step={20}
                  value={theme.containerWidth ?? 1560}
                  onChange={(e) => setTheme("containerWidth", Number(e.target.value))}
                  className="w-full"
                />
              </label>
            </section>

            <button
              onClick={() => {
                if (confirm("Reset all theme values to the site defaults?")) {
                  api.getState().setSettings("theme", {});
                }
              }}
              className="w-full rounded-md border border-neutral-300 py-1.5 hover:bg-neutral-50"
            >
              Reset theme
            </button>
          </>
        ) : (
          <>
            <section className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Brand
              </p>
              <LabeledInput label="Brand name" value={brand} onChange={(v) => setField("brand", v)} />
              <LabeledInput
                label="Brand line"
                value={brandLine}
                onChange={(v) => setField("brandLine", v)}
              />
              <LabeledInput label="Tagline" value={tagline} onChange={(v) => setField("tagline", v)} />
            </section>

            <section className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Navigation
              </p>
              {nav.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input
                    value={item.label}
                    onChange={(e) => setField(`nav.${i}.label`, e.target.value)}
                    placeholder="Label"
                    className="w-24 rounded-md border border-neutral-300 px-2 py-1"
                  />
                  <input
                    value={item.href}
                    onChange={(e) => setField(`nav.${i}.href`, e.target.value)}
                    placeholder="/path"
                    className="flex-1 rounded-md border border-neutral-300 px-2 py-1"
                  />
                  <button
                    onClick={() => i > 0 && api.getState().setSettings("nav",
                      moveItem(nav, i, i - 1))}
                    disabled={i === 0}
                    className="px-1 text-neutral-400 enabled:hover:text-neutral-900 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => i < nav.length - 1 && api.getState().setSettings("nav",
                      moveItem(nav, i, i + 1))}
                    disabled={i === nav.length - 1}
                    className="px-1 text-neutral-400 enabled:hover:text-neutral-900 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() =>
                      api.getState().setSettings("nav", nav.filter((_, j) => j !== i))
                    }
                    className="px-1 text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  api.getState().setSettings("nav", [...nav, { label: "New", href: "/" }])
                }
                className="w-full rounded-md border border-dashed border-neutral-300 py-1.5 text-neutral-500 hover:border-neutral-500"
              >
                + Add link
              </button>
            </section>

            <section className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Footer
              </p>
              <label className="block">
                <span className="mb-1 block text-neutral-500">Footer note</span>
                <textarea
                  value={footerNote}
                  onChange={(e) => setField("footerNote", e.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-md border border-neutral-300 px-2 py-1.5"
                />
              </label>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [m] = next.splice(from, 1);
  next.splice(to, 0, m);
  return next;
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-neutral-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-2 py-1.5"
      />
    </label>
  );
}
