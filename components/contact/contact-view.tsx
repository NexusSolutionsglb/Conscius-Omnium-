"use client";

import type { ContactContent, Profile, SiteSettings } from "@/lib/types";
import { whatsappGeneralMessage, whatsappLink } from "@/lib/whatsapp";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/primitives";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { WhatsAppLink } from "@/components/site/whatsapp-button";
import { EditableText } from "@/components/editor/editable-text";
import { EditableHeading } from "@/components/editor/editable-heading";
import { useEditable, useEditableSettings } from "@/components/editor/use-editable";

export function ContactView({
  profile,
  settings,
  serverContent,
}: {
  profile: Profile;
  settings: SiteSettings;
  serverContent: ContactContent;
}) {
  const content = {
    eyebrow: useEditable("contact", "eyebrow", serverContent.eyebrow),
    formEyebrow: useEditable("contact", "formEyebrow", serverContent.formEyebrow),
    whatsappLabel: useEditable("contact", "whatsappLabel", serverContent.whatsappLabel),
  };
  const contactCopy = useEditableSettings("contactCopy", settings.contactCopy);

  const waHref = whatsappLink(whatsappGeneralMessage(settings.brand), profile.whatsapp);

  const details = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
    { label: "WhatsApp", value: "Message the studio", href: waHref, external: true },
    ...profile.social.map((s) => ({
      label: s.label,
      value: s.label,
      href: s.href,
      external: true,
    })),
    { label: "Based in", value: profile.location, href: undefined },
  ];

  return (
    <div className="u-container grid gap-16 pb-24 pt-36 md:grid-cols-12 md:gap-10 md:pb-32 md:pt-44">
      <div className="md:col-span-5 md:pr-8">
        <Eyebrow>
          <EditableText bind="contact.eyebrow">{content.eyebrow}</EditableText>
        </Eyebrow>
        <EditableHeading
          bind="@settings.contactCopy.heading"
          className="mt-5 font-display text-[clamp(2.1rem,1.3rem+3.4vw,3.8rem)] font-light leading-[1.05]"
        >
          {contactCopy.heading}
        </EditableHeading>
        <Reveal delay={0.1} className="mt-6 max-w-md">
          <EditableText as="p" bind="@settings.contactCopy.supporting" multiline className="u-lead">
            {contactCopy.supporting}
          </EditableText>
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
          <WhatsAppLink href={waHref} label={content.whatsappLabel} />
        </Reveal>
      </div>

      <div className="md:col-span-7 md:border-l md:border-line md:pl-14">
        <Reveal>
          <p className="u-eyebrow mb-8">
            <EditableText bind="contact.formEyebrow">{content.formEyebrow}</EditableText>
          </p>
          <InquiryForm />
        </Reveal>
      </div>
    </div>
  );
}
