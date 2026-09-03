import { getSettings } from "@/lib/queries/settings";
import { getProfile } from "@/lib/queries/profile";
import {
  getFeaturedWorks,
  getPublishedWorks,
  getWorkBySlug,
} from "@/lib/queries/works";
import { getCollections } from "@/lib/queries/collections";
import { getTimeline } from "@/lib/queries/timeline";
import { getHomeContent } from "@/lib/queries/pages";
import {
  DISCIPLINE_LABELS,
  type Discipline,
  type HomeContent,
  type Work,
} from "@/lib/types";
import { buildMetadata } from "@/lib/seo";
import { HomeSections } from "@/components/home/home-sections";

export const revalidate = 3600;

export function generateMetadata() {
  return buildMetadata({ path: "/" });
}

function pickDisciplineCards(
  works: Work[],
  blurbs: HomeContent["disciplines"]["blurbs"],
) {
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
    const work =
      works.find((w) => w.discipline === d && w.featured) ??
      works.find((w) => w.discipline === d);
    if (work) {
      cards.push({ discipline: d, work, blurb: blurbs[d] ?? DISCIPLINE_LABELS[d] });
      seen.add(d);
    }
    if (cards.length === 3) break;
  }
  return cards;
}

export default async function HomePage() {
  const [settings, profile, featured, allWorks, collections, timeline, content] =
    await Promise.all([
      getSettings(),
      getProfile(),
      getFeaturedWorks(6),
      getPublishedWorks(),
      getCollections(),
      getTimeline(),
      getHomeContent(),
    ]);

  const heroWork = settings.hero.workSlug
    ? await getWorkBySlug(settings.hero.workSlug)
    : (featured[0] ?? null);

  const disciplineCards = pickDisciplineCards(allWorks, content.disciplines.blurbs);
  const studioImage =
    allWorks.find((w) => w.slug === "the-shapeshifting-landscape")?.coverImage ??
    "/work/the-shapeshifting-landscape.jpg";

  return (
    <HomeSections
      serverContent={content}
      profile={profile}
      settings={settings}
      heroWork={heroWork ?? featured[0] ?? null}
      featured={featured.slice(0, 5)}
      disciplineCards={disciplineCards}
      timeline={timeline}
      collections={collections}
      studioImage={studioImage}
    />
  );
}
