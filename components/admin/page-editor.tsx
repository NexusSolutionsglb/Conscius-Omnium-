"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ManagedPage, PageSection } from "@/lib/types";
import { fromParagraphs, toParagraphs } from "@/lib/utils";
import { savePage } from "@/lib/admin/actions";
import { Card, Field, TextArea, SelectField, SubmitButton } from "./ui";
import { UploadButton } from "./upload-button";
import { MediaPickerButton } from "./media-picker";

const LAYOUTS = ["text", "image-left", "image-right", "full-image", "quote"].map((l) => ({
  value: l,
  label: l,
}));

export function PageEditor({ page }: { page: ManagedPage }) {
  const router = useRouter();
  const [sections, setSections] = useState<PageSection[]>(page.sections);
  const [msg, setMsg] = useState<string | null>(null);

  function patch(id: string, p: Partial<PageSection>) {
    setSections((s) => s.map((sec) => (sec.id === id ? { ...sec, ...p } : sec)));
  }
  function move(i: number, dir: -1 | 1) {
    const to = i + dir;
    if (to < 0 || to >= sections.length) return;
    const next = [...sections];
    [next[i], next[to]] = [next[to], next[i]];
    setSections(next);
  }
  function add() {
    setSections((s) => [
      ...s,
      { id: `sec-${Date.now()}`, eyebrow: "", heading: "", body: [], layout: "text" },
    ]);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("sectionsJson", JSON.stringify(sections));
    const res = await savePage(page.slug, fd);
    setMsg(res.ok ? "Saved" : res.error);
    if (res.ok) router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card title="Page">
        <div className="grid gap-4">
          <Field label="Title" name="title" defaultValue={page.title} required />
          <TextArea label="Intro" name="intro" defaultValue={page.intro ?? ""} rows={3} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SEO title" name="seoTitle" defaultValue={page.seo?.title ?? ""} />
            <Field label="SEO description" name="seoDescription" defaultValue={page.seo?.description ?? ""} />
          </div>
        </div>
      </Card>

      {sections.map((sec, i) => (
        <Card key={sec.id} title={`Section ${i + 1}`}>
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Eyebrow" name={`_eyebrow_${sec.id}`} value={sec.eyebrow ?? ""} onChange={(e) => patch(sec.id, { eyebrow: e.target.value })} />
              <SelectField label="Layout" name={`_layout_${sec.id}`} options={LAYOUTS} value={sec.layout ?? "text"} onChange={(e) => patch(sec.id, { layout: e.target.value as PageSection["layout"] })} />
            </div>
            <Field label="Heading" name={`_heading_${sec.id}`} value={sec.heading ?? ""} onChange={(e) => patch(sec.id, { heading: e.target.value })} />
            <TextArea
              label="Body"
              name={`_body_${sec.id}`}
              value={fromParagraphs(sec.body)}
              rows={4}
              onChange={(e) => patch(sec.id, { body: toParagraphs(e.target.value) })}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Field label="Image URL" name={`_image_${sec.id}`} value={sec.image ?? ""} onChange={(e) => patch(sec.id, { image: e.target.value })} />
                <div className="flex flex-wrap items-center gap-2">
                  <UploadButton
                    folder="studio"
                    multiple={false}
                    onUploaded={(img) => patch(sec.id, { image: img.url })}
                  />
                  <MediaPickerButton onPick={(u) => patch(sec.id, { image: u })} />
                </div>
              </div>
              <Field label="Caption" name={`_caption_${sec.id}`} value={sec.caption ?? ""} onChange={(e) => patch(sec.id, { caption: e.target.value })} />
            </div>
            <div className="flex gap-3 text-[11px] text-neutral-400">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>↑ up</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === sections.length - 1}>↓ down</button>
              <button type="button" className="text-red-500" onClick={() => setSections((s) => s.filter((x) => x.id !== sec.id))}>
                remove
              </button>
            </div>
          </div>
        </Card>
      ))}

      <button type="button" onClick={add} className="rounded-md border border-dashed border-neutral-300 px-4 py-2 text-[12px] text-neutral-500 hover:border-neutral-400">
        + Add section
      </button>

      <div className="flex items-center gap-3">
        <SubmitButton>Save page</SubmitButton>
        <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-[12px] text-neutral-500 hover:underline">
          Preview ↗
        </a>
        {msg && <span className="text-[12px] text-emerald-600">{msg}</span>}
      </div>
    </form>
  );
}
