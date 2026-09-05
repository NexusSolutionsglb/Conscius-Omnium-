import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getCampaign } from "@/lib/queries/newsletter";
import { newsletterCampaignEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Renders the saved draft exactly as a subscriber would receive it. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const { html } = newsletterCampaignEmail(campaign, { token: "preview" });
  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
