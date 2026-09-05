import Link from "next/link";
import { getProfile } from "@/lib/queries/profile";
import { contactEmails } from "@/lib/contact-emails";
import { INQUIRY_ROUTING, PURPOSE_LABELS, NEWSLETTER_PURPOSE } from "@/lib/email/routing";
import { INQUIRY_TYPE_LABELS, type InquiryType } from "@/lib/types";
import { isEmailConfigured, env } from "@/lib/env";
import { PageHeader, Card } from "@/components/admin/ui";
import { EmailTester } from "@/components/admin/email-tester";

export const dynamic = "force-dynamic";

const OVERRIDE = process.env.INQUIRY_NOTIFY_EMAIL?.trim() ?? "";

export default async function EmailsPage() {
  const profile = await getProfile();
  const emails = contactEmails(profile);
  const types = Object.keys(INQUIRY_TYPE_LABELS) as InquiryType[];

  const grouped = (["enquiry", "info", "studio"] as const).map((purpose) => ({
    purpose,
    address: emails[purpose],
    label: PURPOSE_LABELS[purpose],
    types: types.filter((t) => INQUIRY_ROUTING[t] === purpose),
  }));

  return (
    <>
      <PageHeader
        title="Email routing"
        description="Where each form on the site delivers, and who receives what. Addresses are edited on the Artist profile page."
      />

      {!isEmailConfigured && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-[13px] text-amber-900">
          <p className="font-medium">Email sending is switched off.</p>
          <p className="mt-1 text-amber-800">
            Set <code className="rounded bg-amber-100 px-1">RESEND_API_KEY</code> (and a
            verified <code className="rounded bg-amber-100 px-1">RESEND_FROM</code> address)
            to start delivering. Enquiries are still saved to the inbox meanwhile.
          </p>
        </div>
      )}

      {OVERRIDE && (
        <div className="mb-6 rounded-xl border border-line bg-paper-dim px-5 py-4 text-[13px] text-ink-soft">
          <p className="font-medium text-ink">All enquiries are being sent to one inbox.</p>
          <p className="mt-1">
            <code className="rounded bg-paper px-1">INQUIRY_NOTIFY_EMAIL</code> is set to{" "}
            <strong>{OVERRIDE}</strong>, which overrides the routing below. Unset it to use
            the three studio addresses.
          </p>
        </div>
      )}

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {grouped.map((group) => (
          <Card key={group.purpose} title={group.label}>
            <p className="font-display text-[1.05rem] text-ink">{group.address}</p>
            <ul className="mt-3 space-y-1.5">
              {group.types.map((t) => (
                <li key={t} className="text-[12.5px] text-ink-soft">
                  · {INQUIRY_TYPE_LABELS[t]}
                </li>
              ))}
              {group.purpose === NEWSLETTER_PURPOSE && (
                <li className="text-[12.5px] text-ink-soft">· Newsletter (sender &amp; replies)</li>
              )}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mb-6">
        <Card title="What the site sends">
          <ul className="space-y-3 text-[13px] text-ink-soft">
            <Row
              name="Internal enquiry notification"
              to="The routed studio address above"
              detail="Name, email, phone, enquiry type, artwork, country, budget, preferred contact, date and time, the form it came from, and the full message. Reply-to is set to the visitor."
            />
            <Row
              name="Visitor confirmation"
              to="The visitor"
              detail="A branded thank-you with their reference, what happens next, and a copy of what they sent. Reply-to is the routed studio address."
            />
            <Row
              name="Newsletter welcome"
              to="The new subscriber"
              detail="Sent once, on a genuine new or restored subscription. Carries an unsubscribe link."
            />
            <Row
              name="Newsletter issue"
              to="Every active subscriber"
              detail="Composed in Newsletter → Write an issue, from the reusable letter template."
            />
          </ul>
          <p className="mt-5 border-t border-line pt-4 text-[12px] text-ink-mute">
            Everything is sent from <strong className="text-ink-soft">{env.resendFrom}</strong>{" "}
            via Resend. To change the addresses themselves, edit them on the{" "}
            <Link href="/admin/profile" className="underline hover:text-ink">
              Artist profile
            </Link>{" "}
            page.
          </p>
        </Card>
      </div>

      <Card title="Send a test">
        <EmailTester />
      </Card>
    </>
  );
}

function Row({ name, to, detail }: { name: string; to: string; detail: string }) {
  return (
    <li className="border-b border-line pb-3 last:border-0 last:pb-0">
      <p className="font-medium text-ink">
        {name} <span className="font-normal text-ink-mute">→ {to}</span>
      </p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-mute">{detail}</p>
    </li>
  );
}
