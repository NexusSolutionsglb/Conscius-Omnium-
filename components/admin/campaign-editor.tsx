"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CampaignSection, NewsletterCampaign } from "@/lib/types";
import {
  deleteCampaign,
  saveCampaign,
  sendCampaign,
  sendCampaignTest,
} from "@/lib/admin/newsletter-actions";
import { Card } from "./ui";

const labelCls =
  "text-[11px] font-medium uppercase tracking-[0.12em] text-ink-mute";
const inputCls =
  "mt-1 w-full rounded-md border border-line-strong bg-paper px-3 py-2 text-[13.5px] text-ink outline-none transition-colors focus:border-ink";

const newSection = (): CampaignSection => ({
  id: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  heading: "",
  body: "",
  imageUrl: "",
  imageCaption: "",
  linkLabel: "",
  linkHref: "",
});

/**
 * The reusable issue composer. Every field maps onto the campaign email
 * template, so what is typed here is exactly what subscribers receive —
 * previewable in a new tab and testable to a single address before sending.
 */
export function CampaignEditor({
  campaign,
  activeCount,
}: {
  campaign?: NewsletterCampaign;
  /** How many subscribers a real send would reach. */
  activeCount: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [id, setId] = useState(campaign?.id ?? "");
  const [subject, setSubject] = useState(campaign?.subject ?? "");
  const [preheader, setPreheader] = useState(campaign?.preheader ?? "");
  const [intro, setIntro] = useState(campaign?.intro ?? "");
  const [ctaLabel, setCtaLabel] = useState(campaign?.ctaLabel ?? "");
  const [ctaHref, setCtaHref] = useState(campaign?.ctaHref ?? "");
  const [sections, setSections] = useState<CampaignSection[]>(campaign?.sections ?? []);
  const [testEmail, setTestEmail] = useState("");
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);

  const sent = campaign?.status === "sent";

  function formData(): FormData {
    const fd = new FormData();
    if (id) fd.set("id", id);
    fd.set("subject", subject);
    fd.set("preheader", preheader ?? "");
    fd.set("intro", intro ?? "");
    fd.set("ctaLabel", ctaLabel ?? "");
    fd.set("ctaHref", ctaHref ?? "");
    fd.set("sections", JSON.stringify(sections));
    fd.set("testEmail", testEmail);
    return fd;
  }

  const run = (
    fn: (fd: FormData) => Promise<{ ok: boolean; message?: string; error?: string; id?: string }>,
    after?: (id?: string) => void,
  ) =>
    start(async () => {
      setMsg(null);
      const res = await fn(formData());
      if (!res.ok) {
        setMsg({ t: "err", m: res.error ?? "Failed" });
        return;
      }
      setMsg({ t: "ok", m: res.message ?? "Done" });
      if (res.id && res.id !== id) setId(res.id);
      after?.(res.id);
      router.refresh();
    });

  const patch = (index: number, next: Partial<CampaignSection>) =>
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...next } : s)));

  const move = (index: number, delta: number) =>
    setSections((prev) => {
      const to = index + delta;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(to, 0, item);
      return next;
    });

  return (
    <div className="space-y-6">
      <Card title="The issue">
        <div className="grid gap-4">
          <label className="block">
            <span className={labelCls}>Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="From the studio — new work in Duality"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Preview line</span>
            <input
              value={preheader ?? ""}
              onChange={(e) => setPreheader(e.target.value)}
              placeholder="Shown after the subject in the inbox list"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Opening</span>
            <textarea
              value={intro ?? ""}
              onChange={(e) => setIntro(e.target.value)}
              rows={5}
              placeholder="A paragraph or two to open the letter. Leave a blank line between paragraphs."
              className={inputCls}
            />
          </label>
        </div>
      </Card>

      <Card
        title={`Sections (${sections.length})`}
        className="[&_h2]:flex [&_h2]:items-center"
      >
        {sections.length === 0 && (
          <p className="mb-4 text-[13px] text-ink-mute">
            An issue can be just an opening. Add sections for individual works,
            exhibitions or notes.
          </p>
        )}
        <div className="space-y-4">
          {sections.map((section, i) => (
            <div key={section.id} className="rounded-lg border border-line bg-paper-dim/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Section {i + 1}
                </span>
                <div className="flex items-center gap-2 text-[12px]">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="text-ink-mute hover:text-ink disabled:opacity-30"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === sections.length - 1}
                    className="text-ink-mute hover:text-ink disabled:opacity-30"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setSections((p) => p.filter((_, j) => j !== i))}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="grid gap-3">
                <label className="block">
                  <span className={labelCls}>Heading</span>
                  <input
                    value={section.heading ?? ""}
                    onChange={(e) => patch(i, { heading: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Body</span>
                  <textarea
                    value={section.body ?? ""}
                    onChange={(e) => patch(i, { body: e.target.value })}
                    rows={4}
                    className={inputCls}
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className={labelCls}>Image URL</span>
                    <input
                      value={section.imageUrl ?? ""}
                      onChange={(e) => patch(i, { imageUrl: e.target.value })}
                      placeholder="https://…"
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className={labelCls}>Image caption</span>
                    <input
                      value={section.imageCaption ?? ""}
                      onChange={(e) => patch(i, { imageCaption: e.target.value })}
                      className={inputCls}
                    />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className={labelCls}>Link label</span>
                    <input
                      value={section.linkLabel ?? ""}
                      onChange={(e) => patch(i, { linkLabel: e.target.value })}
                      placeholder="See the work"
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className={labelCls}>Link URL</span>
                    <input
                      value={section.linkHref ?? ""}
                      onChange={(e) => patch(i, { linkHref: e.target.value })}
                      placeholder="https://consciusomnium.com/gallery"
                      className={inputCls}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSections((p) => [...p, newSection()])}
          className="mt-4 rounded-md border border-line-strong px-3.5 py-2 text-[12.5px] font-medium text-ink-soft transition-colors hover:bg-paper-dim"
        >
          + Add a section
        </button>
      </Card>

      <Card title="Closing button">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Button label</span>
            <input
              value={ctaLabel ?? ""}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="View the gallery"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Button URL</span>
            <input
              value={ctaHref ?? ""}
              onChange={(e) => setCtaHref(e.target.value)}
              placeholder="https://consciusomnium.com/gallery"
              className={inputCls}
            />
          </label>
        </div>
      </Card>

      <Card title="Preview, test, send">
        <div className="flex flex-wrap items-end gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(saveCampaign)}
            className="rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-paper transition-colors hover:bg-accent-deep disabled:opacity-50"
          >
            {pending ? "Working…" : id ? "Save draft" : "Create draft"}
          </button>

          <a
            href={id ? `/admin/newsletter/${id}/preview` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!id}
            className={`rounded-md border border-line-strong px-4 py-2 text-[12.5px] font-medium text-ink-soft transition-colors hover:bg-paper-dim ${
              id ? "" : "pointer-events-none opacity-40"
            }`}
          >
            Preview ↗
          </a>

          <label className="min-w-[220px] flex-1">
            <span className={labelCls}>Send a test to</span>
            <input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className={inputCls}
            />
          </label>
          <button
            type="button"
            disabled={pending || !testEmail}
            onClick={() => run(sendCampaignTest)}
            className="rounded-md border border-line-strong px-4 py-2 text-[12.5px] font-medium text-ink-soft transition-colors hover:bg-paper-dim disabled:opacity-50"
          >
            Send test
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <button
            type="button"
            disabled={pending || !id}
            onClick={() => {
              if (
                !confirm(
                  `Send “${subject}” to ${activeCount} active subscriber${activeCount === 1 ? "" : "s"}? This cannot be undone.`,
                )
              )
                return;
              run(sendCampaign);
            }}
            className="rounded-md bg-emerald-600 px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
          >
            {sent ? "Send again" : `Send to ${activeCount} subscriber${activeCount === 1 ? "" : "s"}`}
          </button>
          <p className="text-[11.5px] text-ink-mute">
            {id
              ? "Each subscriber receives this issue once — re-sending after a partial failure only retries the ones who missed it."
              : "Save the draft first."}
          </p>
          {id && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!confirm("Delete this issue permanently?")) return;
                const fd = new FormData();
                fd.set("id", id);
                start(async () => {
                  const res = await deleteCampaign(fd);
                  if (res.ok) router.push("/admin/newsletter");
                  else setMsg({ t: "err", m: res.error });
                });
              }}
              className="ml-auto text-[12px] text-red-600 hover:underline"
            >
              Delete issue
            </button>
          )}
        </div>

        {msg && (
          <p
            className={`mt-4 text-[12.5px] ${msg.t === "err" ? "text-red-600" : "text-emerald-600"}`}
          >
            {msg.m}
          </p>
        )}
      </Card>
    </div>
  );
}
