import Link from "next/link";
import { getAllCollections } from "@/lib/queries/collections";
import { PageHeader, EmptyState } from "@/components/admin/ui";

export default async function CollectionsListPage() {
  const collections = await getAllCollections();
  return (
    <>
      <PageHeader
        title="Collections"
        description="Series that group works on /gallery."
        action={
          <Link href="/admin/collections/new" className="rounded-md bg-neutral-900 px-4 py-2 text-[12.5px] font-medium text-white hover:bg-neutral-700">
            + New collection
          </Link>
        }
      />
      {collections.length === 0 ? (
        <EmptyState title="No collections yet" />
      ) : (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {collections.map((c) => (
            <Link key={c.id} href={`/admin/collections/${c.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50">
              <div>
                <p className="text-[13.5px] font-medium text-neutral-900">{c.title}</p>
                <p className="text-[11px] text-neutral-400">/{c.slug} · order {c.sortOrder}</p>
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
