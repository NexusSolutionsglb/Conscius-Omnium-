"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Inquiry } from "@/lib/types";
import { INQUIRY_TYPE_LABELS } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { whatsappInquiryMessage, whatsappLink } from "@/lib/whatsapp";
import { addInquiryNote, deleteInquiry, updateInquiryStatus } from "@/lib/admin/actions";
import { Card } from "./ui";

const STATUSES = ["new", "read", "in-progress", "responded", "closed", "archived"];

export function InquiryDetail({ inquiry }: { inquiry: Inquiry }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();

  const waHref = whatsappLink(
    whatsappInquiryMessage({
      ref: inquiry.ref,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      typeLabel: INQUIRY_TYPE_LABELS[inquiry.type],
      message: inquiry.message,
      workTitle: inquiry.workTitle,
    }),
    inquiry.phone ?? undefined,
  );

  const rows: [string, string | null | undefined][] = [
    ["Reference", inquiry.ref],
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone],
    ["Country", inquiry.country],
    ["Type", INQUIRY_TYPE_LABELS[inquiry.type]],
    ["Budget", inquiry.budget],
    ["Prefers", inquiry.preferredContact],
    ["Received", formatDate(inquiry.createdAt, { dateStyle: "medium", timeStyle: "short" })],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
      <div className="space-y-6">
        <Card title={inquiry.workTitle ? `Enquiry — ${inquiry.workTitle}` : "General enquiry"}>
          <dl className="divide-y divide-neutral-100">
            {rows
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-3 py-1.5 text-[13px]">
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-neutral-400">{k}</dt>
                  <dd className="text-neutral-800">{v}</dd>
                </div>
              ))}
          </dl>
          {inquiry.workSlug && (
            <a
              href={`/work/${inquiry.workSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[12px] text-neutral-500 hover:underline"
            >
              View the work ↗
            </a>
          )}
        </Card>

        <Card title="Message">
          <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-neutral-800">
            {inquiry.message}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: your enquiry (${inquiry.ref})`)}`}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-neutral-700"
            >
              Reply by email
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-[12px] font-medium hover:bg-neutral-50"
            >
              Open in WhatsApp
            </a>
          </div>
        </Card>

        <Card title="Internal notes">
          {inquiry.notes.length > 0 && (
            <ul className="mb-3 space-y-2">
              {inquiry.notes.map((n) => (
                <li key={n.id} className="rounded-md bg-neutral-50 px-3 py-2 text-[12.5px] text-neutral-700">
                  <p className="whitespace-pre-wrap">{n.body}</p>
                  <p className="mt-1 text-[10px] text-neutral-400">{formatDate(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Add a private note…"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-[13px]"
          />
          <button
            type="button"
            disabled={pending || !note.trim()}
            onClick={() =>
              start(async () => {
                await addInquiryNote(inquiry.id, note);
                setNote("");
                router.refresh();
              })
            }
            className="mt-2 rounded-md border border-neutral-300 px-3 py-1.5 text-[12px] font-medium hover:bg-neutral-50 disabled:opacity-50"
          >
            Add note
          </button>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <Card title="Status">
          <div className="flex flex-col gap-1">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await updateInquiryStatus(inquiry.id, s);
                    router.refresh();
                  })
                }
                className={`rounded-md px-2.5 py-1.5 text-left text-[12.5px] capitalize transition-colors ${
                  inquiry.status === s
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {s.replace("-", " ")}
              </button>
            ))}
          </div>
        </Card>

        <button
          type="button"
          onClick={() => {
            if (confirm("Delete this enquiry permanently?"))
              start(async () => {
                await deleteInquiry(inquiry.id);
                router.push("/admin/inquiries");
              });
          }}
          className="text-[12px] text-red-600 hover:underline"
        >
          Delete enquiry
        </button>
      </aside>
    </div>
  );
}
