import Link from "next/link";
import type { Work } from "@/lib/types";
import { DISCIPLINE_LABELS } from "@/lib/types";
import { blurFor } from "@/lib/content/blur";
import { ArtImage } from "@/components/motion/image-reveal";
import { Reveal, StaggerList } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/primitives";

export function RelatedWorks({ works }: { works: Work[] }) {
  if (!works.length) return null;

  return (
    <section className="u-container py-20 md:py-28">
      <Reveal>
        <Eyebrow>Related work</Eyebrow>
      </Reveal>
      <StaggerList className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => (
          <Reveal key={work.slug} as="article">
            <Link href={`/gallery/${work.slug}`} className="group block">
              <ArtImage
                src={work.coverImage}
                alt={work.images[0]?.alt ?? work.title}
                ratio="4 / 3"
                fill
                sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw"
                hoverZoom
                placeholder={blurFor(work.coverImage) ? "blur" : "empty"}
                blurDataURL={blurFor(work.coverImage)}
              />
              <h3 className="mt-4 font-display text-[1.2rem] font-normal text-ink">
                {work.title}
              </h3>
              <p className="u-eyebrow mt-1.5">
                {[DISCIPLINE_LABELS[work.discipline], work.year].filter(Boolean).join(" · ")}
              </p>
            </Link>
          </Reveal>
        ))}
      </StaggerList>
    </section>
  );
}
