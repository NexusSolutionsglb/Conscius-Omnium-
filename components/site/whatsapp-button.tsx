"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/utils";
import { useCursor } from "./cursor";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.13c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.4c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.23 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.16 0-.43.06-.65.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.25 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

/** Floating "chat on WhatsApp" — appears after the hero. Share link only. */
export function WhatsAppFloat({ href }: { href: string }) {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const { setCursor, reset } = useCursor();

  useMotionValueEvent(scrollY, "change", (v) => setVisible(v > 520));
  useEffect(() => () => reset(), [reset]);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="u-no-print fixed bottom-5 right-5 z-[110] flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper shadow-[0_6px_20px_-6px_rgba(0,0,0,0.30)] md:bottom-7 md:right-7"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onPointerEnter={() => setCursor("hidden")}
      onPointerLeave={reset}
    >
      <WhatsAppGlyph className="h-[22px] w-[22px]" />
    </motion.a>
  );
}

/** Inline WhatsApp CTA — contact page, work detail. */
export function WhatsAppLink({
  href,
  label = "Chat on WhatsApp",
  className,
  variant = "ghost",
}: {
  href: string;
  label?: string;
  className?: string;
  variant?: "ghost" | "solid";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "u-btn",
        variant === "ghost" && "u-btn--ghost",
        className,
      )}
    >
      <WhatsAppGlyph className="h-4 w-4" />
      {label}
    </a>
  );
}
