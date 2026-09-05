"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { NewsletterSubscriber } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  addSubscriber,
  deleteSubscriber,
  setSubscriberStatus,
} from "@/lib/admin/newsletter-actions";

export function SubscriberRow({ subscriber }: { subscriber: NewsletterSubscriber }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const active = subscriber.status === "subscribed";

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setError(null);
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Failed");
      else router.refresh();
    });

  return (
    <tr className="border-b border-line last:border-0 align-middle">
      <td className="px-5 py-3">
        <a href={`mailto:${subscriber.email}`} className="text-ink hover:underline">
          {subscriber.email}
        </a>
        {error && <p className="mt-0.5 text-[11px] text-red-600">{error}</p>}
      </td>
      <td className="px-3 py-3 text-ink-soft">{subscriber.name || "—"}</td>
      <td className="px-3 py-3 text-[12px] text-ink-mute">{subscriber.source || "—"}</td>
      <td className="px-3 py-3 text-[12px] text-ink-mute">
        {formatDate(subscriber.createdAt)}
      </td>
      <td className="px-3 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
            active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {active ? "Subscribed" : "Unsubscribed"}
        </span>
      </td>
      <td className="px-5 py-3 text-right">
        <div className="inline-flex items-center gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              const fd = new FormData();
              fd.set("id", subscriber.id);
              fd.set("status", active ? "unsubscribed" : "subscribed");
              run(() => setSubscriberStatus(fd));
            }}
            className="text-[12px] text-ink-mute hover:text-ink disabled:opacity-50"
          >
            {active ? "Unsubscribe" : "Resubscribe"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm(`Delete ${subscriber.email} from the list permanently?`)) return;
              const fd = new FormData();
              fd.set("id", subscriber.id);
              run(() => deleteSubscriber(fd));
            }}
            className="text-[12px] text-red-600 hover:underline disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export function SubscriberAdd() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        start(async () => {
          setMsg(null);
          const res = await addSubscriber(fd);
          if (res.ok) {
            setMsg({ t: "ok", m: res.message ?? "Added" });
            form.reset();
            router.refresh();
          } else {
            setMsg({ t: "err", m: res.error });
          }
        });
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <label className="min-w-[220px] flex-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-mute">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          placeholder="name@example.com"
          className="mt-1 w-full rounded-md border border-line-strong bg-paper px-3 py-2 text-[13.5px] text-ink outline-none transition-colors focus:border-ink"
        />
      </label>
      <label className="min-w-[180px] flex-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-mute">
          Name (optional)
        </span>
        <input
          name="name"
          className="mt-1 w-full rounded-md border border-line-strong bg-paper px-3 py-2 text-[13.5px] text-ink outline-none transition-colors focus:border-ink"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-paper transition-colors hover:bg-accent-deep disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add"}
      </button>
      {msg && (
        <span
          className={`text-[12px] ${msg.t === "err" ? "text-red-600" : "text-emerald-600"}`}
        >
          {msg.m}
        </span>
      )}
    </form>
  );
}
