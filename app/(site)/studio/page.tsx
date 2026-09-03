import type { Metadata } from "next";
import Link from "next/link";
import { getPage } from "@/lib/queries/pages";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { blurFor } from "@/lib/content/blur";
import { cn } from "@/lib/utils";
import { ArtImage } from "@/components/motion/image-reveal";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Eyebrow } from "@/components/ui/primitives";
import { JsonLd } from "@/components/site/json-ld";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("studio");
  return buildMetadata({
    title: "Studio & Process",
    description: page.seo?.description ?? page.intro ?? undefined,
    path: "/studio",
  });
}

export default async function StudioPage() {
  const page = await getPage("studio");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Studio", path: "/studio" },
        ])}
      />

      <header className="u-container pb-16 pt-36 md:pb-24 md:pt-44">
        <Eyebrow>Studio &amp; Process</Eyebrow>
        <TextReveal
          as="h1"
          text={"Material,\nthen idea."}
          className="mt-5 font-display text-[clamp(2.6rem,1.4rem+5vw,6rem)] font-light leading-[0.98]"
        />
        <Reveal delay={0.1} className="mt-8 max-w-xl">
          <p className="u-lead">{page.intro}</p>
        </Reveal>
      </header>

      <div className="pb-10">
        {page.sections.map((section, i) => {
          const imageLeft = section.layout === "image-left";
          return (
            <section
              key={section.id}
              className="u-container border-t border-line py-16 md:py-24"
            >
              <div
                className={cn(
                  "grid items-center gap-10 md:grid-cols-2 md:gap-16",
                )}
              >
                <Reveal
                  className={cn(
                    imageLeft ? "md:order-2" : "md:order-1",
                  )}
                >
                  <Eyebrow>{section.eyebrow}</Eyebrow>
                  <h2 className="mt-4 font-display text-[clamp(1.6rem,1.1rem+2vw,2.6rem)] font-light leading-[1.14]">
                    {section.heading}
                  </h2>
                  <div className="u-prose mt-6 space-y-4 text-[0.94rem] leading-[1.75]">
                    {(section.body ?? []).map((para, j) => (
                      <p key={j}>{para}</p>
                    ))}
                  </div>
                </Reveal>

                {section.image && (
                  <Parallax
                    amount={24}
                    className={cn(imageLeft ? "md:order-1" : "md:order-2")}
                  >
                    <figure>
                      <ArtImage
                        src={section.image}
                        alt={section.caption ?? section.heading ?? "Studio process"}
                        ratio={i % 2 === 0 ? "4 / 3" : "3 / 4"}
                        fill
                        sizes="(min-width:768px) 45vw, 100vw"
                        placeholder={blurFor(section.image) ? "blur" : "empty"}
                        blurDataURL={blurFor(section.image)}
                      />
                      {section.caption && (
                        <figcaption className="mt-3 text-[0.75rem] leading-relaxed text-ink-mute">
                          {section.caption}
                        </figcaption>
                      )}
                    </figure>
                  </Parallax>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <section className="u-container border-t border-line py-20 text-center md:py-28">
        <Reveal>
          <Eyebrow>See it applied</Eyebrow>
          <h2 className="mx-auto mt-5 max-w-xl font-display text-[clamp(1.8rem,1.1rem+2.6vw,3rem)] font-light">
            Every method, in the work itself.
          </h2>
          <Link href="/work" className="u-btn mt-8">
            View selected work
          </Link>
        </Reveal>
      </section>
    </>
  );
}
