import { notFound } from "next/navigation";
import { getActiveSubscribers, getCampaign } from "@/lib/queries/newsletter";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/ui";
import { CampaignEditor } from "@/components/admin/campaign-editor";

export const dynamic = "force-dynamic";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [campaign, recipients] = await Promise.all([getCampaign(id), getActiveSubscribers()]);
  if (!campaign) notFound();

  return (
    <>
      <PageHeader
        title={campaign.subject}
        description={
          campaign.status === "sent"
            ? `Sent ${campaign.sentAt ? formatDate(campaign.sentAt) : ""} to ${campaign.sentCount} subscriber${campaign.sentCount === 1 ? "" : "s"}${campaign.failedCount ? `, ${campaign.failedCount} failed` : ""}.`
            : "Draft — nothing has been sent yet."
        }
        back={{ href: "/admin/newsletter", label: "Newsletter" }}
      />
      <CampaignEditor campaign={campaign} activeCount={recipients.length} />
    </>
  );
}
