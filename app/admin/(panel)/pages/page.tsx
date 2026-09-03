import Link from "next/link";
import { PageHeader, Card } from "@/components/admin/ui";

const PAGES = [
  { slug: "about", label: "About", note: "Bio, approach, education (the timeline is managed separately)." },
  { slug: "studio", label: "Studio & Process", note: "The four process sections and their images." },
  { slug: "contact", label: "Contact", note: "Intro copy above the enquiry form." },
];

export default function PagesIndex() {
  return (
    <>
      <PageHeader title="Pages" description="Editable body content for the near-static pages." />
      <div className="grid gap-3 sm:grid-cols-2">
        {PAGES.map((p) => (
          <Link key={p.slug} href={`/admin/pages/${p.slug}`}>
            <Card className="transition-colors hover:border-neutral-400">
              <p className="font-serif text-lg text-neutral-900">{p.label}</p>
              <p className="mt-1 text-[12px] text-neutral-500">{p.note}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
