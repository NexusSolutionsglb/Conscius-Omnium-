"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { Exhibition } from "@/lib/types";
import { EASE } from "@/lib/motion";

const TYPE_LABEL: Record<Exhibition["type"], string> = {
  solo: "Solo",
  group: "Group",
  exhibition: "Exhibition",
  screening: "Screening",
  installation: "Installation",
  residency: "Residency",
  commission: "Commission",
  publication: "Publication",
};

export function ExhibitionList({
  groups,
}: {
  groups: { year: string; items: Exhibition[] }[];
}) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {groups.map(({ year, items }) => (
        <div key={year} className="grid gap-2 py-6 md:grid-cols-[6rem_1fr] md:gap-8">
          <p className="font-display text-[1.6rem] font-light leading-none text-ink-faint">
            {year}
          </p>
          <ul className="divide-y divide-line/70">
            {items.map((item) => (
              <ExhibitionRow key={item.id} item={item} typeLabel={TYPE_LABEL[item.type]} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ExhibitionRow({ item, typeLabel }: { item: Exhibition; typeLabel: string }) {
  const [open, setOpen] = useState(false);
  const expandable = Boolean(item.description || item.relatedSlugs?.length || item.url);

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <button
        type="button"
        onClick={() => expandable && setOpen((o) => !o)}
        aria-expanded={expandable ? open : undefined}
        className={`flex w-full items-baseline justify-between gap-4 text-left ${
          expandable ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <span>
          <span className="font-display text-[1.25rem] font-normal text-ink">
            {item.title}
          </span>
          <span className="mt-0.5 block text-[0.82rem] text-ink-mute">
            {[item.venue, item.city, item.country].filter(Boolean).join(", ")}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="u-eyebrow hidden text-ink-faint sm:inline">{typeLabel}</span>
          {expandable && (
            <motion.span
              animate={{ rotate: open ? 45 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-ink-mute"
              aria-hidden
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </motion.span>
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && expandable && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE.inOutQuint }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              {item.dateLabel && (
                <p className="u-eyebrow text-ink-faint">{item.dateLabel}</p>
              )}
              {item.description && (
                <p className="mt-2 max-w-xl text-[0.86rem] leading-relaxed text-ink-soft">
                  {item.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                {item.relatedSlugs?.map((slug) => (
                  <Link
                    key={slug}
                    href={`/work/${slug}`}
                    className="u-link text-[0.7rem] font-medium uppercase tracking-[0.14em]"
                  >
                    View related work
                  </Link>
                ))}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="u-link text-[0.7rem] font-medium uppercase tracking-[0.14em]"
                  >
                    External link
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
