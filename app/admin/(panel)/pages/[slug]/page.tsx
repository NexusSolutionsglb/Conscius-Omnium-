import { notFound } from "next/navigation";
import { getPage } from "@/lib/queries/pages";
import type { ManagedPage } from "@/lib/types";
import { PageHeader } from "@/components/admin/ui";
import { PageEditor } from "@/components/admin/page-editor";

const VALID = ["about", "studio", "contact"] as const;

export default async function EditManagedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!VALID.includes(slug as (typeof VALID)[number])) notFound();
  const page = await getPage(slug as ManagedPage["slug"]);

  return (
    <>
      <PageHeader
        title={page.title}
        description={`/${slug}`}
        back={{ href: "/admin/pages", label: "Pages" }}
      />
      <PageEditor page={page} />
    </>
  );
}
