import Link from "next/link";
import { getAllExhibitions } from "@/lib/queries/exhibitions";
import { PageHeader, EmptyState } from "@/components/admin/ui";

export default async function ExhibitionsListPage() {
  const items = await getAllExhibitions();
  return (
    <>
      <PageHeader
        title="Exhibitions"
        description="Public showings and installations, newest first."
        action={
          <Link href="/admin/exhibitions/new" className="rounded-md bg-neutral-900 px-4 py-2 text-[12.5px] font-medium text-white hover:bg-neutral-700">
            + New exhibition
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState title="No exhibitions yet" />
      ) : (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {items.map((e) => (
            <Link key={e.id} href={`/admin/exhibitions/${e.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50">
              <div>
                <p className="text-[13.5px] font-medium text-neutral-900">
                  <span className="text-neutral-400">{e.year}</span> &nbsp; {e.title}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {[e.venue, e.city, e.country].filter(Boolean).join(", ")}
                </p>
              </div>
              <span className="text-[11px] capitalize text-neutral-400">
                {e.type}
                {!e.published && " · hidden"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
