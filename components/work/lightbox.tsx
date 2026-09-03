"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import type { WorkImage } from "@/lib/types";
import { EASE } from "@/lib/motion";
import { lockScroll } from "@/lib/client";
import { getLenis } from "@/components/site/smooth-scroll";
import { blurFor } from "@/lib/content/blur";

interface LightboxApi {
  open: (images: WorkImage[], index: number) => void;
}
const LightboxContext = createContext<LightboxApi>({ open: () => {} });
export const useLightbox = () => useContext(LightboxContext);

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [images, setImages] = useState<WorkImage[]>([]);
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const open = useCallback((imgs: WorkImage[], i: number) => {
    setImages(imgs);
    setIndex(i);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setZoomed(false);
  }, []);

  const go = useCallback(
    (dir: number) => {
      setZoomed(false);
      setIndex((cur) => (cur + dir + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (!isOpen) return;
    lockScroll(true);
    getLenis()?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
      getLenis()?.start();
    };
  }, [isOpen, close, go]);

  const api = useMemo(() => ({ open }), [open]);
  const current = images[index];

  return (
    <LightboxContext.Provider value={api}>
      {children}
      <AnimatePresence>
        {isOpen && current && (
          <motion.div
            className="fixed inset-0 z-[400] flex flex-col bg-[#100d0b]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
          >
            {/* top bar */}
            <div className="flex items-center justify-between px-5 py-4 text-paper/70 md:px-8">
              <span className="text-[0.7rem] uppercase tracking-[0.22em]">
                {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={close}
                className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] transition-colors hover:text-paper"
                aria-label="Close viewer"
              >
                Close
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* stage */}
            <div
              className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4 md:px-16"
              onClick={close}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  className="relative flex max-h-full max-w-full items-center justify-center"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: EASE.outExpo }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomed((z) => !z);
                  }}
                  drag={images.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) go(1);
                    else if (info.offset.x > 80) go(-1);
                  }}
                  style={{ cursor: zoomed ? "zoom-out" : "zoom-in" }}
                >
                  <Image
                    src={current.url}
                    alt={current.alt}
                    width={current.width ?? 2200}
                    height={current.height ?? 1500}
                    placeholder={blurFor(current.url) ? "blur" : "empty"}
                    blurDataURL={blurFor(current.url)}
                    sizes="100vw"
                    className={`max-h-[78vh] w-auto select-none object-contain transition-transform duration-500 ${
                      zoomed ? "scale-[1.6] md:scale-[1.9]" : "scale-100"
                    }`}
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <ArrowButton dir="left" onClick={(e) => { e.stopPropagation(); go(-1); }} />
                  <ArrowButton dir="right" onClick={(e) => { e.stopPropagation(); go(1); }} />
                </>
              )}
            </div>

            {/* caption */}
            {(current.caption || current.kind !== "cover") && (
              <div className="px-5 pb-6 text-center md:px-8">
                <p className="mx-auto max-w-2xl text-[0.78rem] leading-relaxed text-paper/55">
                  {current.caption || current.alt}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </LightboxContext.Provider>
  );
}

function ArrowButton({
  dir,
  onClick,
}: {
  dir: "left" | "right";
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "left" ? "Previous image" : "Next image"}
      className={`absolute top-1/2 hidden -translate-y-1/2 p-4 text-paper/60 transition-colors hover:text-paper md:block ${
        dir === "left" ? "left-2" : "right-2"
      }`}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
