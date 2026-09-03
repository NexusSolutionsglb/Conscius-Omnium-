import { notFound } from "next/navigation";
import { getSettings } from "@/lib/queries/settings";
import { getPageContent } from "@/lib/queries/pages";
import {
  EDITABLE_PAGE_SLUGS,
  type EditablePageSlug,
} from "@/lib/content/defaults";
import type { PageContentMap } from "@/lib/types";
import { EditorShell } from "@/components/editor/editor-shell";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return EDITABLE_PAGE_SLUGS.map((slug) => ({ slug }));
}

export default async function EditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!EDITABLE_PAGE_SLUGS.includes(slug as EditablePageSlug)) notFound();
  const active = slug as EditablePageSlug;

  const [settings, ...contents] = await Promise.all([
    getSettings(),
    ...EDITABLE_PAGE_SLUGS.map((s) => getPageContent(s)),
  ]);

  const pages = {} as PageContentMap;
  EDITABLE_PAGE_SLUGS.forEach((s, i) => {
    // @ts-expect-error union assignment is sound here
    pages[s] = contents[i];
  });

  return (
    <EditorShell
      slug={active}
      pages={pages}
      settings={{
        hero: settings.hero,
        contactCopy: settings.contactCopy,
        theme: settings.theme ?? {},
        nav: settings.nav,
        brand: settings.brand,
        brandLine: settings.brandLine,
        tagline: settings.tagline,
        footerNote: settings.footerNote,
      }}
    />
  );
}
