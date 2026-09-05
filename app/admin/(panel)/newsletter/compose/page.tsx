import { getActiveSubscribers } from "@/lib/queries/newsletter";
import { PageHeader } from "@/components/admin/ui";
import { CampaignEditor } from "@/components/admin/campaign-editor";

export const dynamic = "force-dynamic";

export default async function ComposePage() {
  const recipients = await getActiveSubscribers();
  return (
    <>
      <PageHeader
        title="Write an issue"
        description="Composed with the reusable Conscius Omnium letter template — the same frame every campaign uses."
        back={{ href: "/admin/newsletter", label: "Newsletter" }}
      />
      <CampaignEditor activeCount={recipients.length} />
    </>
  );
}
