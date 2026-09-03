"use client";

import Link from "next/link";
import type { Work } from "@/lib/types";
import { DISCIPLINE_LABELS } from "@/lib/types";
import { useCursor } from "@/components/site/cursor";

export function WorkNavigation({
  prev,
  next,
}: {
  prev: Work | null;
  next: Work | null;
}) {
  const { setCursor, reset } = useCursor();
  if (!prev && !next) return null;

  return (
    <nav
      className="grid gap-px border-y border-line bg-line sm:grid-cols-2"
      aria-label="More work"
    >
      {[
        { work: prev, dir: "prev" as const, label: "Previous" },
        { work: next, dir: "next" as const, label: "Next" },
      ].map(({ work, dir, label }) =>
        work ? (
          <Link
            key={dir}
            href={`/work/${work.slug}`}
            onPointerEnter={() => setCursor(dir)}
            onPointerLeave={reset}
            className={`group flex flex-col gap-1 bg-paper px-1 py-8 transition-colors hover:bg-paper-dim sm:px-6 ${
              dir === "next" ? "sm:items-end sm:text-right" : ""
            }`}
          >
            <span className="u-eyebrow flex items-center gap-2">
              {dir === "prev" && <Arrow dir="left" />}
              {label}
              {dir === "next" && <Arrow dir="right" />}
            </span>
            <span className="font-display text-[1.4rem] font-normal text-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
              {work.title}
            </span>
            <span className="text-[0.75rem] text-ink-mute">
              {DISCIPLINE_LABELS[work.discipline]}
            </span>
          </Link>
        ) : (
          <span key={dir} className="bg-paper" />
        ),
      )}
    </nav>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="10" viewBox="0 0 24 12" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M6 1L1 6l5 5M1 6h22" : "M18 1l5 5-5 5M23 6H1"}
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
