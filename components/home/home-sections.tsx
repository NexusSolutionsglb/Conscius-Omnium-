"use client";

import { Fragment, type ReactNode } from "react";
import type {
  Collection,
  Discipline,
  HomeContent,
  HomeSectionKey,
  Profile,
  SiteSettings,
  TimelineEntry,
  Work,
} from "@/lib/types";
import { useEditable, useEditableSettings, useEditorMode } from "@/components/editor/use-editable";
import { Hero } from "./hero";
import { FeaturedWork } from "./featured-work";
import { CollectionsRail, ContactCta, Disciplines, Intro, StudioPreview } from "./sections";
import { TimelineStrip } from "@/components/timeline/timeline";

type DisciplineCard = { discipline: Discipline; work: Work; blurb: string };

export function HomeSections({
  serverContent,
  profile,
  settings,
  heroWork,
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

  const liveHero = useEditableSettings("hero", settings.hero);
  const liveContactCopy = useEditableSettings("contactCopy", settings.contactCopy);
  const liveSettings: SiteSettings = {
    ...settings,
    hero: liveHero,
    contactCopy: liveContactCopy,
  };

  const cards = disciplineCards.map((c) => ({
    ...c,
    blurb: disciplines.blurbs[c.discipline] ?? c.blurb,
  }));

  const nodes: Record<HomeSectionKey, ReactNode> = {
    intro: <Intro profile={profile} settings={liveSettings} copy={intro} />,
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

  const visible = order.filter((k) => !hidden.includes(k));

  return (
    <>
      <Hero hero={liveSettings.hero} work={heroWork} />
      {visible.map((key) =>
        mode === "edit" ? (
          <div key={key} style={{ display: "contents" }} data-edit-section={`home:${key}`}>
            {nodes[key]}
          </div>
        ) : (
          <Fragment key={key}>{nodes[key]}</Fragment>
        ),
      )}
    </>
  );
}
