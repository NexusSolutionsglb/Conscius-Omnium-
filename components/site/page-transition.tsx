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
        const t = setTimeout(() => setIntro(false), 2300);
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

/**
 * The opening mark — the nilgai, filling with white from the ground up
 * like a vessel taking on water, then the wordmark beneath it.
 *
 * The fill is a plain white block rising inside a mask cut from
 * `nilgai-white.png`'s own alpha, so the colour only ever appears inside
 * the animal's silhouette. The empty body sits behind it at low opacity
 * so the whole figure is legible from the first frame.
 */
function BrandLoader() {
  const mask = {
    WebkitMaskImage: "url(/logo/nilgai-white.png)",
    maskImage: "url(/logo/nilgai-white.png)",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  } as const;

  return (
    <motion.div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center gap-8 bg-obsidian text-paper"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.75, ease: EASE.inOutQuint },
      }}
    >
      <motion.div
        className="relative aspect-[1600/2263] w-[clamp(6.5rem,16vh,11rem)]"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE.outExpo }}
      >
        {/* The empty body */}
        <span
          aria-hidden
          className="absolute inset-0 bg-paper/15"
          style={mask}
        />

        {/* The water */}
        <span aria-hidden className="absolute inset-0 overflow-hidden" style={mask}>
          <motion.span
            className="absolute inset-x-0 bottom-0 block bg-paper"
            initial={{ height: "0%" }}
            animate={{ height: "100%" }}
            transition={{ duration: 1.5, delay: 0.15, ease: [0.65, 0, 0.35, 1] }}
          >
            {/* The meniscus — a soft crest that keeps the rising edge from
                reading as a hard wipe. */}
            <motion.span
              className="absolute inset-x-[-25%] top-0 h-[0.9em] -translate-y-1/2 rounded-[50%] bg-paper"
              animate={{ x: ["-6%", "6%", "-6%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.span>
        </span>
      </motion.div>

      <motion.span
        className="font-display text-[0.8rem] uppercase tracking-[0.34em]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: EASE.outExpo }}
      >
        Conscius Omnium&trade;
      </motion.span>
      <motion.span
        className="-mt-5 text-[0.55rem] uppercase tracking-[0.34em] text-paper/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Shivjeet Potdar
      </motion.span>
    </motion.div>
  );
}
