"use client";

import { useEffect, useRef, useState } from "react";

type ShareBarProps = {
  /** Absolute URL of the page being shared. */
  url: string;
  title: string;
  /** Short line used as the body of an email / WhatsApp share. */
  summary?: string;
};

function Glyph({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  link: "M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.4 4.5M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.4-1.4",
  check: "M4 12.5 9 17.5 20 6.5",
  share: "M12 16V4m0 0L8 8m4-4 4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3",
  mail: "M3 6h18v12H3zM3 6l9 7 9-7",
};

/**
 * Quiet share row for a single work. Copy-link first (the thing people
 * actually use), the OS share sheet where the browser offers one, and a
 * plain mailto as the always-available fallback.
 */
export function ShareBar({ url, title, summary }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // `navigator.share` only exists on some clients — probe after mount so the
  // server and client render the same markup.
  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    return () => window.clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard blocked (insecure context, denied permission) — fall back to
      // a selection the visitor can copy by hand.
      window.prompt("Copy this link", url);
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  }

  async function share() {
    try {
      await navigator.share({ title, text: summary, url });
    } catch {
      /* dismissed — nothing to do */
    }
  }

  const mailto = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
    `${summary ? `${summary}\n\n` : ""}${url}`,
  )}`;

  const btn =
    "u-tap inline-flex items-center gap-2 border border-line-strong px-3.5 py-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-ink-mute transition-colors hover:border-ink hover:text-ink";

  return (
    <div className="u-no-print flex flex-wrap items-center gap-2.5">
      <button type="button" onClick={copy} className={btn} aria-live="polite">
        <Glyph d={copied ? ICONS.check : ICONS.link} />
        {copied ? "Link copied" : "Copy link"}
      </button>

      {canShare && (
        <button type="button" onClick={share} className={btn}>
          <Glyph d={ICONS.share} />
          Share
        </button>
      )}

      <a href={mailto} className={btn}>
        <Glyph d={ICONS.mail} />
        Email
      </a>
    </div>
  );
}
