"use client";

import Link from "next/link";
import type { Profile, SiteSettings } from "@/lib/types";
import { whatsappGeneralMessage, whatsappLink } from "@/lib/whatsapp";
import { Reveal } from "@/components/motion/reveal";
import { EditableText } from "@/components/editor/editable-text";
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
            <p className="font-display text-sm uppercase tracking-[0.24em] text-ink">
              {settings.brand}
            </p>
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
                className="w-fit text-[0.82rem] text-ink-soft transition-colors hover:text-ink"
              >
                <EditableText bind={`@settings.nav.${i}.label`}>{item.label}</EditableText>
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2.5">
            <p className="u-eyebrow mb-1.5 text-ink-faint">Contact</p>
            <a
              href={`mailto:${profile.email}`}
              className="w-fit text-[0.82rem] text-ink-soft transition-colors hover:text-ink"
            >
              <EditableText bind="@profile.email">{profile.email}</EditableText>
            </a>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="w-fit text-[0.82rem] text-ink-soft transition-colors hover:text-ink"
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
                  rel="noreferrer"
                  className="w-fit text-[0.82rem] text-ink-soft transition-colors hover:text-ink"
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

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-[0.7rem] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            <EditableText bind="@settings.footerCopyright">{copyright}</EditableText>
          </p>
          <p className="uppercase tracking-[0.2em]">
            <EditableText bind="@settings.footerCredit">{credit}</EditableText>
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
