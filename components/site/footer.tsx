"use client";

import Link from "next/link";
import type { Profile, SiteSettings } from "@/lib/types";
import { whatsappGeneralMessage, whatsappLink } from "@/lib/whatsapp";
import { Reveal } from "@/components/motion/reveal";
import { EditableText } from "@/components/editor/editable-text";
import {
  useEditableProfile,
  useEditableSettings,
  useEditorMode,
} from "@/components/editor/use-editable";
import { FOOTER_LEGAL_DEFAULT, FOOTER_OWNER_DEFAULT } from "@/lib/content/defaults/footer";

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
  };
  const profile: Profile = {
    ...baseProfile,
    name: useEditableProfile("name", baseProfile.name),
    roles: useEditableProfile("roles", baseProfile.roles),
    email: useEditableProfile("email", baseProfile.email),
    location: useEditableProfile("location", baseProfile.location),
    social: useEditableProfile("social", baseProfile.social),
    whatsapp: useEditableProfile("whatsapp", baseProfile.whatsapp),
  };
  const year = new Date().getFullYear();
  const wa = whatsappLink(whatsappGeneralMessage(settings.brand), profile.whatsapp);

  const contacts = [
    { label: "Email", href: `mailto:${profile.email}`, text: profile.email },
    { label: "WhatsApp", href: wa, text: "Message the studio" },
    ...profile.social.map((s) => ({ label: s.label, href: s.href, text: s.label })),
  ];

  return (
    <footer className="u-no-print border-t border-line bg-paper">
      <div className="u-container py-16 md:py-20">
        <Reveal className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.24em] text-ink">
              {settings.brand}
            </p>
            <p className="u-eyebrow mt-2">{settings.brandLine}</p>
            <p className="mt-5 max-w-xs text-[0.82rem] leading-relaxed text-ink-mute">
              {settings.footerNote}
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2.5">
            <p className="u-eyebrow mb-1.5 text-ink-faint">Index</p>
            {settings.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="w-fit text-[0.82rem] text-ink-soft transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2.5">
            <p className="u-eyebrow mb-1.5 text-ink-faint">Contact</p>
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                className="w-fit text-[0.82rem] text-ink-soft transition-colors hover:text-ink"
              >
                {c.text}
              </a>
            ))}
            <p className="mt-1 text-[0.82rem] text-ink-mute">{profile.location}</p>
          </div>
        </Reveal>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-[0.7rem] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.brand}. All rights reserved.
          </p>
          <p className="uppercase tracking-[0.2em]">
            {profile.name} — {profile.roles.slice(0, 3).join(" · ")}
          </p>
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
