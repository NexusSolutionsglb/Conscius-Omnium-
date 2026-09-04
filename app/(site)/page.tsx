import { getSettings } from "@/lib/queries/settings";
import { getProfile } from "@/lib/queries/profile";
import { getFeaturedWorks, getPublishedWorks } from "@/lib/queries/works";
import { getCollections } from "@/lib/queries/collections";
import { getHomeContent } from "@/lib/queries/pages";
import { buildMetadata } from "@/lib/seo";
import { HomeSections } from "@/components/home/home-sections";

export const revalidate = 3600;

export function generateMetadata() {
  return buildMetadata({ path: "/" });
}

export default async function HomePage() {
  const [settings, profile, featured, allWorks, collections, content] =
    await Promise.all([
      getSettings(),
      getProfile(),
      getFeaturedWorks(6),
      getPublishedWorks(),
      getCollections(),
      getHomeContent(),
    ]);

  const studioImage =
    allWorks.find((w) => w.slug === "shape-of-belief")?.images[1]?.url ??
    "/gallery/black-canvas/shape-of-belief-context.jpg";

  return (
    <HomeSections
      serverContent={content}
      profile={profile}
      settings={settings}
      featured={featured.slice(0, 5)}
      collections={collections}
      studioImage={studioImage}
    />
  );
}
