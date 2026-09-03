import Link from "next/link";
import { getAllWorks } from "@/lib/queries/works";
import { getAllCollections } from "@/lib/queries/collections";
import { getAllExhibitions } from "@/lib/queries/exhibitions";
import { getAllTimelineEntries } from "@/lib/queries/timeline";
import { getInquiryStats } from "@/lib/queries/inquiries";
import { formatRelative } from "@/lib/utils";
import { INQUIRY_TYPE_LABELS } from "@/lib/types";
import { PageHeader, Card, StatusPill } from "@/components/admin/ui";

export default async function AdminDashboard() {
  const [works, collections, exhibitions, timeline, inq] = await Promise.all([
    getAllWorks(),
    getAllCollections(),
    getAllExhibitions(),
    getAllTimelineEntries(),
    getInquiryStats(),
  ]);

  const stats = [
    { label: "Works", value: works.length, sub: `${works.filter((w) => w.status === "published").length} published`, href: "/admin/works" },
    { label: "Collections", value: collections.length, sub: `${collections.filter((c) => c.published).length} published`, href: "/admin/collections" },
    { label: "Exhibitions", value: exhibitions.length, sub: "chronological", href: "/admin/exhibitions" },
    { label: "Timeline entries", value: timeline.length, sub: "1995 – 2017", href: "/admin/timeline" },
    { label: "Unread enquiries", value: inq.unread, sub: `${inq.total} total`, href: "/admin/inquiries" },
  ];

  const quick = [
    { label: "New work", href: "/admin/works/new" },
    { label: "New exhibition", href: "/admin/exhibitions/new" },
    { label: "New timeline entry", href: "/admin/timeline/new" },
    { label: "Upload media", href: "/admin/media" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Everything on the public site is managed from here."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
              {s.label}
            </p>
            <p className="mt-1 font-serif text-3xl text-neutral-900">{s.value}</p>
            <p className="mt-0.5 text-[12px] text-neutral-500">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Recent enquiries">
          {inq.recent.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-neutral-400">
              No enquiries yet.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {inq.recent.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-4 py-2.5">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/inquiries/${i.id}`}
                      className="block truncate text-[13px] font-medium text-neutral-900 hover:underline"
                    >
                      {i.name}
                      {i.workTitle ? ` — ${i.workTitle}` : ""}
                    </Link>
                    <p className="truncate text-[11px] text-neutral-400">
                      {INQUIRY_TYPE_LABELS[i.type]} · {formatRelative(i.createdAt)}
                    </p>
                  </div>
                  <StatusPill status={i.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Quick actions">
          <div className="flex flex-col gap-2">
            {quick.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="rounded-md border border-neutral-200 px-3 py-2 text-[13px] text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900"
              >
                + {q.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
