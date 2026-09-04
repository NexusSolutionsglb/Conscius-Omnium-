"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/client";

/**
 * Two-part transition system:
 *  · a one-time brand loader on first visit (session-gated)
 *  · a quiet content rise on every route change (via the keyed wrapper)
 * No full-screen wipe between pages — it delays navigation and reads as
 * a gimmick at this level of restraint.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [intro, setIntro] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    try {
      if (!sessionStorage.getItem("co-intro-seen")) {
        setIntro(true);
        sessionStorage.setItem("co-intro-seen", "1");
        const t = setTimeout(() => setIntro(false), 1700);
        return () => clearTimeout(t);
      }
    } catch {
      /* private mode — skip */
    }
  }, []);

  return (
    <>
      <AnimatePresence>{intro && <BrandLoader />}</AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function BrandLoader() {
  return (
    <motion.div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-obsidian text-paper"
      initial={{ opacity: 1 }}
      exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.7, ease: EASE.inOutQuint } }}
    >
      <motion.span
        className="font-display text-base uppercase tracking-[0.34em]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE.outExpo }}
      >
        Conscius Omnium™
      </motion.span>
      <motion.span
        className="mt-4 h-px w-14 origin-left bg-paper/30"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: EASE.inOutQuint }}
      />
      <motion.span
        className="mt-3 text-[0.55rem] uppercase tracking-[0.34em] text-paper/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Shivjeet Potdar
      </motion.span>
    </motion.div>
  );
}
