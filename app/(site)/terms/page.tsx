import type { Metadata } from "next";
import Link from "next/link";
import { getProfile } from "@/lib/queries/profile";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/site/json-ld";
import { LegalPage } from "@/components/site/legal-page";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "Terms & Conditions",
  description:
    "The terms on which Conscious Omnium — the studio of Shivjeet Potdar — makes this website and its contents available, including copyright, permitted use and how enquiries are treated.",
  path: "/terms",
});

export default async function TermsPage() {
  const profile = await getProfile();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Terms & Conditions", path: "/terms" },
        ])}
      />
      <LegalPage
        eyebrow="Terms & Conditions"
        title="Terms & Conditions"
        intro="This website is a catalogue of the studio's work. These terms set out how it may be used, who owns what appears on it, and what an enquiry does and does not commit either side to."
        contactEmail={profile.email}
        contactLocation={profile.location}
        sections={[
          {
            id: "these-terms",
            heading: "These terms",
            body: (
              <>
                <p>
                  This website is operated by {profile.name}, working as Conscious
                  Omnium, from {profile.location}. By browsing it you accept the
                  terms on this page. If you do not accept them, please do not use
                  the site.
                </p>
                <p>
                  The terms may be revised from time to time. The version
                  published here, dated above, is the one that applies to your
                  visit.
                </p>
              </>
            ),
          },
          {
            id: "ownership",
            heading: "Ownership of the work",
            body: (
              <>
                <p>
                  Every image, drawing, model, render, photograph, film still,
                  title, description and piece of written material on this site is
                  the original work of {profile.name} and remains his property. It
                  is protected by copyright and by the moral rights of the author
                  under the Copyright Act, 1957, and equivalent law elsewhere.
                </p>
                <p>
                  Where a project was made with collaborators, clients or
                  production houses, credits are given on the relevant page. Those
                  third-party rights remain with their owners.
                </p>
              </>
            ),
          },
          {
            id: "permitted-use",
            heading: "What you may and may not do",
            body: (
              <>
                <p>You are welcome to:</p>
                <ul>
                  <li>Browse, read and share links to any page on this site.</li>
                  <li>
                    Quote a short passage or reproduce a single image for review,
                    press, criticism or academic study, with a clear credit to{" "}
                    {profile.name} and a link back to this site.
                  </li>
                </ul>
                <p>Without prior written permission from the studio, you may not:</p>
                <ul>
                  <li>
                    Reproduce, republish, print, sell or redistribute the work in
                    any medium, commercially or otherwise.
                  </li>
                  <li>
                    Adapt, crop, retouch, remix or create derivative work from it.
                  </li>
                  <li>
                    Use it to train, fine-tune or evaluate machine-learning or
                    generative systems, or scrape it in bulk by any automated
                    means.
                  </li>
                  <li>
                    Remove or obscure any credit, watermark or copyright notice.
                  </li>
                </ul>
                <p>
                  Permission is often given for genuine editorial and academic use
                  — write to the studio and ask.
                </p>
              </>
            ),
          },
          {
            id: "enquiries",
            heading: "Enquiries, availability and price",
            body: (
              <>
                <p>
                  Details shown alongside a work — year, medium, dimensions,
                  availability and any price — are indicative and may change
                  without notice. Nothing on this site is an offer capable of
                  acceptance, and sending an enquiry does not reserve a work or
                  create a contract.
                </p>
                <p>
                  A sale, commission, exhibition loan or collaboration takes effect
                  only under a separate written agreement between you and the
                  studio, which will set out scope, schedule, fees, delivery and
                  the licence granted over the resulting work.
                </p>
                <p>
                  Please send accurate information in an enquiry, and do not use
                  the form for unsolicited marketing, bulk messaging or anything
                  unlawful.
                </p>
              </>
            ),
          },
          {
            id: "availability",
            heading: "Availability of the site",
            body: (
              <p>
                The site is provided as it stands. The studio aims to keep it
                accurate and online but does not guarantee that it will be
                uninterrupted, error-free, or that every detail is current at the
                moment you read it. To the extent permitted by law, the studio is
                not liable for loss arising from reliance on the contents of this
                site, or from its temporary unavailability.
              </p>
            ),
          },
          {
            id: "external-links",
            heading: "Links to other sites",
            body: (
              <p>
                This site links to third-party services and platforms — WhatsApp,
                and any social or press links listed in the footer. Those
                destinations are outside the studio&rsquo;s control, and their own
                terms and privacy policies apply once you leave this site.
              </p>
            ),
          },
          {
            id: "privacy",
            heading: "Privacy",
            body: (
              <p>
                Information you send through the enquiry form is handled as
                described in the{" "}
                <Link href="/privacy">Privacy Policy</Link>, which forms part of these
                terms.
              </p>
            ),
          },
          {
            id: "governing-law",
            heading: "Governing law",
            body: (
              <p>
                These terms are governed by the laws of India. Any dispute arising
                out of them, or out of the use of this site, is subject to the
                exclusive jurisdiction of the courts at Bengaluru, Karnataka.
              </p>
            ),
          },
        ]}
      />
    </>
  );
}
