import { notFound } from "next/navigation";
import { getAllTimelineEntries } from "@/lib/queries/timeline";
import { PageHeader } from "@/components/admin/ui";
import { TimelineForm } from "@/components/admin/timeline-form";

export default async function EditTimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = (await getAllTimelineEntries()).find((e) => e.id === id);
  if (!entry) notFound();
  return (
    <>
      <PageHeader title={`${entry.year} — ${entry.title}`} back={{ href: "/admin/timeline", label: "Timeline" }} />
      <TimelineForm entry={entry} />
    </>
  );
}
