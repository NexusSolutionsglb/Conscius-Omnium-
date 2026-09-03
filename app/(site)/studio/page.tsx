import type { Metadata } from "next";
import { getPage, getStudioContent } from "@/lib/queries/pages";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/site/json-ld";
import { StudioView } from "@/components/studio/studio-view";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("studio");
  return buildMetadata({
    title: "Studio & Process",
    description: page.seo?.description ?? page.intro ?? undefined,
    path: "/studio",
  });
}

export default async function StudioPage() {
  const content = await getStudioContent();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Studio", path: "/studio" },
        ])}
      />
      <StudioView serverContent={content} />
    </>
  );
}
