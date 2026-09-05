import type { Metadata } from "next";
import { getProfile } from "@/lib/queries/profile";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/site/json-ld";
import { contactEmails } from "@/lib/contact-emails";
import { LegalPage } from "@/components/site/legal-page";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How Conscius Omnium™ — the studio of Shivjeet Potdar — collects, uses, stores and protects the information you share through this website and its enquiry form.",
  path: "/privacy",
});

export default async function PrivacyPage() {
  const profile = await getProfile();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy" },
        ])}
      />
      <LegalPage
        eyebrow="Privacy Policy"
        title="Privacy Policy"
        intro="Conscius Omnium™ is a small studio, not a data business. This page sets out exactly what this website collects, why it collects it, where it is kept, and how to have it removed."
        contactEmail={contactEmails(profile).info}
        contactLocation={profile.location}
        sections={[
          {
            id: "who-this-covers",
            heading: "Who this policy covers",
            body: (
              <>
                <p>
                  This policy applies to this website and to enquiries sent
                  through it. The site is operated by {profile.name}, working as
                  Conscius Omnium™, from {profile.location}.
                </p>
                <p>
                  For the purposes of applicable data-protection law — including
                  India&rsquo;s Digital Personal Data Protection Act, 2023, and
                  the GDPR where it applies to visitors in the EU or EEA — the
                  studio is the data fiduciary and controller for the information
                  described below.
                </p>
              </>
            ),
          },
          {
            id: "what-is-collected",
            heading: "What this site collects",
            body: (
              <>
                <p>
                  There are no visitor accounts, no newsletter and no advertising
                  on this site. The only information you actively give it is what
                  you type into the enquiry form:
                </p>
                <ul>
                  <li>Your name and email address — required, so that a reply can reach you.</li>
                  <li>Your phone or WhatsApp number and country, if you choose to add them.</li>
                  <li>The type of enquiry, your message, and an optional budget range.</li>
                  <li>Your preferred method of reply, if you state one.</li>
                  <li>
                    The title of the work you were viewing, when an enquiry is
                    started from a specific piece.
                  </li>
                </ul>
                <p>
                  Technical information is handled minimally. Your IP address is
                  read at the moment of submission only to rate-limit the form
                  against spam; it is held briefly in server memory and is never
                  written into the enquiry record. Standard hosting logs are kept
                  by the site&rsquo;s infrastructure providers under their own
                  retention policies.
                </p>
              </>
            ),
          },
          {
            id: "why-it-is-collected",
            heading: "Why it is collected",
            body: (
              <>
                <p>
                  Enquiry details are used for one purpose: to read, answer and
                  keep track of your enquiry, and to discuss a possible
                  commission, sale, exhibition, collaboration or press request.
                </p>
                <p>
                  The lawful basis is your own request — you send the enquiry, so
                  the studio may reply to it and take steps at your request before
                  any agreement. There is no marketing list, no profiling and no
                  automated decision-making.
                </p>
              </>
            ),
          },
          {
            id: "where-it-is-kept",
            heading: "Where the information is kept",
            body: (
              <>
                <p>
                  Enquiries are stored in the studio&rsquo;s hosted database
                  (Supabase) and delivered by email to the studio inbox through a
                  transactional email provider (Resend). A confirmation copy is
                  sent to the address you supplied. Both providers act as
                  processors on the studio&rsquo;s behalf and are bound by their
                  own security and data-processing terms.
                </p>
                <p>
                  If you continue a conversation on WhatsApp using the links on
                  this site, that conversation takes place inside WhatsApp and is
                  governed by WhatsApp&rsquo;s own privacy policy. This site never
                  receives your WhatsApp messages.
                </p>
                <p>
                  Enquiry records are kept only as long as they remain useful to
                  the working relationship, and are deleted on request.
                </p>
              </>
            ),
          },
          {
            id: "cookies-and-analytics",
            heading: "Cookies and analytics",
            body: (
              <>
                <p>
                  The public pages of this site set no advertising or tracking
                  cookies. A single browser-session flag is stored on your own
                  device so the opening animation does not replay on every page;
                  it contains no personal information, is never sent to a server,
                  and disappears when you close the tab. The private admin area
                  uses a strictly necessary sign-in cookie for the studio&rsquo;s
                  own login.
                </p>
                <p>
                  Audience measurement is optional and is off unless the studio
                  has enabled it. Where enabled, it runs either as cookieless,
                  aggregate analytics or with IP anonymisation turned on, and is
                  used only to understand which work people look at.
                </p>
              </>
            ),
          },
          {
            id: "sharing",
            heading: "Sharing",
            body: (
              <p>
                Your details are never sold, rented or traded. They are shared
                only with the service providers named above, who process them
                solely to run the site and deliver its email, and with anyone the
                law obliges the studio to disclose them to.
              </p>
            ),
          },
          {
            id: "your-rights",
            heading: "Your rights",
            body: (
              <>
                <p>
                  You may ask the studio at any time to show you what it holds
                  about you, to correct it, or to erase it. You may also withdraw
                  an enquiry and ask that the record be deleted.
                </p>
                <p>
                  Write to the address below and the studio will respond within a
                  reasonable period. If you believe a request has not been handled
                  properly, you may raise it with the data-protection authority in
                  your jurisdiction.
                </p>
              </>
            ),
          },
          {
            id: "security",
            heading: "Security",
            body: (
              <p>
                The site is served over HTTPS. Enquiry data is transmitted over
                encrypted connections and held in access-controlled storage, and
                the admin area is protected by authenticated sign-in. No system is
                perfect, but the studio deliberately keeps the amount of
                information it holds very small — the strongest protection
                available to a practice this size.
              </p>
            ),
          },
          {
            id: "changes",
            heading: "Changes to this policy",
            body: (
              <p>
                If the way this site handles information changes, this page is
                updated and the date at the top of it changes with it. Material
                changes will be described here rather than made silently.
              </p>
            ),
          },
        ]}
      />
    </>
  );
}
