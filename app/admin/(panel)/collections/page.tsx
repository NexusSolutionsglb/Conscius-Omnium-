import Link from "next/link";
import { getAllCollections } from "@/lib/queries/collections";
import { getAllWorks } from "@/lib/queries/works";
import { PageHeader, EmptyState } from "@/components/admin/ui";

export default async function CollectionsListPage() {
  const [collections, works] = await Promise.all([
    getAllCollections(),
    getAllWorks(),
  ]);
  const countFor = (slug: string) =>
    works.filter((w) => w.collectionSlug === slug).length;
  return (
    <>
      <PageHeader
        title="Series"
        description="The gallery is a wall of series. Each one holds its own artworks — open a series to add, reorder or remove them."
        action={
          <Link href="/admin/collections/new" className="rounded-md bg-neutral-900 px-4 py-2 text-[12.5px] font-medium text-white hover:bg-neutral-700">
            + New series
          </Link>
        }
      />
      {collections.length === 0 ? (
        <EmptyState title="No series yet" />
      ) : (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {collections.map((c) => (
            <Link key={c.id} href={`/admin/collections/${c.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50">
              <div>
                <p className="text-[13.5px] font-medium text-neutral-900">{c.title}</p>
                <p className="text-[11px] text-neutral-400">
                  /{c.slug} · {countFor(c.slug)} artwork{countFor(c.slug) === 1 ? "" : "s"} · order {c.sortOrder}
                </p>
              </div>
              <span className="text-[11px] text-neutral-400">
                {c.published ? "published" : "hidden"}
                {c.featured ? " · featured" : ""}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
