import Link from "next/link";
import { getAllWorks } from "@/lib/queries/works";
import { DISCIPLINE_LABELS } from "@/lib/types";
import { PageHeader, EmptyState, StatusPill } from "@/components/admin/ui";
import { WorkRowActions } from "@/components/admin/work-row-actions";

export default async function WorksListPage() {
  const works = await getAllWorks();

  return (
    <>
      <PageHeader
        title="Works"
        description="Every piece across every discipline. Order here is the order on /work."
        action={
          <Link
            href="/admin/works/new"
            className="rounded-md bg-neutral-900 px-4 py-2 text-[12.5px] font-medium text-white hover:bg-neutral-700"
          >
            + New work
          </Link>
        }
      />

      {works.length === 0 ? (
        <EmptyState title="No works yet">
          <Link href="/admin/works/new" className="underline">
            Add the first one
          </Link>
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] uppercase tracking-[0.1em] text-neutral-400">
              <tr>
                <th className="px-4 py-2.5 font-medium">Title</th>
                <th className="px-3 py-2.5 font-medium">Discipline</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Feat.</th>
                <th className="px-3 py-2.5 font-medium">Order</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {works.map((w) => (
                <tr key={w.id} className="group hover:bg-neutral-50">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/admin/works/${w.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {w.title}
                    </Link>
                    <span className="ml-2 text-[11px] text-neutral-400">/{w.slug}</span>
                  </td>
                  <td className="px-3 py-2.5 text-neutral-500">
                    {DISCIPLINE_LABELS[w.discipline]}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusPill status={w.status} />
                  </td>
                  <td className="px-3 py-2.5 text-neutral-400">{w.featured ? "★" : "—"}</td>
                  <td className="px-3 py-2.5 text-neutral-400">{w.sortOrder}</td>
                  <td className="px-3 py-2.5 text-right">
                    <WorkRowActions id={w.id} slug={w.slug} status={w.status} featured={w.featured} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
