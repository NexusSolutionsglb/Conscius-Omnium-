import type { Metadata } from "next";
import { getProfile } from "@/lib/queries/profile";
import { getPage, getAboutContent } from "@/lib/queries/pages";
import { getTimeline } from "@/lib/queries/timeline";
import { getFeaturedWorks } from "@/lib/queries/works";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/site/json-ld";
import { AboutView } from "@/components/about/about-view";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return buildMetadata({
    title: page.seo?.title ? page.seo.title.replace(" — Conscious Omnium", "") : "About",
    description: page.seo?.description ?? page.intro ?? undefined,
    path: "/about",
    type: "profile",
  });
}

export default async function AboutPage() {
  const [profile, timeline, featured, content] = await Promise.all([
    getProfile(),
    getTimeline(),
    getFeaturedWorks(1),
    getAboutContent(),
  ]);

  const portraitFallback = featured[0]?.coverImage ?? "/work/the-formalin-man.jpg";

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <AboutView
        profile={profile}
        timeline={timeline}
        portraitFallback={portraitFallback}
        serverContent={content}
      />
    </>
  );
}
