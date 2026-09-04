import { notFound } from "next/navigation";
import { getSettings } from "@/lib/queries/settings";
import { getProfile } from "@/lib/queries/profile";
import { getAllWorks } from "@/lib/queries/works";
import { getAllCollections } from "@/lib/queries/collections";
import { getAllExhibitions } from "@/lib/queries/exhibitions";
import { getAllTimelineEntries } from "@/lib/queries/timeline";
import { getPageContent } from "@/lib/queries/pages";
import { EDITABLE_PAGE_SLUGS, type EditablePageSlug } from "@/lib/content/defaults";
import type { PageContentMap } from "@/lib/types";
import type { EditorSnapshot } from "@/lib/editor/types";
import { EditorShell } from "@/components/editor/editor-shell";
import {
  FOOTER_COPYRIGHT_DEFAULT,
  FOOTER_CREDIT_DEFAULT,
  FOOTER_LEGAL_DEFAULT,
  FOOTER_OWNER_DEFAULT,
} from "@/lib/content/defaults/footer";

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

  const [settings, profile, works, collections, exhibitions, timeline, ...contents] =
    await Promise.all([
      getSettings(),
      getProfile(),
      getAllWorks(),
      getAllCollections(),
      getAllExhibitions(),
      getAllTimelineEntries(),
      ...EDITABLE_PAGE_SLUGS.map((s) => getPageContent(s)),
    ]);

  const pages = {} as PageContentMap;
  EDITABLE_PAGE_SLUGS.forEach((s, i) => {
    // @ts-expect-error union assignment is sound here
    pages[s] = contents[i];
  });

  const snapshot: EditorSnapshot = {
    pages,
    profile,
    collections,
    exhibitions,
    timeline,
    works,
    settings: {
      hero: settings.hero,
      contactCopy: settings.contactCopy,
      theme: settings.theme ?? {},
      nav: settings.nav,
      brand: settings.brand,
      brandLine: settings.brandLine,
      tagline: settings.tagline,
      footerNote: settings.footerNote,
      footerLegal: settings.footerLegal ?? FOOTER_LEGAL_DEFAULT,
      footerOwner: settings.footerOwner ?? FOOTER_OWNER_DEFAULT,
      footerCopyright: settings.footerCopyright ?? FOOTER_COPYRIGHT_DEFAULT,
      footerCredit: settings.footerCredit ?? FOOTER_CREDIT_DEFAULT,
    },
  };

  return <EditorShell slug={active} snapshot={snapshot} />;
}
