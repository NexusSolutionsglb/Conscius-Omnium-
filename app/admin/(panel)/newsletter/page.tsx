import Link from "next/link";
import { getCampaigns, getSubscriberStats, getSubscribers } from "@/lib/queries/newsletter";
import { formatDate } from "@/lib/utils";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { SubscriberAdd, SubscriberRow } from "@/components/admin/subscriber-row";
import { CampaignRowActions } from "@/components/admin/campaign-row-actions";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const [subscribers, stats, campaigns] = await Promise.all([
    getSubscribers(),
    getSubscriberStats(),
    getCampaigns(),
  ]);

  return (
    <>
      <PageHeader
        title="Newsletter"
        description="Everyone who signed up for the studio letter, and the issues sent to them."
        action={
          <Link
            href="/admin/newsletter/compose"
            className="inline-flex items-center rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-paper transition-colors hover:bg-accent-deep"
          >
            Write an issue
          </Link>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Stat label="Active" value={stats.active} accent />
        <Stat label="Unsubscribed" value={stats.unsubscribed} />
        <Stat label="Last 30 days" value={stats.last30} />
        <Stat label="Total ever" value={stats.total} />
      </div>

      <div className="mb-6">
        <Card title="Add a subscriber by hand">
          <SubscriberAdd />
        </Card>
      </div>

      <div className="mb-8">
        <Card title={`Subscribers (${subscribers.length})`} className="overflow-hidden">
          {subscribers.length === 0 ? (
            <EmptyState title="No subscribers yet">
              Sign-ups from the footer form land here. If the list stays empty
              after someone subscribes, check that migration 0005 has been applied.
            </EmptyState>
          ) : (
            <div className="-mx-5 -mb-5 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[13px]">
                <thead>
                  <tr className="border-y border-line text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    <th className="px-5 py-2.5 font-semibold">Email</th>
                    <th className="px-3 py-2.5 font-semibold">Name</th>
                    <th className="px-3 py-2.5 font-semibold">Source</th>
                    <th className="px-3 py-2.5 font-semibold">Joined</th>
                    <th className="px-3 py-2.5 font-semibold">Status</th>
                    <th className="px-5 py-2.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s) => (
                    <SubscriberRow key={s.id} subscriber={s} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Card title={`Issues (${campaigns.length})`}>
        {campaigns.length === 0 ? (
          <EmptyState title="No issues yet">
            Write one and send a test to yourself before it goes to the list.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {campaigns.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/newsletter/${c.id}`}
                    className="block truncate text-[13.5px] font-medium text-ink hover:underline"
                  >
                    {c.subject}
                  </Link>
                  <p className="mt-0.5 text-[11.5px] text-ink-mute">
                    {c.status === "sent"
                      ? `Sent ${c.sentAt ? formatDate(c.sentAt) : ""} · ${c.sentCount} delivered${
                          c.failedCount ? ` · ${c.failedCount} failed` : ""
                        }`
                      : `Draft · created ${formatDate(c.createdAt)}`}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    c.status === "sent"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {c.status}
                </span>
                <CampaignRowActions id={c.id} subject={c.subject} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-paper px-4 py-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-2xl font-normal ${accent ? "text-ink" : "text-ink-soft"}`}
      >
        {value}
      </p>
    </div>
  );
}
