import type { Metadata } from "next";
import { getExhibitionsByYear } from "@/lib/queries/exhibitions";
import { getPublishedWorks } from "@/lib/queries/works";
import { getProfile } from "@/lib/queries/profile";
import { getExhibitionsContent } from "@/lib/queries/pages";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/site/json-ld";
import { ExhibitionsView } from "@/components/exhibitions/exhibitions-view";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Exhibitions & Experience",
  description:
    "Exhibitions, installations and screen work by Shivjeet Potdar — including Pavilion RVCA X (2017), production design for the Kannada feature FUBAR, and concept key art for the Prime Original LORE.",
  path: "/exhibitions",
});

export default async function ExhibitionsPage() {
  const [groups, works, profile, content] = await Promise.all([
    getExhibitionsByYear(),
    getPublishedWorks(),
    getProfile(),
    getExhibitionsContent(),
  ]);

  const onScreen = works.filter((w) =>
    ["film", "production-design"].includes(w.discipline),
  );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Exhibitions", path: "/exhibitions" },
        ])}
      />
      <ExhibitionsView
        groups={groups}
        onScreen={onScreen}
        profile={profile}
        serverContent={content}
      />
    </>
  );
}
