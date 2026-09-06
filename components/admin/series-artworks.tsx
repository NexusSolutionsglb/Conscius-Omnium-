"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Work } from "@/lib/types";
import { reorderSeriesWorks, setWorkCollection } from "@/lib/admin/actions";
import { Card, StatusPill } from "./ui";

/**
 * The artworks inside one series, managed in place: reorder the hang, pull
 * a work out, drop an existing work in, or open one for full editing.
 *
 * Order is written back as `sort_order` on the works themselves, which is
 * exactly what `/gallery/collection/<slug>` reads — so what the panel shows
 * is what the visitor walks past.
 */
export function SeriesArtworks({
  collectionSlug,
  works,
  available,
}: {
  collectionSlug: string;
  /** Works already in this series, in hang order. */
  works: Work[];
  /** Every other work, for the "add existing" picker. */
  available: Work[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<Work[]>(works);
  const [pick, setPick] = useState("");
  const [pending, start] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  // Keep the picker honest when the server sends a fresh list after a save.
  const availableOptions = useMemo(
    () => available.filter((w) => !items.some((i) => i.id === w.id)),
    [available, items],
  );

  function move(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    setItems(next);

    // `sort_order` is global, so the series reuses the slots it already
    // occupies rather than claiming a fresh 10, 20, 30… band — reordering
    // one series then can't shuffle another one's place in the gallery.
    const slots = items
      .map((w) => w.sortOrder)
      .sort((a, b) => a - b)
      .reduce<number[]>((acc, value) => {
        const last = acc[acc.length - 1];
        acc.push(last !== undefined && value <= last ? last + 1 : value);
        return acc;
      }, []);

    start(async () => {
      const res = await reorderSeriesWorks(
        collectionSlug,
        next.map((w, i) => ({ id: w.id, sortOrder: slots[i] ?? (i + 1) * 10 })),
      );
      setNote(res.ok ? "Order saved" : res.error);
      router.refresh();
    });
  }

  function remove(work: Work) {
    setItems((current) => current.filter((w) => w.id !== work.id));
    start(async () => {
      const res = await setWorkCollection(work.id, null);
      setNote(res.ok ? `Removed “${work.title}”` : res.error);
      router.refresh();
    });
  }

  function add(id: string) {
    const work = available.find((w) => w.id === id);
    if (!work) return;
    setItems((current) => [...current, work]);
    setPick("");
    start(async () => {
      const res = await setWorkCollection(work.id, collectionSlug);
      setNote(res.ok ? `Added “${work.title}”` : res.error);
      router.refresh();
    });
  }

  return (
    <Card title={`Artworks in this series (${items.length})`}>
      {items.length === 0 ? (
        <p className="rounded-md bg-neutral-50 px-3 py-6 text-center text-[12.5px] text-neutral-500">
          No artworks in this series yet. Add an existing one below, or create a
          new one.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {items.map((work, i) => (
            <li key={work.id} className="flex items-center gap-3 py-2.5">
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-neutral-100">
                {work.coverImage && (
                  <Image
                    src={work.coverImage}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/works/${work.id}`}
                  className="block truncate text-[13.5px] font-medium text-neutral-900 hover:underline"
                >
                  {work.title}
                </Link>
                <p className="truncate text-[11px] text-neutral-400">
                  {[work.year, work.medium, `${work.images.length} image${work.images.length === 1 ? "" : "s"}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              <StatusPill status={work.status} />

              <div className="flex items-center gap-1 text-[13px] text-neutral-400">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || pending}
                  className="rounded px-1.5 py-1 hover:bg-neutral-100 disabled:opacity-30"
                  aria-label={`Move ${work.title} earlier`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1 || pending}
                  className="rounded px-1.5 py-1 hover:bg-neutral-100 disabled:opacity-30"
                  aria-label={`Move ${work.title} later`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(work)}
                  disabled={pending}
                  className="rounded px-2 py-1 text-[11.5px] text-red-500 hover:bg-red-50 disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4">
        <select
          value={pick}
          onChange={(e) => {
            setPick(e.target.value);
            if (e.target.value) add(e.target.value);
          }}
          disabled={pending || availableOptions.length === 0}
          className="min-w-[14rem] flex-1 rounded-md border border-neutral-300 px-2.5 py-2 text-[12.5px] disabled:opacity-50"
        >
          <option value="">
            {availableOptions.length
              ? "Add an existing artwork…"
              : "Every artwork is already in a series"}
          </option>
          {availableOptions.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title}
              {w.collectionSlug ? ` (in ${w.collectionSlug})` : ""}
            </option>
          ))}
        </select>

        <Link
          href={`/admin/works/new?collection=${encodeURIComponent(collectionSlug)}`}
          className="rounded-md bg-neutral-900 px-4 py-2 text-[12.5px] font-medium text-white hover:bg-neutral-700"
        >
          + New artwork in this series
        </Link>
      </div>

      <p className="mt-3 text-[11px] text-neutral-400">
        Images, captions and order <em>within</em> one artwork are managed on
        that artwork&rsquo;s own page.
        {note ? ` · ${note}` : ""}
      </p>
    </Card>
  );
}
