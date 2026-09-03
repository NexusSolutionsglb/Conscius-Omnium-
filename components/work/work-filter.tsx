"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { DISCIPLINE_LABELS, type Discipline } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Editorial filter — a line of words, not a toolbar. Reflected in the
 * URL (`?discipline=`) so it's shareable and SSR-friendly.
 */
export function WorkFilter({
  disciplines,
  total,
  counts,
}: {
  disciplines: Discipline[];
  total: number;
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("discipline");
  const [pending, startTransition] = useTransition();

  const select = (value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("discipline", value);
    else next.delete("discipline");
    startTransition(() => {
      router.replace(`/work${next.toString() ? `?${next}` : ""}`, { scroll: false });
    });
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-6 gap-y-3 transition-opacity",
        pending && "opacity-50",
      )}
    >
      <button
        type="button"
        onClick={() => select(null)}
        aria-pressed={!active}
        className={cn(
          "u-link text-[0.72rem] font-medium uppercase tracking-[0.14em]",
          !active ? "text-ink" : "text-ink-faint hover:text-ink",
        )}
      >
        All
        <sup className="ml-1 text-[0.6rem]">{total}</sup>
      </button>
      {disciplines.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => select(d)}
          aria-pressed={active === d}
          className={cn(
            "u-link text-[0.72rem] font-medium uppercase tracking-[0.14em]",
            active === d ? "text-ink" : "text-ink-faint hover:text-ink",
          )}
        >
          {DISCIPLINE_LABELS[d]}
          <sup className="ml-1 text-[0.6rem]">{counts[d]}</sup>
        </button>
      ))}
    </div>
  );
}
