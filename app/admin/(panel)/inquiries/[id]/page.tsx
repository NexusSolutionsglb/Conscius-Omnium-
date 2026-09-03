import { notFound } from "next/navigation";
import { getInquiry } from "@/lib/queries/inquiries";
import { PageHeader } from "@/components/admin/ui";
import { InquiryDetail } from "@/components/admin/inquiry-detail";

export default async function InquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await getInquiry(id);
  if (!inquiry) notFound();
  return (
    <>
      <PageHeader
        title={inquiry.name}
        description={inquiry.email}
        back={{ href: "/admin/inquiries", label: "Enquiries" }}
      />
      <InquiryDetail inquiry={inquiry} />
    </>
  );
}
