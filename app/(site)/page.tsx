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

  // The featured grid is a strict three-up schematic, so it looks wrong
  // half-filled. Top the selection up from the rest of the published work
  // until it completes a row (3 or 6), without ever showing a piece twice.
  const featuredGrid = (() => {
    const picked = [...featured];
    const rest = allWorks.filter((w) => !picked.some((p) => p.slug === w.slug));
    const target = picked.length > 3 ? 6 : 3;
    while (picked.length < target && rest.length) picked.push(rest.shift()!);
    return picked.slice(0, 6);
  })();

  const studioImage =
    allWorks.find((w) => w.slug === "shape-of-belief")?.images[1]?.url ??
    "/gallery/black-canvas/shape-of-belief-context.jpg";

  return (
    <HomeSections
      serverContent={content}
      profile={profile}
      settings={settings}
      featured={featuredGrid}
      collections={collections}
      studioImage={studioImage}
    />
  );
}
