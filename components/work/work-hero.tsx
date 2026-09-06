"use client";

import Link from "next/link";
import type { Work } from "@/lib/types";
import { WorkImageViewer } from "./work-image-viewer";

/**
 * The head of an individual artwork view: where the visitor is
 * (Home / Gallery / Series), what they are looking at, and then the work
 * itself, large. The stage sits on the same white ground as the rest of
 * the site — the shadow alone lifts the painting off the page.
 */
export function WorkHero({
  work,
  series,
}: {
  work: Work;
  series?: { slug: string; title: string } | null;
}) {
  return (
    <div>
      <div className="u-container pt-32 md:pt-40">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <nav aria-label="Breadcrumb" className="u-eyebrow">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="transition-colors hover:text-ink">
                    Home
                  </Link>
                </li>
                <li aria-hidden className="text-ink-faint">
                  /
                </li>
                <li>
                  <Link href="/gallery" className="transition-colors hover:text-ink">
                    Gallery
                  </Link>
                </li>
                {series && (
                  <>
                    <li aria-hidden className="text-ink-faint">
                      /
                    </li>
                    <li>
                      <Link
                        href={`/gallery/collection/${series.slug}`}
                        className="text-ink-soft transition-colors hover:text-ink"
                      >
                        {series.title}
                      </Link>
                    </li>
                  </>
                )}
              </ol>
            </nav>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(2rem,1.3rem+3vw,3.8rem)] leading-[1.06]">
              {work.title}
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="block h-px w-12 bg-ink-faint" />
              <span className="block h-px w-4 bg-ink-faint/50" />
            </div>
          </div>
          {work.year && (
            <span className="font-display text-[1.4rem] text-ink-faint">
              {work.year}
            </span>
          )}
        </div>
      </div>

      <div className="mt-14 md:mt-20">
        <WorkImageViewer images={work.images} />
      </div>
    </div>
  );
}
