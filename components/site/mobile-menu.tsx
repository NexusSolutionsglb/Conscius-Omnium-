"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { SiteSettings } from "@/lib/types";
import { EASE } from "@/lib/motion";
import { lockScroll } from "@/lib/client";
import { getLenis } from "./smooth-scroll";

export function MobileMenu({
  open,
  onClose,
  settings,
}: {
  open: boolean;
  onClose: () => void;
  settings: SiteSettings;
}) {
  useEffect(() => {
    lockScroll(open);
    getLenis()?.[open ? "stop" : "start"]();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
      getLenis()?.start();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="u-invert u-no-print fixed inset-0 z-[200] flex flex-col bg-obsidian text-paper"
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.6, ease: EASE.inOutQuint }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="u-container flex h-16 items-center justify-between">
            <span className="font-display text-[0.95rem] uppercase tracking-[0.2em]">
              {settings.brand}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 flex h-10 w-10 items-center justify-center"
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
            className="u-container flex flex-1 flex-col justify-center gap-1"
            aria-label="Primary"
          >
            {settings.nav.map((item, i) => (
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
                  className="block py-4 font-display text-[2.4rem] font-light leading-tight"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="u-container pb-10 pt-6"
          >
            <p className="u-eyebrow text-paper/50">{settings.brandLine}</p>
            <p className="mt-1 text-xs text-paper/40">{settings.tagline}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
