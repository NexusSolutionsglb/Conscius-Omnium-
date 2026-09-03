"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { InquiryType, Work } from "@/lib/types";
import { EASE } from "@/lib/motion";
import { lockScroll } from "@/lib/client";
import { getLenis } from "@/components/site/smooth-scroll";
import { InquiryForm } from "@/components/forms/inquiry-form";

export function InquiryDialog({
  work,
  triggerLabel = "Enquire about this work",
  triggerClassName = "u-btn",
  types,
  defaultType,
}: {
  work?: Pick<Work, "slug" | "title" | "year" | "medium"> | null;
  triggerLabel?: string;
  triggerClassName?: string;
  types?: InquiryType[];
  defaultType?: InquiryType;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement;
    lockScroll(true);
    getLenis()?.stop();
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
      getLenis()?.start();
      restoreFocus.current?.focus?.();
    };
  }, [open, close]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[250] flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              aria-label="Close enquiry"
              onClick={close}
              className="absolute inset-0 bg-obsidian/45 backdrop-blur-[2px]"
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={work ? `Enquire about ${work.title}` : "Enquire"}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.55, ease: EASE.inOutQuint }}
              className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-paper"
              data-lenis-prevent
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-5 md:px-10">
                <p className="u-eyebrow">Enquiry</p>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  className="flex h-9 w-9 items-center justify-center text-ink-mute transition-colors hover:text-ink"
                  aria-label="Close"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-8 md:px-10 md:py-10">
                <h2 className="font-display text-[1.9rem] font-normal leading-tight text-ink">
                  {work ? "Enquire about this work" : "Start an enquiry"}
                </h2>
                <p className="mt-2 text-[0.85rem] text-ink-mute">
                  Read personally by the studio. Usually a reply within a few days.
                </p>
                <div className="mt-8">
                  <InquiryForm
                    work={work}
                    types={types}
                    defaultType={defaultType}
                    compact
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
