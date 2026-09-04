"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Profile, SiteSettings } from "@/lib/types";
import { EASE } from "@/lib/motion";
import { lockScroll } from "@/lib/client";
import { FOOTER_LEGAL_LINKS } from "@/lib/content/defaults/footer";
import { getLenis } from "./smooth-scroll";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function MobileMenu({
  open,
  onClose,
  settings,
  profile,
}: {
  open: boolean;
  onClose: () => void;
  settings: SiteSettings;
  profile?: Profile;
}) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement as HTMLElement | null;
    lockScroll(true);
    getLenis()?.stop();
    // Move focus into the dialog so a keyboard visitor isn't left behind it.
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      // Wrap focus at both ends so Tab can never escape the open menu.
      if (e.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      getLenis()?.start();
      returnFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          id="site-menu"
          className="u-invert u-no-print fixed inset-0 z-[200] flex flex-col bg-obsidian text-paper"
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.6, ease: EASE.inOutQuint }}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className="u-container flex h-16 shrink-0 items-center justify-between">
            <span className="font-display text-[0.95rem] uppercase tracking-[0.2em]">
              {settings.brand}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="-mr-2 flex h-11 w-11 items-center justify-center"
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <nav
            className="u-container flex flex-1 flex-col justify-center overflow-y-auto"
            aria-label="Primary"
          >
            {settings.nav.map((item, i) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14 + i * 0.06, duration: 0.6, ease: EASE.outExpo }}
                  className="border-b border-white/10"
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className="flex items-baseline gap-3 py-[max(0.9rem,2.2vh)] font-display text-[clamp(1.9rem,9vw,2.6rem)] font-light leading-tight"
                  >
                    <span
                      aria-hidden
                      className={
                        active
                          ? "block h-1 w-1 shrink-0 translate-y-[-0.4em] rounded-full bg-paper"
                          : "block h-1 w-1 shrink-0"
                      }
                    />
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="u-container shrink-0 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-6"
          >
            {profile && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex min-h-[44px] items-center text-[0.85rem] text-paper/70 transition-colors hover:text-paper"
              >
                {profile.email}
              </a>
            )}
            <p className="u-eyebrow mt-1 text-paper/50">{settings.brandLine}</p>
            <p className="mt-1 text-xs text-paper/40">{settings.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 text-[0.72rem] text-paper/40">
              {FOOTER_LEGAL_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="inline-flex min-h-[44px] items-center transition-colors hover:text-paper"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
