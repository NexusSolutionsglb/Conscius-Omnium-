"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DISCIPLINE_LABELS, type Work, type WorkImage } from "@/lib/types";
import { fromParagraphs, slugify, normalizeImageUrl } from "@/lib/utils";
import { saveWork, updateWorkImages } from "@/lib/admin/actions";
import { Card, Field, TextArea, SelectField, Toggle, SubmitButton } from "./ui";
import { MediaPickerButton } from "./media-picker";
import { UploadButton } from "./upload-button";
import { ImageField } from "./image-field";

const DISCIPLINE_OPTS = Object.entries(DISCIPLINE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  slug: "Slug",
  summary: "Summary",
  sortOrder: "Sort order",
  currency: "Currency",
  discipline: "Discipline",
  status: "Status",
  availability: "Availability",
  accent: "Accent hex",
};
const KIND_OPTS = ["cover", "gallery", "detail", "installation", "process", "drawing", "render"].map(
  (k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) }),
);

export function WorkEditor({
  work,
  collections,
}: {
  work: Work | null;
  collections: { slug: string; title: string }[];
}) {
  const router = useRouter();
  const isNew = !work;
  const [slugVal, setSlugVal] = useState(work?.slug ?? "");
  const [images, setImages] = useState<WorkImage[]>(work?.images ?? []);
  const [cover, setCover] = useState(work?.coverImage ?? images[0]?.url ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setErrors({});
    const fd = new FormData(e.currentTarget);
    fd.set("imagesJson", JSON.stringify(images));
    fd.set("coverImage", cover || images[0]?.url || "");
    const res = await saveWork(work?.id ?? null, fd);
    if (!res.ok) {
      setStatus("error");
      const fe = res.fieldErrors ?? {};
      setErrors(fe);
      const names = Object.keys(fe);
      setMessage(
        names.length
          ? `Check: ${names
              .map((n) => FIELD_LABELS[n] ?? n)
              .join(", ")}`
          : res.error,
      );
      // Scroll to the first field with an error.
      const first = names[0];
      if (first) {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${first}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setStatus("idle");
    setMessage("Saved");
    if (isNew && res.id) {
      router.replace(`/admin/works/${res.id}`);
    } else {
      router.refresh();
    }
  }

  async function persistImages(next: WorkImage[]) {
    setImages(next);
    if (work?.id) await updateWorkImages(work.id, next);
  }

  function addImage(rawUrl: string, dims?: { width?: number; height?: number }) {
    const url = normalizeImageUrl(rawUrl);
    if (!url) return;
    // Use a functional update so several uploads in quick succession each
    // append instead of clobbering one another via a stale `images` closure.
    setImages((current) => {
      if (current.some((im) => im.url === url)) return current;
      const next: WorkImage = {
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        url,
        alt: "",
        kind: current.length === 0 ? "cover" : "gallery",
        caption: null,
        width: dims?.width || null,
        height: dims?.height || null,
        sortOrder: current.length,
      };
      const updated = [...current, next];
      if (work?.id) void updateWorkImages(work.id, updated);
      return updated;
    });
    setCover((c) => c || url);
  }

  function updateImage(id: string, patch: Partial<WorkImage>) {
    persistImages(images.map((im) => (im.id === id ? { ...im, ...patch } : im)));
  }

  function moveImage(id: string, dir: -1 | 1) {
    const idx = images.findIndex((im) => im.id === id);
    const to = idx + dir;
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    [next[idx], next[to]] = [next[to], next[idx]];
    persistImages(next.map((im, i) => ({ ...im, sortOrder: i })));
  }

  function removeImage(id: string) {
    persistImages(images.filter((im) => im.id !== id).map((im, i) => ({ ...im, sortOrder: i })));
  }

  const err = (k: string) => errors[k]?.[0];

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div className="space-y-6">
        <Card title="Basic information">
          <div className="grid gap-4">
            <Field
              label="Title"
              name="title"
              required
              defaultValue={work?.title}
              error={err("title")}
              onChange={(e) => {
                if (isNew) setSlugVal(slugify(e.target.value));
              }}
            />
            <Field
              label="Slug"
              name="slug"
              value={slugVal}
              onChange={(e) =>
                setSlugVal(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]+/g, "-")
                    .replace(/-+/g, "-")
                    .replace(/^-/, ""),
                )
              }
              onBlur={(e) => setSlugVal(slugify(e.target.value))}
              hint={`the-work-name → conscious-omnium.com/work/${slugVal || "the-work-name"}`}
              error={err("slug")}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Year" name="year" defaultValue={work?.year ?? ""} placeholder="e.g. 2017" />
              <Field
                label="Sort year"
                name="yearSort"
                type="number"
                defaultValue={work?.yearSort ?? ""}
                hint="for ordering"
              />
              <Field label="Sort order" name="sortOrder" type="number" defaultValue={work?.sortOrder ?? 100} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Discipline"
                name="discipline"
                options={DISCIPLINE_OPTS}
                defaultValue={work?.discipline ?? "architecture"}
              />
              <Field label="Kind / sub-type" name="kind" defaultValue={work?.kind ?? ""} placeholder="Miniature & photograph" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Medium" name="medium" defaultValue={work?.medium ?? ""} />
              <Field label="Dimensions" name="dimensions" defaultValue={work?.dimensions ?? ""} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Location / site" name="location" defaultValue={work?.location ?? ""} />
              <Field label="Role" name="role" defaultValue={work?.role ?? ""} />
              <Field label="Client / context" name="client" defaultValue={work?.client ?? ""} />
            </div>
          </div>
        </Card>

        <Card title="Description">
          <div className="grid gap-4">
            <Field
              label="Summary (one line)"
              name="summary"
              required
              defaultValue={work?.summary}
              error={err("summary")}
            />
            <TextArea
              label="Description"
              name="description"
              defaultValue={fromParagraphs(work?.description)}
              hint="Blank line separates paragraphs."
              rows={6}
            />
            <TextArea label="Artist statement" name="statement" defaultValue={work?.statement ?? ""} rows={2} />
            <TextArea label="Concept" name="concept" defaultValue={work?.concept ?? ""} rows={2} />
            <TextArea label="Process" name="process" defaultValue={work?.process ?? ""} rows={2} />
          </div>
        </Card>

        <Card title="Media">
          {!work && (
            <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
              You can add images now — they’re saved with the work when you press
              “Create work”.
            </p>
          )}
          <div className="space-y-3">
            {images.map((im, i) => (
              <div key={im.id} className="flex gap-3 rounded-lg border border-neutral-200 p-2.5">
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-neutral-100">
                  {im.url && (
                    <Image src={im.url} alt="" fill sizes="96px" className="object-cover" unoptimized />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    value={im.alt}
                    onChange={(e) => updateImage(im.id, { alt: e.target.value })}
                    placeholder="Alt text (describe the image)"
                    className="w-full rounded border border-neutral-200 px-2 py-1 text-[12px]"
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <select
                      value={im.kind}
                      onChange={(e) => updateImage(im.id, { kind: e.target.value as WorkImage["kind"] })}
                      className="rounded border border-neutral-200 px-1.5 py-1 text-[11px]"
                    >
                      {KIND_OPTS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <input
                      value={im.caption ?? ""}
                      onChange={(e) => updateImage(im.id, { caption: e.target.value })}
                      placeholder="Caption"
                      className="flex-1 rounded border border-neutral-200 px-2 py-1 text-[11px]"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                    <button type="button" onClick={() => moveImage(im.id, -1)} disabled={i === 0}>
                      ↑
                    </button>
                    <button type="button" onClick={() => moveImage(im.id, 1)} disabled={i === images.length - 1}>
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setCover(im.url)}
                      className={cover === im.url ? "font-semibold text-neutral-900" : ""}
                    >
                      {cover === im.url ? "Cover ✓" : "Set cover"}
                    </button>
                    <button type="button" onClick={() => removeImage(im.id)} className="text-red-500">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <UploadButton
                folder="works"
                onUploaded={(img) => addImage(img.url, { width: img.width, height: img.height })}
              />
              <MediaPickerButton onPick={(url) => addImage(url)} />
            </div>
            <div className="flex gap-2">
              <AddByUrl onAdd={addImage} />
            </div>
            <p className="text-[11px] text-neutral-400">
              Uploads are compressed in your browser (resized to 2560px max edge,
              re-encoded as WebP) before storage — high quality, small files.
            </p>
          </div>
        </Card>

        <Card title="SEO">
          <div className="grid gap-4">
            <Field label="SEO title" name="seoTitle" defaultValue={work?.seo?.title ?? ""} />
            <TextArea label="SEO description" name="seoDescription" defaultValue={work?.seo?.description ?? ""} rows={2} />
            <ImageField
              label="OG image"
              name="ogImage"
              folder="og"
              defaultValue={work?.seo?.ogImage ?? ""}
              hint="Shown when the work is shared on social media."
            />
            <Field
              label="Related work slugs"
              name="relatedSlugs"
              defaultValue={(work?.relatedSlugs ?? []).join(", ")}
              hint="Comma-separated. Auto-filled by collection/discipline if left blank."
            />
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <Card title="Publishing">
          <div className="space-y-3">
            <SelectField
              label="Status"
              name="status"
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
              defaultValue={work?.status ?? "draft"}
            />
            <Toggle label="Featured" name="featured" defaultChecked={work?.featured} hint="Shows on the home page" />
            <SelectField
              label="Collection"
              name="collectionSlug"
              options={[{ value: "", label: "None" }, ...collections.map((c) => ({ value: c.slug, label: c.title }))]}
              defaultValue={work?.collectionSlug ?? ""}
            />
          </div>
        </Card>

        <Card title="Availability">
          <div className="space-y-3">
            <SelectField
              label="Availability"
              name="availability"
              options={[
                { value: "available", label: "Available" },
                { value: "sold", label: "Sold" },
                { value: "on-hold", label: "On hold" },
                { value: "not-for-sale", label: "Not for sale" },
                { value: "enquire", label: "Enquire" },
              ]}
              defaultValue={work?.availability ?? "enquire"}
            />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Price" name="price" type="number" defaultValue={work?.price ?? ""} />
              <Field label="Currency" name="currency" defaultValue={work?.currency ?? "INR"} required />
            </div>
            <Toggle label="Show price publicly" name="priceVisible" defaultChecked={work?.priceVisible} />
            <Field label="Accent hex" name="accent" defaultValue={work?.accent ?? ""} placeholder="#8a6f4e" />
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <SubmitButton>{isNew ? "Create work" : "Save changes"}</SubmitButton>
          {work && (
            <a href={`/work/${work.slug}`} target="_blank" rel="noreferrer" className="text-[12px] text-neutral-500 hover:underline">
              Preview ↗
            </a>
          )}
        </div>
        {message && (
          <p className={`text-[12px] ${status === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {message}
          </p>
        )}
      </aside>
    </form>
  );
}

function AddByUrl({ onAdd }: { onAdd: (url: string) => void }) {
  const [url, setUrl] = useState("");
  return (
    <div className="flex flex-1 gap-1">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="…or paste an image URL"
        className="flex-1 rounded-md border border-neutral-300 px-2.5 py-1.5 text-[12px]"
      />
      <button
        type="button"
        onClick={() => {
          if (url.trim()) {
            onAdd(url.trim());
            setUrl("");
          }
        }}
        className="rounded-md border border-neutral-300 px-3 text-[12px] font-medium hover:bg-neutral-50"
      >
        Add
      </button>
    </div>
  );
}
