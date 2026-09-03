"use client";

import Image from "next/image";
import Link from "next/link";
import type { AboutContent, Profile, TimelineEntry } from "@/lib/types";
import { blurFor } from "@/lib/content/blur";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow, Rule } from "@/components/ui/primitives";
import { Timeline } from "@/components/timeline/timeline";
import { ArtImage } from "@/components/motion/image-reveal";
import { EditableText } from "@/components/editor/editable-text";
import { EditableHeading } from "@/components/editor/editable-heading";
import { EditableImage } from "@/components/editor/editable-image";
import { RepeatableList } from "@/components/editor/repeatable-list";
import { useEditable, useEditableProfile, useEditorMode } from "@/components/editor/use-editable";

const NEW_SECTION = () => ({
  id: `about-${Date.now()}`,
  eyebrow: "New section",
  heading: "Heading",
  body: ["Write this section."],
});
const NEW_EDU = (): Profile["education"][number] => ({
  qualification: "Qualification",
  institution: "Institution",
});

export function AboutView({
  profile,
  timeline,
  portraitFallback,
  serverContent,
}: {
  profile: Profile;
  timeline: TimelineEntry[];
  portraitFallback: string;
  serverContent: AboutContent;
}) {
  const editing = useEditorMode() === "edit";
  const p = {
    name: useEditableProfile("name", profile.name),
    roles: useEditableProfile("roles", profile.roles),
    statement: useEditableProfile("statement", profile.statement),
    education: useEditableProfile("education", profile.education),
    email: useEditableProfile("email", profile.email),
    phone: useEditableProfile("phone", profile.phone),
    location: useEditableProfile("location", profile.location),
    portrait: useEditableProfile<string | null | undefined>("portrait", profile.portrait),
  };
  const heroEyebrow = useEditable("about", "heroEyebrow", serverContent.heroEyebrow);
  const intro = useEditable("about", "intro", serverContent.intro);
  const portraitCaption = useEditable(
    "about",
    "portraitFallbackCaption",
    serverContent.portraitFallbackCaption,
  );
  const body = useEditable("about", "body", serverContent.body);
  const educationEyebrow = useEditable("about", "educationEyebrow", serverContent.educationEyebrow);
  const tl = useEditable("about", "timeline", serverContent.timeline);
  const nextCta = useEditable("about", "nextCta", serverContent.nextCta);

  return (
    <>
      {/* Hero */}
      <section className="u-container grid gap-12 pb-16 pt-36 md:grid-cols-12 md:pb-24 md:pt-44">
        <div className="md:col-span-7">
          <Eyebrow>
            <EditableText bind="about.heroEyebrow">{heroEyebrow}</EditableText>
          </Eyebrow>
          <EditableHeading
            bind="@profile.name"
            className="mt-5 font-display text-[clamp(2.6rem,1.5rem+4.6vw,5.6rem)] font-light leading-[0.98]"
          >
            {p.name}
          </EditableHeading>
          <Reveal delay={0.1}>
            <p className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-[0.8rem] uppercase tracking-[0.14em] text-ink-mute">
              {p.roles.map((role, i) => (
                <span key={i}>
                  <EditableText bind={`@profile.roles.${i}`}>{role}</EditableText>
                  {i < p.roles.length - 1 && <span className="ml-3 text-ink-faint">/</span>}
                </span>
              ))}
            </p>
          </Reveal>
          <Reveal delay={0.15} className="mt-8 max-w-xl">
            <EditableText as="p" bind="about.intro" multiline className="u-lead">
              {intro}
            </EditableText>
          </Reveal>
        </div>

        <div className="md:col-span-5">
          <Reveal>
            <EditableImage bind="@profile.portrait" folder="profile">
              {p.portrait ? (
                <Image
                  src={p.portrait}
                  alt={`${p.name} — portrait`}
                  width={900}
                  height={1125}
                  sizes="(min-width:768px) 40vw, 100vw"
                  className="w-full object-cover"
                  priority
                />
              ) : (
                <div className="relative">
                  <ArtImage
                    src={portraitFallback}
                    alt="A work from Shivjeet Potdar's practice"
                    ratio="4 / 5"
                    fill
                    sizes="(min-width:768px) 40vw, 100vw"
                    placeholder={blurFor(portraitFallback) ? "blur" : "empty"}
                    blurDataURL={blurFor(portraitFallback)}
                  />
                  <p className="u-eyebrow mt-3 text-ink-faint">
                    <EditableText bind="about.portraitFallbackCaption">
                      {portraitCaption}
                    </EditableText>
                  </p>
                </div>
              )}
            </EditableImage>
          </Reveal>
        </div>
      </section>

      {/* Statement */}
      <section className="border-y border-line bg-paper-dim/50 py-20 md:py-28">
        <div className="u-container">
          <Reveal className="max-w-4xl">
            <p
              className="font-display text-[clamp(1.5rem,1rem+2.4vw,2.8rem)] font-light italic leading-[1.32] text-ink"
              style={{ fontStyle: "italic" }}
            >
              &ldquo;
              <EditableText bind="@profile.statement" multiline>
                {p.statement}
              </EditableText>
              &rdquo;
            </p>
            <p className="u-eyebrow mt-6">{p.name}</p>
          </Reveal>
        </div>
      </section>

      {/* Bio sections */}
      <section className="u-container py-20 md:py-28">
        <RepeatableList
          slug="about"
          path="body"
          items={body}
          makeItem={NEW_SECTION}
          addLabel="Add a section"
          addClassName="py-6"
        >
          {(section, i) => (
            <div className="grid gap-10 border-t border-line py-12 first:border-t-0 md:grid-cols-12">
              <div className="md:col-span-4">
                <Eyebrow>
                  <EditableText bind={`about.body.${i}.eyebrow`}>{section.eyebrow}</EditableText>
                </Eyebrow>
                <EditableText
                  as="h2"
                  bind={`about.body.${i}.heading`}
                  className="mt-4 font-display text-[clamp(1.4rem,1rem+1.6vw,2rem)] font-normal leading-tight"
                >
                  {section.heading}
                </EditableText>
              </div>
              <Reveal delay={i * 0.05} className="u-prose md:col-span-8 md:pl-6">
                <div className="space-y-5 text-[0.95rem] leading-[1.75]">
                  {(section.body ?? []).map((para, j) => (
                    <EditableText key={j} as="p" bind={`about.body.${i}.body.${j}`} multiline>
                      {para}
                    </EditableText>
                  ))}
                </div>
              </Reveal>
            </div>
          )}
        </RepeatableList>
      </section>

      {/* Education */}
      <section className="u-container pb-20 md:pb-28">
        <Reveal>
          <Eyebrow>
            <EditableText bind="about.educationEyebrow">{educationEyebrow}</EditableText>
          </Eyebrow>
          <Rule className="mt-5" />
        </Reveal>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <RepeatableList
            slug="about"
            path="__profile_education"
            items={p.education}
            makeItem={NEW_EDU}
            addLabel="Add education"
            addClassName="py-2"
            listBind="@profile.education"
          >
            {(ed, i) => (
              <Reveal as="div">
                <h3 className="font-display text-[1.3rem] font-normal text-ink">
                  <EditableText bind={`@profile.education.${i}.qualification`}>
                    {ed.qualification}
                  </EditableText>
                </h3>
                <p className="mt-1 text-[0.88rem] text-ink-soft">
                  <EditableText bind={`@profile.education.${i}.institution`}>
                    {ed.institution}
                  </EditableText>
                </p>
                {(ed.detail || editing) && (
                  <p className="mt-1 text-[0.8rem] text-ink-mute">
                    <EditableText bind={`@profile.education.${i}.detail`}>
                      {ed.detail ?? ""}
                    </EditableText>
                  </p>
                )}
              </Reveal>
            )}
          </RepeatableList>
        </div>
        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-2 text-[0.85rem] text-ink-soft">
          <a href={`mailto:${p.email}`} className="u-link">
            <EditableText bind="@profile.email">{p.email}</EditableText>
          </a>
          <span>
            <EditableText bind="@profile.phone">{p.phone}</EditableText>
          </span>
          <span className="text-ink-mute">
            <EditableText bind="@profile.location">{p.location}</EditableText>
          </span>
        </div>
      </section>

      {/* Timeline */}
      <section id="timeline" className="scroll-mt-24 border-t border-line py-16 md:py-24">
        <div className="u-container">
          <Reveal className="max-w-2xl">
            <Eyebrow>
              <EditableText bind="about.timeline.eyebrow">{tl.eyebrow}</EditableText>
            </Eyebrow>
            <EditableText
              as="h2"
              bind="about.timeline.heading"
              multiline
              className="mt-5 font-display text-[clamp(1.8rem,1.1rem+2.8vw,3.4rem)] font-light leading-[1.1]"
            >
              {tl.heading}
            </EditableText>
            <EditableText
              as="p"
              bind="about.timeline.body"
              multiline
              className="mt-5 max-w-md text-[0.92rem] leading-relaxed text-ink-soft"
            >
              {tl.body}
            </EditableText>
          </Reveal>
        </div>
        <div className="mt-6">
          <Timeline entries={timeline} />
        </div>
      </section>

      <section className="u-container py-20 text-center md:py-28">
        <Reveal>
          <Eyebrow>
            <EditableText bind="about.nextCta.eyebrow">{nextCta.eyebrow}</EditableText>
          </Eyebrow>
          <EditableText
            as="h2"
            bind="about.nextCta.heading"
            className="mx-auto mt-5 max-w-xl font-display text-[clamp(1.8rem,1.1rem+2.6vw,3rem)] font-light"
          >
            {nextCta.heading}
          </EditableText>
          <Link href="/studio" className="u-btn mt-8">
            <EditableText bind="about.nextCta.linkLabel">{nextCta.linkLabel}</EditableText>
          </Link>
        </Reveal>
      </section>
    </>
  );
}
