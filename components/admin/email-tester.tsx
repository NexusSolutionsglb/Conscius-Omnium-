"use client";

import { useState, useTransition } from "react";
import { INQUIRY_TYPE_LABELS, type InquiryType } from "@/lib/types";
import { sendRoutingTest } from "@/lib/admin/newsletter-actions";

const KINDS = [
  { value: "notification", label: "Internal enquiry notification" },
  { value: "confirmation", label: "Visitor confirmation" },
  { value: "welcome", label: "Newsletter welcome" },
] as const;

const inputCls =
  "mt-1 w-full rounded-md border border-line-strong bg-paper px-3 py-2 text-[13.5px] text-ink outline-none transition-colors focus:border-ink";
const labelCls = "text-[11px] font-medium uppercase tracking-[0.12em] text-ink-mute";

/**
 * Proves a route end to end: builds a realistic enquiry, runs it through the
 * real template, and delivers it to whatever address is typed here.
 */
export function EmailTester() {
  const [pending, start] = useTransition();
  const [email, setEmail] = useState("");
  const [kind, setKind] = useState<string>("notification");
  const [type, setType] = useState<InquiryType>("general");
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.set("testEmail", email);
        fd.set("kind", kind);
        fd.set("type", type);
        start(async () => {
          setMsg(null);
          const res = await sendRoutingTest(fd);
          setMsg(res.ok ? { t: "ok", m: res.message ?? "Sent" } : { t: "err", m: res.error });
        });
      }}
      className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
    >
      <label className="block sm:col-span-1">
        <span className={labelCls}>Send to</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder="you@example.com"
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className={labelCls}>Which email</span>
        <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputCls}>
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </label>

      {kind !== "welcome" && (
        <label className="block sm:col-span-2">
          <span className={labelCls}>As enquiry type (decides the route)</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as InquiryType)}
            className={inputCls}
          >
            {(Object.keys(INQUIRY_TYPE_LABELS) as InquiryType[]).map((t) => (
              <option key={t} value={t}>
                {INQUIRY_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
      )}

      <button
        type="submit"
        disabled={pending || !email}
        className="h-[38px] rounded-md bg-ink px-4 text-[12.5px] font-medium text-paper transition-colors hover:bg-accent-deep disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send test"}
      </button>

      {msg && (
        <p
          className={`sm:col-span-3 text-[12.5px] ${msg.t === "err" ? "text-red-600" : "text-emerald-600"}`}
        >
          {msg.m}
        </p>
      )}
    </form>
  );
}
