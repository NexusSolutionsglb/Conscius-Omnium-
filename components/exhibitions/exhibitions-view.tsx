"use client";

import Link from "next/link";
import type { Exhibition, ExhibitionsContent, Profile, Work } from "@/lib/types";
import { DISCIPLINE_LABELS } from "@/lib/types";
import { blurFor } from "@/lib/content/blur";
import { Reveal, StaggerItem, StaggerList } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/primitives";
import { ArtImage } from "@/components/motion/image-reveal";
import { ExhibitionList } from "@/components/exhibitions/exhibition-list";
import { EditableText } from "@/components/editor/editable-text";
import { EditableHeading } from "@/components/editor/editable-heading";
import { EditableRichText } from "@/components/editor/editable-rich-text";
import { RepeatableList } from "@/components/editor/repeatable-list";
import { useEditable, useEditableData, useEditableProfile, useEditorMode } from "@/components/editor/use-editable";
import { newEducation, newExhibition } from "@/lib/editor/new-entities";

function groupByYear(list: Exhibition[]) {
  const groups = new Map<string, Exhibition[]>();
  for (const item of list) {
    const bucket = groups.get(item.year) ?? [];
    bucket.push(item);
    groups.set(item.year, bucket);
  }
  return Array.from(groups.entries())
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, items]) => ({ year, items }));
}

export function ExhibitionsView({
  allExhibitions,
  onScreen,
  profile,
  serverContent,
}: {
  allExhibitions: Exhibition[];
  onScreen: Work[];
  profile: Profile;
  serverContent: ExhibitionsContent;
}) {
  const editing = useEditorMode() === "edit";
  const hero = useEditable("exhibitions", "hero", serverContent.hero);
  const listEyebrow = useEditable("exhibitions", "listEyebrow", serverContent.listEyebrow);
  const listEmpty = useEditable("exhibitions", "listEmpty", serverContent.listEmpty);
  const onScreenCopy = useEditable("exhibitions", "onScreen", serverContent.onScreen);
  const trainingEyebrow = useEditable(
    "exhibitions",
    "trainingEyebrow",
    serverContent.trainingEyebrow,
  );
  const endCtaLabel = useEditable("exhibitions", "endCtaLabel", serverContent.endCtaLabel);
  const liveExhibitions = useEditableData<Exhibition>("exhibitions", allExhibitions);
  const education = useEditableProfile("education", profile.education);
  const publicGroups = groupByYear(liveExhibitions.filter((e) => e.published));

  return (
    <>
      <header className="u-container pb-16 pt-36 md:pb-24 md:pt-44">
        <Eyebrow>
          <EditableText bind="exhibitions.hero.eyebrow">{hero.eyebrow}</EditableText>
        </Eyebrow>
        <EditableHeading
          bind="exhibitions.hero.heading"
          className="mt-5 font-display text-[clamp(2.6rem,1.4rem+5vw,6rem)] font-light leading-[0.98]"
        >
          {hero.heading}
        </EditableHeading>
        <Reveal delay={0.1} className="mt-8 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft">
          <EditableText as="p" bind="exhibitions.hero.intro" multiline>
            {hero.intro}
          </EditableText>
        </Reveal>
      </header>

      <section className="u-container pb-20 md:pb-28">
        <Reveal>
          <Eyebrow>
            <EditableText bind="exhibitions.listEyebrow">{listEyebrow}</EditableText>
          </Eyebrow>
        </Reveal>
        <div className="mt-8">
          {editing ? (
            <EditableExhibitions items={liveExhibitions} />
          ) : publicGroups.length ? (
            <ExhibitionList groups={publicGroups} />
          ) : (
            <EditableText
              as="p"
              bind="exhibitions.listEmpty"
              className="border-y border-line py-10 text-ink-mute"
            >
              {listEmpty}
            </EditableText>
          )}
        </div>
      </section>

      {(onScreen.length > 0 || editing) && (
        <section className="border-y border-line bg-paper-dim/50 py-20 md:py-28">
          <div className="u-container">
            <Reveal className="max-w-2xl">
              <Eyebrow>
                <EditableText bind="exhibitions.onScreen.eyebrow">
                  {onScreenCopy.eyebrow}
                </EditableText>
              </Eyebrow>
              <EditableText
                as="h2"
                bind="exhibitions.onScreen.heading"
                className="mt-4 font-display text-[clamp(1.6rem,1.1rem+2vw,2.6rem)] font-light"
              >
                {onScreenCopy.heading}
              </EditableText>
              <EditableRichText
                bind="exhibitions.onScreen.body"
                className="mt-4 max-w-md text-[0.9rem] leading-relaxed text-ink-soft"
              >
                {onScreenCopy.body}
              </EditableRichText>
            </Reveal>

            <StaggerList className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {onScreen.map((work) => (
                <StaggerItem key={work.slug} as="article">
                  <Link href={`/gallery/${work.slug}`} className="group block">
                    <ArtImage
                      src={work.coverImage}
                      alt={work.images[0]?.alt ?? work.title}
                      ratio="3 / 2"
                      fill
                      sizes="(min-width:1024px) 30vw, 45vw"
                      hoverZoom
                      placeholder={blurFor(work.coverImage) ? "blur" : "empty"}
                      blurDataURL={blurFor(work.coverImage)}
                    />
                    <h3 className="mt-4 font-display text-[1.2rem] text-ink">{work.title}</h3>
                    <p className="u-eyebrow mt-1.5">
                      {[work.role, DISCIPLINE_LABELS[work.discipline]].filter(Boolean).join(" · ")}
                    </p>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerList>
          </div>
        </section>
      )}

      <section className="u-container py-20 md:py-28">
        <Reveal>
          <Eyebrow>
            <EditableText bind="exhibitions.trainingEyebrow">{trainingEyebrow}</EditableText>
          </Eyebrow>
        </Reveal>
        <div className="mt-8 divide-y divide-line border-y border-line">
          <RepeatableList
            slug="exhibitions"
            path="education"
            items={education}
            makeItem={newEducation}
            addLabel="Add training / education"
            addClassName="py-3"
            listBind="@profile.education"
            kind="education"
            itemLabel={(e) => e.qualification || "Education"}
          >
            {(ed, i) => (
              <div className="grid gap-2 py-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-display text-[1.2rem] text-ink">
                    <EditableText bind={`@profile.education.${i}.qualification`}>
                      {ed.qualification}
                    </EditableText>
                  </p>
                  <p className="text-[0.84rem] text-ink-mute">
                    <EditableText bind={`@profile.education.${i}.institution`}>
                      {ed.institution}
                    </EditableText>
                  </p>
                </div>
              </div>
            )}
          </RepeatableList>
        </div>
      </section>

      <section className="u-container pb-24 text-center">
        <Reveal>
          <Link href="/contact" className="u-btn">
            <EditableText bind="exhibitions.endCtaLabel">{endCtaLabel}</EditableText>
          </Link>
        </Reveal>
      </section>
    </>
  );
}

/** Flat, fully editable exhibitions list — shown in place of the year-grouped
 *  accordion while editing. */
function EditableExhibitions({ items }: { items: Exhibition[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      <RepeatableList
        slug="exhibitions"
        path="items"
        items={items}
        makeItem={newExhibition}
        addLabel="Add an exhibition"
        addClassName="py-3"
        listBind="@exhibitions"
        kind="exhibition"
        itemLabel={(e) => `${e.year} · ${e.title}`}
      >
        {(item, i) => (
          <div
            className="py-4"
            data-unpublished={item.published ? undefined : ""}
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-display text-[1.25rem] font-normal text-ink">
                <EditableText bind={`@exhibitions.${i}.title`}>{item.title}</EditableText>
              </span>
              <span className="u-eyebrow shrink-0 text-ink-faint">
                <EditableText bind={`@exhibitions.${i}.year`}>{item.year}</EditableText>
              </span>
            </div>
            <p className="mt-0.5 text-[0.82rem] text-ink-mute">
              <EditableText bind={`@exhibitions.${i}.venue`}>{item.venue}</EditableText>
              {(item.city || item.country) && (
                <>
                  {", "}
                  <EditableText bind={`@exhibitions.${i}.city`}>{item.city ?? ""}</EditableText>
                </>
              )}
            </p>
            {item.description && (
              <p className="mt-2 max-w-xl text-[0.86rem] leading-relaxed text-ink-soft">
                <EditableText bind={`@exhibitions.${i}.description`} multiline>
                  {item.description}
                </EditableText>
              </p>
            )}
          </div>
        )}
      </RepeatableList>
    </div>
  );
}
