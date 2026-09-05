"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "success"; message: string; outcome: string };

/**
 * The studio letter sign-up. One field, one request — duplicates, invalid
 * addresses and delivery failures are all resolved server-side and reported
 * back as plain sentences.
 */
export function NewsletterForm({
  source = "footer",
  className,
  compact = false,
}: {
  /** Which placement this is — stored with the subscriber. */
  source?: string;
  className?: string;
  compact?: boolean;
}) {
  const mountedAt = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status === "submitting") return;
    const form = event.currentTarget;
    const data = new FormData(form);

    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          source,
          company: String(data.get("company") ?? ""),
          elapsedMs: Date.now() - mountedAt.current,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setState({
          status: "error",
          message: json.error ?? "Something went wrong. Please try again.",
        });
        requestAnimationFrame(() => inputRef.current?.focus());
        return;
      }
      setState({ status: "success", message: json.message, outcome: json.outcome });
      setEmail("");
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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE.outExpo }}
        className={cn("flex flex-col gap-2", className)}
        role="status"
        aria-live="polite"
      >
        <p className="u-eyebrow text-accent-deep">
          {state.outcome === "duplicate" ? "Already subscribed" : "Subscribed"}
        </p>
        <p className="max-w-xs text-[0.82rem] leading-relaxed text-ink-soft">{state.message}</p>
        <button
          type="button"
          onClick={() => setState({ status: "idle" })}
          className="w-fit text-[0.72rem] text-ink-mute underline underline-offset-4 transition-colors hover:text-ink"
        >
          Use a different address
        </button>
      </motion.div>
    );
  }

  const submitting = state.status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className={cn("flex flex-col gap-3", className)}>
      {!compact && (
        <p className="u-eyebrow mb-0.5 text-ink-faint">The studio letter</p>
      )}
      <div className="flex items-end gap-3">
        <label className="flex-1">
          <span className="sr-only">Email address</span>
          <input
            ref={inputRef}
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="your@email.com"
            aria-invalid={state.status === "error" || undefined}
            disabled={submitting}
            className={cn(
              "w-full border-0 border-b border-line-strong bg-transparent py-2 text-[0.85rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink disabled:opacity-60",
              state.status === "error" && "border-[#9a3b32]",
            )}
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="shrink-0 border-b border-ink pb-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink transition-opacity hover:opacity-60 disabled:cursor-wait disabled:opacity-50"
        >
          {submitting ? "Joining…" : "Join"}
        </button>
      </div>

      {/* Honeypot — visually hidden, off the a11y tree */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <AnimatePresence initial={false}>
        {state.status === "error" && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[0.72rem] text-[#9a3b32]"
            role="alert"
          >
            {state.message}
          </motion.p>
        )}
      </AnimatePresence>

      {!compact && (
        <p className="text-[0.68rem] leading-relaxed text-ink-mute">
          Occasional notes on new work and exhibitions. Unsubscribe any time — see the{" "}
          <Link href="/privacy" className="u-link">
            Privacy Policy
          </Link>
          .
        </p>
      )}
    </form>
  );
}
