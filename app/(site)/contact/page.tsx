import type { Metadata } from "next";
import { getProfile } from "@/lib/queries/profile";
import { getSettings } from "@/lib/queries/settings";
import { getPage } from "@/lib/queries/pages";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { whatsappGeneralMessage, whatsappLink } from "@/lib/whatsapp";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Eyebrow } from "@/components/ui/primitives";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { WhatsAppLink } from "@/components/site/whatsapp-button";
import { JsonLd } from "@/components/site/json-ld";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("contact");
  return buildMetadata({
    title: "Contact",
    description: page.seo?.description ?? page.intro ?? undefined,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const [profile, settings] = await Promise.all([getProfile(), getSettings()]);

  const waHref = whatsappLink(
    whatsappGeneralMessage(settings.brand),
    profile.whatsapp,
  );

  const details = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
    { label: "WhatsApp", value: "Message the studio", href: waHref, external: true },
    ...profile.social.map((s) => ({ label: s.label, value: s.label, href: s.href, external: true })),
    { label: "Based in", value: profile.location, href: undefined },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <div className="u-container grid gap-16 pb-24 pt-36 md:grid-cols-12 md:gap-10 md:pb-32 md:pt-44">
        {/* Left — info */}
        <div className="md:col-span-5 md:pr-8">
          <Eyebrow>Contact</Eyebrow>
          <TextReveal
            as="h1"
            text={settings.contactCopy.heading}
            className="mt-5 font-display text-[clamp(2.1rem,1.3rem+3.4vw,3.8rem)] font-light leading-[1.05]"
          />
          <Reveal delay={0.1} className="mt-6 max-w-md">
            <p className="u-lead">{settings.contactCopy.supporting}</p>
          </Reveal>

          <Reveal delay={0.15} className="mt-12 flex flex-col gap-6">
            {details.map((d) => (
              <div key={d.label}>
                <p className="u-eyebrow">{d.label}</p>
                {d.href ? (
                  <a
                    href={d.href}
                    target={d.external ? "_blank" : undefined}
                    rel={d.external ? "noreferrer" : undefined}
                    className="mt-1 inline-block text-[0.95rem] text-ink transition-colors hover:text-accent-deep"
                  >
                    {d.value}
                  </a>
                ) : (
                  <p className="mt-1 text-[0.95rem] text-ink-soft">{d.value}</p>
                )}
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.2} className="mt-10">
            <WhatsAppLink href={waHref} label="Chat on WhatsApp" />
          </Reveal>
        </div>

        {/* Right — form */}
        <div className="md:col-span-7 md:border-l md:border-line md:pl-14">
          <Reveal>
            <p className="u-eyebrow mb-8">Send an enquiry</p>
            <InquiryForm />
          </Reveal>
        </div>
      </div>
    </>
  );
}
