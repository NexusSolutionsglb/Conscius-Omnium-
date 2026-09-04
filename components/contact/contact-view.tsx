"use client";

import type { ContactContent, Profile, SiteSettings } from "@/lib/types";
import { whatsappGeneralMessage, whatsappLink } from "@/lib/whatsapp";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/primitives";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { WhatsAppLink } from "@/components/site/whatsapp-button";
import { EditableText } from "@/components/editor/editable-text";
import { EditableHeading } from "@/components/editor/editable-heading";
import { RepeatableList } from "@/components/editor/repeatable-list";
import {
  useEditable,
  useEditableProfile,
  useEditableSettings,
} from "@/components/editor/use-editable";
import { newSocial } from "@/lib/editor/new-entities";

export function ContactView({
  profile: baseProfile,
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
    emailLabel: useEditable("contact", "emailLabel", serverContent.emailLabel),
    phoneLabel: useEditable("contact", "phoneLabel", serverContent.phoneLabel),
    whatsappRowLabel: useEditable("contact", "whatsappRowLabel", serverContent.whatsappRowLabel),
    locationLabel: useEditable("contact", "locationLabel", serverContent.locationLabel),
    messageStudio: useEditable("contact", "messageStudio", serverContent.messageStudio),
  };
  const contactCopy = useEditableSettings("contactCopy", settings.contactCopy);
  const profile: Profile = {
    ...baseProfile,
    email: useEditableProfile("email", baseProfile.email),
    phone: useEditableProfile("phone", baseProfile.phone),
    location: useEditableProfile("location", baseProfile.location),
    social: useEditableProfile("social", baseProfile.social),
    whatsapp: useEditableProfile("whatsapp", baseProfile.whatsapp),
  };

  const waHref = whatsappLink(whatsappGeneralMessage(settings.brand), profile.whatsapp);

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
          <Detail label={<EditableText bind="contact.emailLabel">{content.emailLabel}</EditableText>}>
            <a
              href={`mailto:${profile.email}`}
              className="mt-1 inline-block text-[0.95rem] text-ink transition-colors hover:text-accent-deep"
            >
              <EditableText bind="@profile.email">{profile.email}</EditableText>
            </a>
          </Detail>

          <Detail label={<EditableText bind="contact.phoneLabel">{content.phoneLabel}</EditableText>}>
            <a
              href={`tel:${profile.phone.replace(/\s/g, "")}`}
              className="mt-1 inline-block text-[0.95rem] text-ink transition-colors hover:text-accent-deep"
            >
              <EditableText bind="@profile.phone">{profile.phone}</EditableText>
            </a>
          </Detail>

          <Detail
            label={
              <EditableText bind="contact.whatsappRowLabel">{content.whatsappRowLabel}</EditableText>
            }
          >
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-[0.95rem] text-ink transition-colors hover:text-accent-deep"
            >
              <EditableText bind="contact.messageStudio">{content.messageStudio}</EditableText>
            </a>
          </Detail>

          <RepeatableList
            slug="contact"
            path="social"
            items={profile.social}
            makeItem={newSocial}
            addLabel="Add social link"
            addClassName="py-1"
            listBind="@profile.social"
            kind="social"
            itemLabel={(s) => s.label || "Social link"}
          >
            {(s, i) => (
              <Detail label={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-[0.95rem] text-ink transition-colors hover:text-accent-deep"
                >
                  <EditableText bind={`@profile.social.${i}.label`}>{s.label}</EditableText>
                </a>
              </Detail>
            )}
          </RepeatableList>

          <Detail
            label={<EditableText bind="contact.locationLabel">{content.locationLabel}</EditableText>}
          >
            <p className="mt-1 text-[0.95rem] text-ink-soft">
              <EditableText bind="@profile.location">{profile.location}</EditableText>
            </p>
          </Detail>
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

function Detail({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="u-eyebrow">{label}</p>
      {children}
    </div>
  );
}
