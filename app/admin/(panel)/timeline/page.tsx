import Link from "next/link";
import { getAllTimelineEntries } from "@/lib/queries/timeline";
import { PageHeader, EmptyState } from "@/components/admin/ui";

export default async function TimelineListPage() {
  const entries = await getAllTimelineEntries();
  return (
    <>
      <PageHeader
        title="Timeline"
        description="“His story” — the visual autobiography on /about and the home page."
        action={
          <Link href="/admin/timeline/new" className="rounded-md bg-neutral-900 px-4 py-2 text-[12.5px] font-medium text-white hover:bg-neutral-700">
            + New entry
          </Link>
        }
      />
      {entries.length === 0 ? (
        <EmptyState title="No timeline entries yet" />
      ) : (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {entries.map((e) => (
            <Link key={e.id} href={`/admin/timeline/${e.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50">
              <div>
                <p className="text-[13.5px] font-medium text-neutral-900">
                  <span className="font-serif text-neutral-400">{e.year}</span> &nbsp; {e.title}
                </p>
                <p className="line-clamp-1 max-w-lg text-[11px] text-neutral-400">{e.description}</p>
              </div>
              <span className="text-[11px] text-neutral-400">
                order {e.sortOrder}
                {!e.published && " · hidden"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
