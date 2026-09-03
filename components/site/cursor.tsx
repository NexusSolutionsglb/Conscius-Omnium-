"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { canUseCustomCursor } from "@/lib/client";

export type CursorState =
  | "default"
  | "view"
  | "drag"
  | "open"
  | "close"
  | "inquire"
  | "prev"
  | "next"
  | "hidden";

interface CursorApi {
  setCursor: (state: CursorState, label?: string) => void;
  reset: () => void;
  enabled: boolean;
}

const CursorContext = createContext<CursorApi>({
  setCursor: () => {},
  reset: () => {},
  enabled: false,
});

export const useCursor = () => useContext(CursorContext);

const LABELS: Partial<Record<CursorState, string>> = {
  view: "View",
  drag: "Drag",
  open: "Open",
  close: "Close",
  inquire: "Enquire",
  prev: "Prev",
  next: "Next",
};

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<CursorState>("hidden");
  const [label, setLabel] = useState<string | undefined>();
  const [present, setPresent] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 520, damping: 40, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 520, damping: 40, mass: 0.4 });

  useEffect(() => {
    const ok = canUseCustomCursor();
    setEnabled(ok);
    if (!ok) return;

    document.documentElement.classList.add("has-custom-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setPresent(true);
      setState((s) => (s === "hidden" ? "default" : s));
    };
    const leave = () => setPresent(false);
    const enter = () => setPresent(true);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    window.addEventListener("blur", leave);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      window.removeEventListener("blur", leave);
    };
  }, [x, y]);

  const setCursor = useCallback((next: CursorState, nextLabel?: string) => {
    setState(next);
    setLabel(nextLabel ?? LABELS[next]);
  }, []);

  const reset = useCallback(() => {
    setState("default");
    setLabel(undefined);
  }, []);

  const api = useMemo<CursorApi>(
    () => ({ setCursor, reset, enabled }),
    [setCursor, reset, enabled],
  );

  const off = !present || state === "hidden";
  const hasLabel = Boolean(label) && state !== "default" && !off;

  return (
    <CursorContext.Provider value={api}>
      {children}
      {enabled && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-[300]"
          style={{ x: springX, y: springY }}
        >
          {/* outer ring — follows with slight lag, hidden while a label shows */}
          <motion.span
            className="absolute rounded-full border border-ink/40"
            initial={false}
            animate={{
              width: off || hasLabel ? 0 : 34,
              height: off || hasLabel ? 0 : 34,
              opacity: off || hasLabel ? 0 : 0.5,
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ translateX: "-50%", translateY: "-50%" }}
          />
          <motion.div
            className="relative flex items-center justify-center rounded-full bg-ink text-paper"
            initial={false}
            animate={{
              width: hasLabel ? 74 : off ? 0 : 8,
              height: hasLabel ? 74 : off ? 0 : 8,
              opacity: off ? 0 : 1,
            }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ translateX: "-50%", translateY: "-50%" }}
          >
            <AnimatePresence>
              {hasLabel && (
                <motion.span
                  key={label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="select-none text-[9px] font-medium uppercase tracking-[0.18em] text-paper"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </CursorContext.Provider>
  );
}

/**
 * Convenience wrapper — attach hover-driven cursor states to any element
 * without wiring handlers by hand.
 */
export function CursorZone({
  state,
  label,
  children,
  className,
  as: Tag = "div",
}: {
  state: CursorState;
  label?: string;
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  const { setCursor, reset } = useCursor();
  return (
    <Tag
      className={className}
      onPointerEnter={() => setCursor(state, label)}
      onPointerLeave={reset}
    >
      {children}
    </Tag>
  );
}
