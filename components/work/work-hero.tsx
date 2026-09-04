"use client";

import Link from "next/link";
import type { Work } from "@/lib/types";
import { DISCIPLINE_LABELS } from "@/lib/types";
import { WorkImageViewer } from "./work-image-viewer";

export function WorkHero({ work }: { work: Work }) {
  return (
    <div>
      <div className="u-container pt-28 md:pt-36">
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
                <li aria-hidden className="text-ink-faint">·</li>
                <li>
                  <Link
                    href={`/gallery?discipline=${work.discipline}`}
                    className="text-ink-soft transition-colors hover:text-ink"
                  >
                    {DISCIPLINE_LABELS[work.discipline]}
                  </Link>
                </li>
              </ol>
            </nav>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.2rem,1.3rem+3.6vw,4.4rem)] font-light leading-[1.03]">
              {work.title}
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="block h-px w-12 bg-ink-faint" />
              <span className="block h-px w-4 bg-ink-faint/50" />
            </div>
          </div>
          {work.year && (
            <span className="font-display text-[1.5rem] font-light text-ink-faint">
              {work.year}
            </span>
          )}
        </div>
      </div>

  <div className="mt-10 md:mt-16 bg-[#f5f3f0] py-14">
        <WorkImageViewer images={work.images} />
      </div>
    </div>
  );
}
