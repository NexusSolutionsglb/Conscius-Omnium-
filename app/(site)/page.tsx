import { getSettings } from "@/lib/queries/settings";
import { getProfile } from "@/lib/queries/profile";
import {
  getFeaturedWorks,
  getPublishedWorks,
  getWorkBySlug,
} from "@/lib/queries/works";
import { getCollections } from "@/lib/queries/collections";
import { getTimeline } from "@/lib/queries/timeline";
import { DISCIPLINE_LABELS, type Discipline, type Work } from "@/lib/types";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/hero";
import { FeaturedWork } from "@/components/home/featured-work";
import {
  CollectionsRail,
  ContactCta,
  Disciplines,
  Intro,
  StudioPreview,
} from "@/components/home/sections";
import { TimelineStrip } from "@/components/timeline/timeline";

export const revalidate = 3600;

export function generateMetadata() {
  return buildMetadata({ path: "/" });
}

const DISCIPLINE_BLURBS: Partial<Record<Discipline, string>> = {
  architecture:
    "Built and speculative — a house that breathes, a tower over a ruin, a black marble monument to love.",
  "production-design":
    "Title cards, first-look posters and character design for Kannada cinema and a Prime Original.",
  photography:
    "Miniatures and conservation workers, shot until the seam between model and world disappears.",
  experimental:
    "Plaster cities, a pierced tin can as architecture, an infotech flush plate that pays you back.",
  art: "An abstract Shiva from a blue cosmos; an entire seascape in four lines.",
  graphic: "Marks and identities folded back into Indian myth.",
};

function pickDisciplineCards(works: Work[]) {
  const order: Discipline[] = [
    "architecture",
    "production-design",
    "photography",
    "experimental",
    "graphic",
    "art",
  ];
  const seen = new Set<Discipline>();
  const cards: { discipline: Discipline; work: Work; blurb: string }[] = [];
  for (const d of order) {
    if (seen.has(d)) continue;
    const work = works.find((w) => w.discipline === d && w.featured) ??
      works.find((w) => w.discipline === d);
    if (work) {
      cards.push({
        discipline: d,
        work,
        blurb: DISCIPLINE_BLURBS[d] ?? DISCIPLINE_LABELS[d],
      });
      seen.add(d);
    }
    if (cards.length === 3) break;
  }
  return cards;
}

export default async function HomePage() {
  const [settings, profile, featured, allWorks, collections, timeline] =
    await Promise.all([
      getSettings(),
      getProfile(),
      getFeaturedWorks(6),
      getPublishedWorks(),
      getCollections(),
      getTimeline(),
    ]);

  const heroWork = settings.hero.workSlug
    ? await getWorkBySlug(settings.hero.workSlug)
    : (featured[0] ?? null);

  const disciplineCards = pickDisciplineCards(allWorks);
  const studioImage =
    allWorks.find((w) => w.slug === "the-shapeshifting-landscape")?.coverImage ??
    "/work/the-shapeshifting-landscape.jpg";

  return (
    <>
      <Hero hero={settings.hero} work={heroWork ?? featured[0] ?? null} />
      <Intro profile={profile} settings={settings} />
      <FeaturedWork works={featured.slice(0, 5)} />
      <Disciplines cards={disciplineCards} />
      <TimelineStrip entries={timeline} />
      <StudioPreview image={studioImage} />
      <CollectionsRail collections={collections} />
      <ContactCta
        heading={settings.contactCopy.heading}
        supporting={settings.contactCopy.supporting}
      />
    </>
  );
}
