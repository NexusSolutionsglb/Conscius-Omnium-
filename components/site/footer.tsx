"use client";

import Image from "next/image";
import Link from "next/link";
import type { Profile, SiteSettings } from "@/lib/types";
import { whatsappGeneralMessage, whatsappLink } from "@/lib/whatsapp";
import { contactEmails } from "@/lib/contact-emails";
import { Reveal } from "@/components/motion/reveal";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { EditableText } from "@/components/editor/editable-text";
import { EditableImage } from "@/components/editor/editable-image";
import { RepeatableList } from "@/components/editor/repeatable-list";
import {
  useEditableProfile,
  useEditableSettings,
  useEditorMode,
} from "@/components/editor/use-editable";
import {
  FOOTER_COPYRIGHT_DEFAULT,
  FOOTER_CREDIT_DEFAULT,
  FOOTER_LEGAL_DEFAULT,
  FOOTER_LEGAL_LINKS,
  FOOTER_OWNER_DEFAULT,
} from "@/lib/content/defaults/footer";
import { newSocial } from "@/lib/editor/new-entities";

export function Footer({
  settings: base,
  profile: baseProfile,
}: {
  settings: SiteSettings;
  profile: Profile;
}) {
  const editing = useEditorMode() === "edit";
  const settings: SiteSettings = {
    ...base,
    nav: useEditableSettings("nav", base.nav),
    brand: useEditableSettings("brand", base.brand),
    brandLine: useEditableSettings("brandLine", base.brandLine),
    footerNote: useEditableSettings("footerNote", base.footerNote),
    footerLegal: useEditableSettings("footerLegal", base.footerLegal ?? FOOTER_LEGAL_DEFAULT),
    footerOwner: useEditableSettings("footerOwner", base.footerOwner ?? FOOTER_OWNER_DEFAULT),
    footerCopyright: useEditableSettings(
      "footerCopyright",
      base.footerCopyright ?? FOOTER_COPYRIGHT_DEFAULT,
    ),
    footerCredit: useEditableSettings("footerCredit", base.footerCredit ?? FOOTER_CREDIT_DEFAULT),
    logo: useEditableSettings("logo", base.logo),
  };
  const profile: Profile = {
    ...baseProfile,
    name: useEditableProfile("name", baseProfile.name),
    roles: useEditableProfile("roles", baseProfile.roles),
    infoEmail: useEditableProfile("infoEmail", baseProfile.infoEmail),
    location: useEditableProfile("location", baseProfile.location),
    social: useEditableProfile("social", baseProfile.social),
    whatsapp: useEditableProfile("whatsapp", baseProfile.whatsapp),
  };
  const emails = contactEmails(profile);
  const year = new Date().getFullYear();
  const wa = whatsappLink(whatsappGeneralMessage(settings.brand), profile.whatsapp);

  const rolesText = profile.roles.slice(0, 3).join(" · ");
  const copyrightTpl = settings.footerCopyright || FOOTER_COPYRIGHT_DEFAULT;
  const creditTpl = settings.footerCredit || FOOTER_CREDIT_DEFAULT;
  // Edit mode shows the raw template (with {tokens}); everywhere else it's
  // substituted — so a click-to-edit commit never bakes the live values in.
  const copyright = editing
    ? copyrightTpl
    : copyrightTpl.replace(/\{year\}/g, String(year)).replace(/\{brand\}/g, settings.brand);
  const credit = editing
    ? creditTpl
    : creditTpl.replace(/\{name\}/g, profile.name).replace(/\{roles\}/g, rolesText);

  return (
    <footer className="u-no-print border-t border-line bg-paper">
      <div className="u-container py-16 md:py-20">
        <Reveal className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <EditableImage bind="@settings.logo" folder="branding">
              {settings.logo ? (
                <Image
                  src={settings.logo}
                  alt={settings.brand}
                  width={1600}
                  height={381}
                  className="h-7 w-auto object-contain"
                />
              ) : (
                <p className="font-display text-sm uppercase tracking-[0.24em] text-ink">
                  {settings.brand}
                </p>
              )}
            </EditableImage>
            <p className="u-eyebrow mt-2">{settings.brandLine}</p>
            <p className="mt-5 max-w-xs text-[0.82rem] leading-relaxed text-ink-mute">
              <EditableText bind="@settings.footerNote" multiline>
                {settings.footerNote}
              </EditableText>
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2.5">
            <p className="u-eyebrow mb-1.5 text-ink-faint">Index</p>
            {settings.nav.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="u-tap w-fit text-[0.82rem] text-ink-soft transition-colors hover:text-ink"
              >
                <EditableText bind={`@settings.nav.${i}.label`}>{item.label}</EditableText>
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2.5">
            <p className="u-eyebrow mb-1.5 text-ink-faint">Contact</p>
            <a
              href={`mailto:${emails.info}`}
              className="u-tap w-fit text-[0.82rem] text-ink-soft transition-colors hover:text-ink"
            >
              <EditableText bind="@profile.infoEmail">{emails.info}</EditableText>
            </a>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="u-tap w-fit text-[0.82rem] text-ink-soft transition-colors hover:text-ink"
            >
              Message the studio
            </a>
            <RepeatableList
              slug="about"
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
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="u-tap w-fit text-[0.82rem] text-ink-soft transition-colors hover:text-ink"
                >
                  <EditableText bind={`@profile.social.${i}.label`}>{s.label}</EditableText>
                </a>
              )}
            </RepeatableList>
            <p className="mt-1 text-[0.82rem] text-ink-mute">
              <EditableText bind="@profile.location">{profile.location}</EditableText>
            </p>
          </div>
        </Reveal>

        {/* The studio letter — general correspondence, so it sends as info@. */}
        <Reveal className="mt-14 border-t border-line pt-10 md:grid md:grid-cols-[1.4fr_1fr_1fr] md:gap-12">
          <div className="md:col-span-1">
            <p className="font-display text-[1.05rem] font-light leading-snug text-ink">
              Notes from the studio.
            </p>
            <p className="mt-2 max-w-xs text-[0.8rem] leading-relaxed text-ink-mute">
              New paintings, exhibitions and the occasional note on process — sent
              only when there is something worth sending.
            </p>
          </div>
          <div className="mt-6 md:col-span-2 md:mt-0 md:max-w-sm">
            <NewsletterForm source="footer" compact />
            <p className="mt-3 text-[0.68rem] leading-relaxed text-ink-mute">
              Unsubscribe any time — see the{" "}
              <Link href="/privacy" className="u-link">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </Reveal>

        <div className="mt-14 flex flex-col gap-y-5 border-t border-line pt-6 text-[0.72rem] text-ink-mute md:flex-row md:items-center md:justify-between md:gap-x-8">
          {/* Left: copyright + legal links */}
          <div className="flex flex-col gap-y-2 md:flex-row md:items-center md:gap-x-8">
            <p>
              <EditableText bind="@settings.footerCopyright">{copyright}</EditableText>
            </p>
            <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-6 gap-y-1">
              {FOOTER_LEGAL_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="u-tap transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Developed by Nexus Solutions */}
          <a
            href="https://nexusolutions.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex shrink-0 items-center gap-4 rounded-xl border-2 border-line-strong bg-white px-5 py-3 shadow-sm transition-all duration-200 hover:border-ink/30 hover:shadow-md"
          >
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-soft">
              Developed by
            </span>
            <div className="h-6 w-px bg-line-strong" />
            <Image
              src="/nexus-logo-horizontal.png"
              alt="Nexus Solutions"
              width={1166}
              height={300}
              className="h-10 w-auto object-contain transition-opacity group-hover:opacity-90"
              unoptimized
            />
          </a>
        </div>

        {(settings.footerLegal || settings.footerOwner || editing) && (
          <div className="mt-8 border-t border-line/60 pt-6 text-center">
            {(settings.footerLegal || editing) && (
              <p className="mx-auto max-w-3xl text-[0.72rem] leading-relaxed text-ink-mute">
                <EditableText bind="@settings.footerLegal" multiline>
                  {settings.footerLegal ?? ""}
                </EditableText>
              </p>
            )}
            {(settings.footerOwner || editing) && (
              <p className="mt-2 text-[0.72rem] font-bold tracking-[0.1em] text-ink">
                <EditableText bind="@settings.footerOwner">
                  {settings.footerOwner ?? ""}
                </EditableText>
              </p>
            )}
          </div>
        )}

      </div>
    </footer>
  );
}
