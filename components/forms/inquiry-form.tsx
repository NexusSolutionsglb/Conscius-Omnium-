"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { INQUIRY_TYPE_LABELS, type InquiryType, type Work } from "@/lib/types";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Field, Select, Textarea } from "./fields";

type InquiryFormProps = {
  work?: Pick<Work, "slug" | "title" | "year" | "medium"> | null;
  /** Restrict / reorder the type options. */
  types?: InquiryType[];
  defaultType?: InquiryType;
  compact?: boolean;
  onSuccess?: () => void;
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success"; ref: string; whatsappUrl: string; emailed: boolean };

const ALL_TYPES = Object.keys(INQUIRY_TYPE_LABELS) as InquiryType[];

export function InquiryForm({
  work = null,
  types,
  defaultType,
  compact = false,
  onSuccess,
}: InquiryFormProps) {
  const mountedAt = useRef<number>(Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  const typeOptions = useMemo(() => {
    const base = types?.length ? types : ALL_TYPES;
    return base.map((t) => ({ value: t, label: INQUIRY_TYPE_LABELS[t] }));
  }, [types]);

  const initialType: InquiryType =
    defaultType ?? (work ? "purchase" : "general");

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      country: String(data.get("country") ?? ""),
      type: String(data.get("type") ?? initialType),
      message: String(data.get("message") ?? ""),
      budget: String(data.get("budget") ?? ""),
      preferredContact: String(data.get("preferredContact") ?? "") || undefined,
      workSlug: work?.slug ?? "",
      workTitle: work?.title ?? "",
      company: String(data.get("company") ?? ""), // honeypot
      elapsedMs: Date.now() - mountedAt.current,
    };

    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setState({
          status: "error",
          message: json.error ?? "Something went wrong. Please try again.",
          fieldErrors: json.fieldErrors,
        });
        // Put the caret back where the problem is, rather than leaving the
        // visitor to hunt for the highlighted field.
        const firstInvalid = Object.keys(json.fieldErrors ?? {})[0];
        requestAnimationFrame(() => {
          const el = firstInvalid
            ? formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
            : null;
          (el ?? formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']"))?.focus();
        });
        return;
      }
      setState({
        status: "success",
        ref: json.ref,
        whatsappUrl: json.whatsappUrl,
        emailed: json.emailed,
      });
      form.reset();
      onSuccess?.();
    } catch {
      setState({
        status: "error",
        message: "Network error. Please check your connection and try again.",
      });
    }
  }

  if (state.status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE.outExpo }}
        className="py-2"
        role="status"
        aria-live="polite"
      >
        <p className="u-eyebrow text-accent-deep">Enquiry received</p>
        <h3 className="mt-3 font-display text-[1.7rem] font-normal leading-tight text-ink">
          Thank you. It&rsquo;s with the studio.
        </h3>
        <p className="mt-3 max-w-md text-[0.86rem] leading-relaxed text-ink-soft">
          {work
            ? `Your enquiry about “${work.title}” has been logged`
            : "Your enquiry has been logged"}{" "}
          under reference{" "}
          <span className="font-medium text-ink">{state.ref}</span>. Shivjeet
          reads every enquiry personally and will reply directly
          {state.emailed ? " — a confirmation is on its way to your inbox." : "."}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href={state.whatsappUrl} target="_blank" rel="noopener noreferrer" className="u-btn">
            Continue on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setState({ status: "idle" })}
            className="u-btn u-btn--ghost"
          >
            Send another
          </button>
        </div>
      </motion.div>
    );
  }

  const fieldError = (name: string) =>
    state.status === "error" ? state.fieldErrors?.[name]?.[0] : undefined;

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
      {work && (
        <div className="border border-line-strong/60 bg-paper-dim/60 p-4">
          <p className="u-eyebrow">Enquiring about</p>
          <p className="mt-1.5 font-display text-lg text-ink">{work.title}</p>
          <p className="mt-0.5 text-[0.78rem] text-ink-mute">
            {[work.year, work.medium].filter(Boolean).join(" · ") || "Selected work"}
          </p>
        </div>
      )}

      <div className={cn("grid gap-x-8 gap-y-7", !compact && "sm:grid-cols-2")}>
        <Field
          label="Full name"
          name="name"
          autoComplete="name"
          required
          error={fieldError("name")}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          error={fieldError("email")}
        />
        <Field
          label="Phone / WhatsApp"
          name="phone"
          type="tel"
          autoComplete="tel"
          optional
          error={fieldError("phone")}
        />
        <Field label="Country" name="country" autoComplete="country-name" optional />
      </div>

      <div className={cn("grid gap-x-8 gap-y-7", !compact && "sm:grid-cols-2")}>
        <Select
          label="Type of enquiry"
          name="type"
          defaultValue={initialType}
          options={typeOptions}
        />
        <Select
          label="Preferred contact"
          name="preferredContact"
          defaultValue=""
          options={[
            { value: "", label: "No preference" },
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone" },
            { value: "whatsapp", label: "WhatsApp" },
          ]}
          optional
        />
      </div>

      {(!work || initialType === "purchase" || initialType === "commission") && (
        <Field label="Budget" name="budget" optional placeholder="Optional — a range is fine" />
      )}

      <Textarea
        label="Message"
        name="message"
        rows={compact ? 4 : 5}
        required
        error={fieldError("message")}
        placeholder={
          work
            ? "I would like to know more about this work — availability, dimensions and price."
            : "Tell the studio a little about what you have in mind."
        }
      />

      {/* Honeypot — visually hidden, off the a11y tree */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <AnimatePresence>
        {state.status === "error" && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-l-2 border-[#9a3b32] pl-3 text-[0.8rem] text-[#9a3b32]"
            role="alert"
            aria-live="assertive"
          >
            {state.message}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={state.status === "submitting"}
          aria-busy={state.status === "submitting"}
          className="u-btn disabled:cursor-wait disabled:opacity-60"
        >
          {state.status === "submitting" ? "Sending…" : "Send enquiry"}
        </button>
        <p className="text-[0.7rem] leading-relaxed text-ink-mute">
          No mailing list. Your details are used only to reply — see the{" "}
          <Link href="/privacy" className="u-link">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
