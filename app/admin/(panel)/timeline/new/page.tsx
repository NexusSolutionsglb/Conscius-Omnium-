import { PageHeader } from "@/components/admin/ui";
import { TimelineForm } from "@/components/admin/timeline-form";

export default function NewTimelinePage() {
  return (
    <>
      <PageHeader title="New timeline entry" back={{ href: "/admin/timeline", label: "Timeline" }} />
      <TimelineForm entry={null} />
    </>
  );
}
