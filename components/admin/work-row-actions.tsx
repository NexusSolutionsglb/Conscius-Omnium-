"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  deleteWork,
  duplicateWork,
  setWorkStatus,
  toggleWorkFeatured,
} from "@/lib/admin/actions";

const MENU_WIDTH = 176; // w-44
const MENU_HEIGHT = 190; // approx, for flip decision

export function WorkRowActions({
  id,
  slug,
  status,
  featured,
}: {
  id: string;
  slug: string;
  status: string;
  featured: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const place = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < MENU_HEIGHT && r.top > spaceBelow;
    setCoords({
      top: openUp ? r.top - MENU_HEIGHT - 4 : r.bottom + 4,
      left: Math.max(8, Math.min(r.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    place();
    const close = () => setOpen(false);
    // Reposition on resize; close on scroll so the menu never drifts off its row.
    window.addEventListener("resize", place);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", close, true);
    };
  }, [open, place]);

  const run = (fn: () => Promise<unknown>) =>
    start(async () => {
      await fn();
      setOpen(false);
      router.refresh();
    });

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded px-2 py-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
        aria-label="Actions"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={pending}
      >
        •••
      </button>

      {open &&
        coords &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div
              role="menu"
              className="fixed z-50 w-44 rounded-lg border border-neutral-200 bg-white py-1 text-[12.5px] shadow-lg"
              style={{ top: coords.top, left: coords.left }}
            >
              <a
                href={`/gallery/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-1.5 text-neutral-600 hover:bg-neutral-50"
              >
                View / preview ↗
              </a>
              <button
                className="block w-full px-3 py-1.5 text-left text-neutral-600 hover:bg-neutral-50"
                onClick={() =>
                  run(() =>
                    setWorkStatus(id, status === "published" ? "draft" : "published"),
                  )
                }
              >
                {status === "published" ? "Unpublish" : "Publish"}
              </button>
              <button
                className="block w-full px-3 py-1.5 text-left text-neutral-600 hover:bg-neutral-50"
                onClick={() => run(() => toggleWorkFeatured(id, !featured))}
              >
                {featured ? "Unfeature" : "Feature"}
              </button>
              <button
                className="block w-full px-3 py-1.5 text-left text-neutral-600 hover:bg-neutral-50"
                onClick={() =>
                  run(async () => {
                    const r = await duplicateWork(id);
                    if (r.ok && r.id) router.push(`/admin/works/${r.id}`);
                  })
                }
              >
                Duplicate
              </button>
              <button
                className="block w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (confirm("Delete this work permanently?")) run(() => deleteWork(id));
                }}
              >
                Delete
              </button>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
