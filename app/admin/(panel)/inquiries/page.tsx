import Link from "next/link";
import { getInquiries } from "@/lib/queries/inquiries";
import { INQUIRY_TYPE_LABELS } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { PageHeader, EmptyState, StatusPill } from "@/components/admin/ui";

export default async function InquiriesPage() {
  const inquiries = await getInquiries();
  const counts = inquiries.reduce<Record<string, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Every message from the site. Artwork enquiries link back to the work."
      />

      <div className="mb-4 flex flex-wrap gap-2 text-[12px]">
        {[
          ["Total", inquiries.length],
          ["New", counts.new ?? 0],
          ["In progress", counts["in-progress"] ?? 0],
          ["Responded", counts.responded ?? 0],
          ["Closed", counts.closed ?? 0],
        ].map(([label, n]) => (
          <span key={label} className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-neutral-600">
            {label} <span className="font-semibold text-neutral-900">{n}</span>
          </span>
        ))}
      </div>

      {inquiries.length === 0 ? (
        <EmptyState title="No enquiries yet">
          They arrive here as visitors use the contact form and artwork enquiry
          buttons.
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] uppercase tracking-[0.1em] text-neutral-400">
              <tr>
                <th className="px-4 py-2.5 font-medium">From</th>
                <th className="px-3 py-2.5 font-medium">Subject</th>
                <th className="px-3 py-2.5 font-medium">Type</th>
                <th className="px-3 py-2.5 font-medium">Date</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {inquiries.map((i) => (
                <tr key={i.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/inquiries/${i.id}`} className="font-medium text-neutral-900 hover:underline">
                      {i.name}
                    </Link>
                    <p className="text-[11px] text-neutral-400">{i.email}</p>
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600">
                    {i.workTitle ? `“${i.workTitle}”` : <span className="text-neutral-400">General</span>}
                    <span className="ml-2 text-[10px] text-neutral-300">{i.ref}</span>
                  </td>
                  <td className="px-3 py-2.5 text-neutral-500">{INQUIRY_TYPE_LABELS[i.type]}</td>
                  <td className="px-3 py-2.5 text-neutral-400">{formatDate(i.createdAt)}</td>
                  <td className="px-3 py-2.5">
                    <StatusPill status={i.status} />
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
