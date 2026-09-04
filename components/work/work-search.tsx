"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Search across the catalogue. The query lives in the URL (`?q=`) so a result
 * set is shareable, bookmarkable and server-rendered — no client-side index to
 * ship, and it composes with the discipline filter.
 */
export function WorkSearch({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const urlQuery = params.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  // Skip the debounce push on mount and on back/forward.
  const lastPushed = useRef(urlQuery);

  useEffect(() => {
    setValue(urlQuery);
    lastPushed.current = urlQuery;
  }, [urlQuery]);

  useEffect(() => {
    if (value === lastPushed.current) return;
    const t = window.setTimeout(() => {
      lastPushed.current = value;
      const next = new URLSearchParams(params.toString());
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      router.replace(`/work${next.toString() ? `?${next}` : ""}`, { scroll: false });
    }, 280);
    return () => window.clearTimeout(t);
  }, [value, params, router]);

  const hasQuery = urlQuery.length > 0;

  return (
    <search className="w-full max-w-sm">
      <div className="relative flex items-center border-b border-line-strong transition-colors focus-within:border-ink">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-ink-mute"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <label htmlFor="work-search" className="sr-only">
          Search the work
        </label>
        <input
          ref={inputRef}
          id="work-search"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && value) {
              e.preventDefault();
              setValue("");
            }
          }}
          placeholder="Search titles, media, years…"
          autoComplete="off"
          className="min-h-[44px] w-full border-0 bg-transparent px-3 py-2 text-[0.85rem] text-ink outline-none placeholder:text-ink-mute [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="flex h-11 w-9 shrink-0 items-center justify-center text-ink-mute transition-colors hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <p className="mt-2 min-h-[1.1rem] text-[0.72rem] text-ink-mute" role="status" aria-live="polite">
        {hasQuery
          ? `${resultCount} ${resultCount === 1 ? "work" : "works"} matching “${urlQuery}”`
          : ""}
      </p>
    </search>
  );
}
