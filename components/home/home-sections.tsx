"use client";

import { Fragment, type ReactNode } from "react";
import type {
  BlockBase,
  Collection,
  CustomBlock,
  Discipline,
  HomeContent,
  HomeSectionKey,
  Profile,
  SiteSettings,
  TimelineEntry,
  Work,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { sectionStyleClass } from "@/lib/editor/section-style";
import {
  useEditable,
  useEditableData,
  useEditableProfile,
  useEditableSettings,
  useEditorMode,
} from "@/components/editor/use-editable";
import { AddSectionBar } from "@/components/editor/add-section-bar";
import { Hero } from "./hero";
import { FeaturedWork } from "./featured-work";
import { CustomBlockView } from "./custom-block";
import { CollectionsRail, ContactCta, Disciplines, Intro, StudioPreview } from "./sections";
import { TimelineStrip } from "@/components/timeline/timeline";

type DisciplineCard = { discipline: Discipline; work: Work; blurb: string };

export function HomeSections({
  serverContent,
  profile,
  settings,
  heroWork,
  works,
  featured,
  disciplineCards,
  timeline,
  collections,
  studioImage,
}: {
  serverContent: HomeContent;
  profile: Profile;
  settings: SiteSettings;
  heroWork: Work | null;
  works: Work[];
  featured: Work[];
  disciplineCards: DisciplineCard[];
  timeline: TimelineEntry[];
  collections: Collection[];
  studioImage: string;
}) {
  const mode = useEditorMode();

  const order = useEditable("home", "order", serverContent.order);
  const hidden = useEditable("home", "hidden", serverContent.hidden);
  const intro = useEditable("home", "intro", serverContent.intro);
  const featuredCopy = useEditable("home", "featured", serverContent.featured);
  const disciplines = useEditable("home", "disciplines", serverContent.disciplines);
  const timelineCopy = useEditable("home", "timeline", serverContent.timeline);
  const studioPreview = useEditable("home", "studioPreview", serverContent.studioPreview);
  const collectionsCopy = useEditable("home", "collections", serverContent.collections);
  const contactCta = useEditable("home", "contactCta", serverContent.contactCta);
  const blocks = useEditable<Record<string, CustomBlock>>(
    "home",
    "blocks",
    serverContent.blocks ?? {},
  );
  const sectionStyles = useEditable<Record<string, BlockBase>>(
    "home",
    "sectionStyles",
    serverContent.sectionStyles ?? {},
  );

  const liveHero = useEditableSettings("hero", settings.hero);
  const liveContactCopy = useEditableSettings("contactCopy", settings.contactCopy);
  const liveSettings: SiteSettings = {
    ...settings,
    hero: liveHero,
    contactCopy: liveContactCopy,
  };
  const bio = useEditableProfile("bio", profile.bio);

  const liveWorks = useEditableData<Work>("works", works);

  // Resolve the hero's featured work live so changing it in the editor updates
  // the background image without a publish.
  const resolvedHeroWork =
    (liveHero.workSlug && liveWorks.find((w) => w.slug === liveHero.workSlug)) ||
    heroWork ||
    liveWorks.find((w) => w.featured) ||
    liveWorks[0] ||
    null;

  const cards = disciplineCards.map((c) => ({
    ...c,
    blurb: disciplines.blurbs[c.discipline] ?? c.blurb,
  }));

  const nodes: Record<HomeSectionKey, ReactNode> = {
    intro: <Intro bio={bio} settings={liveSettings} copy={intro} />,
    featured: <FeaturedWork works={featured} copy={featuredCopy} />,
    disciplines: <Disciplines cards={cards} copy={disciplines} />,
    timeline: <TimelineStrip entries={timeline} copy={timelineCopy} />,
    studioPreview: <StudioPreview image={studioImage} copy={studioPreview} />,
    collections: <CollectionsRail collections={collections} copy={collectionsCopy} />,
    contactCta: (
      <ContactCta
        heading={liveSettings.contactCopy.heading}
        supporting={liveSettings.contactCopy.supporting}
        copy={contactCta}
      />
    ),
  };

  const editing = mode === "edit";
  const visible = order.filter((k) => editing || !hidden.includes(k));

  const renderNode = (key: string): ReactNode => {
    if (key.startsWith("block:")) {
      const id = key.slice(6);
      return <CustomBlockView id={id} block={blocks[id]} />;
    }
    return nodes[key as HomeSectionKey] ?? null;
  };

  return (
    <>
      <Hero hero={liveSettings.hero} work={resolvedHeroWork} />
      {visible.map((key, idx) => {
        const overrideCls = key.startsWith("block:") ? "" : sectionStyleClass(sectionStyles[key]);
        const node = renderNode(key);
        const framed = overrideCls ? (
          <div
            className={cn(
              overrideCls,
              "[&_section]:!bg-transparent [&_section]:!border-y-0 [&_section]:!py-0",
            )}
          >
            {node}
          </div>
        ) : (
          node
        );
        return editing ? (
          <div
            key={`${key}-${idx}`}
            style={{ display: "contents" }}
            data-edit-section={`home:${key}`}
          >
            {framed}
          </div>
        ) : (
          <Fragment key={`${key}-${idx}`}>{framed}</Fragment>
        );
      })}
      {editing && <AddSectionBar slug="home" />}
    </>
  );
}
