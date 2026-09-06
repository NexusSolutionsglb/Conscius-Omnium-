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
    <section className="u-container py-28 md:py-40">
      <Reveal>
        <Eyebrow>Related work</Eyebrow>
      </Reveal>
      <StaggerList className="mt-12 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => (
          <Reveal key={work.slug} as="article">
            <Link href={`/gallery/${work.slug}`} className="group block">
              {/* Same plate as every other image in the gallery system. */}
              <div className="u-plate u-artframe u-artframe--lift">
                <ArtImage
                  src={work.coverImage}
                  alt={work.images[0]?.alt ?? work.title}
                  width={work.images[0]?.width ?? 2200}
                  height={work.images[0]?.height ?? 2200}
                  fit="cover"
                  sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw"
                  placeholder={blurFor(work.coverImage) ? "blur" : "empty"}
                  blurDataURL={blurFor(work.coverImage)}
                  wrapperClassName="h-full w-full"
                />
              </div>
              <h3 className="mt-5 font-display text-[1.05rem] text-ink">
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
