"use client";

import Link from "next/link";
import type { StudioContent } from "@/lib/types";
import { blurFor } from "@/lib/content/blur";
import { cn } from "@/lib/utils";
import { ArtImage } from "@/components/motion/image-reveal";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/primitives";
import { EditableText } from "@/components/editor/editable-text";
import { EditableHeading } from "@/components/editor/editable-heading";
import { RepeatableList } from "@/components/editor/repeatable-list";
import { useEditable } from "@/components/editor/use-editable";

const NEW_SECTION = () => ({
  id: `studio-${Date.now()}`,
  eyebrow: "New step",
  heading: "Heading",
  body: ["Describe this part of the process."],
  image: null as string | null,
  caption: null as string | null,
  layout: "image-right" as const,
});

export function StudioView({ serverContent }: { serverContent: StudioContent }) {
  const hero = useEditable("studio", "hero", serverContent.hero);
  const intro = useEditable("studio", "intro", serverContent.intro);
  const body = useEditable("studio", "body", serverContent.body);
  const endCta = useEditable("studio", "endCta", serverContent.endCta);

  return (
    <>
      <header className="u-container pb-16 pt-36 md:pb-24 md:pt-44">
        <Eyebrow>
          <EditableText bind="studio.hero.eyebrow">{hero.eyebrow}</EditableText>
        </Eyebrow>
        <EditableHeading
          bind="studio.hero.heading"
          className="mt-5 font-display text-[clamp(2.6rem,1.4rem+5vw,6rem)] font-light leading-[0.98]"
        >
          {hero.heading}
        </EditableHeading>
        <Reveal delay={0.1} className="mt-8 max-w-xl">
          <EditableText as="p" bind="studio.intro" multiline className="u-lead">
            {intro}
          </EditableText>
        </Reveal>
      </header>

      <div className="pb-10">
        <RepeatableList
          slug="studio"
          path="body"
          items={body}
          makeItem={NEW_SECTION}
          addLabel="Add a process step"
        >
          {(section, i) => {
            const imageLeft = section.layout === "image-left";
            return (
              <section className="u-container border-t border-line py-16 md:py-24">
                <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
                  <Reveal className={cn(imageLeft ? "md:order-2" : "md:order-1")}>
                    <Eyebrow>
                      <EditableText bind={`studio.body.${i}.eyebrow`}>{section.eyebrow}</EditableText>
                    </Eyebrow>
                    <EditableText
                      as="h2"
                      bind={`studio.body.${i}.heading`}
                      className="mt-4 font-display text-[clamp(1.6rem,1.1rem+2vw,2.6rem)] font-light leading-[1.14]"
                    >
                      {section.heading}
                    </EditableText>
                    <div className="u-prose mt-6 space-y-4 text-[0.94rem] leading-[1.75]">
                      {(section.body ?? []).map((para, j) => (
                        <EditableText
                          key={j}
                          as="p"
                          bind={`studio.body.${i}.body.${j}`}
                          multiline
                        >
                          {para}
                        </EditableText>
                      ))}
                    </div>
                  </Reveal>

                  {section.image && (
                    <Parallax amount={24} className={cn(imageLeft ? "md:order-1" : "md:order-2")}>
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
                            <EditableText bind={`studio.body.${i}.caption`}>
                              {section.caption}
                            </EditableText>
                          </figcaption>
                        )}
                      </figure>
                    </Parallax>
                  )}
                </div>
              </section>
            );
          }}
        </RepeatableList>
      </div>

      <section className="u-container border-t border-line py-20 text-center md:py-28">
        <Reveal>
          <Eyebrow>
            <EditableText bind="studio.endCta.eyebrow">{endCta.eyebrow}</EditableText>
          </Eyebrow>
          <EditableText
            as="h2"
            bind="studio.endCta.heading"
            className="mx-auto mt-5 max-w-xl font-display text-[clamp(1.8rem,1.1rem+2.6vw,3rem)] font-light"
          >
            {endCta.heading}
          </EditableText>
          <Link href="/work" className="u-btn mt-8">
            <EditableText bind="studio.endCta.linkLabel">{endCta.linkLabel}</EditableText>
          </Link>
        </Reveal>
      </section>
    </>
  );
}
