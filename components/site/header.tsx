"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import type { Profile, SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IS_DRAFT_REVIEW } from "@/lib/draft-mode";
import { Magnetic } from "@/components/motion/magnetic";
import { EditableText } from "@/components/editor/editable-text";
import { EditableImage } from "@/components/editor/editable-image";
import { useEditableSettings } from "@/components/editor/use-editable";
import { MobileMenu } from "./mobile-menu";
import { useCursor } from "./cursor";

export function Header({
  settings: base,
  profile,
}: {
  settings: SiteSettings;
  profile?: Profile;
}) {
  const settings: SiteSettings = {
    ...base,
    nav: useEditableSettings("nav", base.nav),
    brand: useEditableSettings("brand", base.brand),
    brandLine: useEditableSettings("brandLine", base.brandLine),
    logo: useEditableSettings("logo", base.logo),
    logoInverted: useEditableSettings("logoInverted", base.logoInverted),
  };
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { reset } = useCursor();

  const overHero = pathname === "/";

  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 40);
  });

  useEffect(() => {
    setMenuOpen(false);
    reset();
  }, [pathname, reset]);

  const solid = !overHero || scrolled;

  // The mark sits in the centre of the bar (per the client's sketch), so the
  // nav splits in half around it — About / Gallery left, Studio / Contact right.
  const indexed = settings.nav.map((item, i) => ({ item, i }));
  const half = Math.ceil(indexed.length / 2);
  const leftNav = indexed.slice(0, half);
  const rightNav = indexed.slice(half);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        data-solid={solid}
        className={cn(
          // Sits below the draft-review banner while that's up (see
          // `draft-banner.tsx` — the two heights must match).
          "u-no-print fixed inset-x-0 z-[120] transition-colors duration-500",
          IS_DRAFT_REVIEW ? "top-9" : "top-0",
          // No border, no divider, no shadow — the bar meets the page
          // edge-to-edge and the only thing that changes on scroll is the
          // ground it sits on.
          solid
            ? "bg-paper text-ink"
            : "bg-transparent text-paper",
        )}
      >
        <div className="u-container">
          <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-6 md:h-24">
            {/* Left half of the nav */}
            <nav
              className="hidden items-center gap-10 md:flex lg:gap-16"
              aria-label="Primary"
            >
              {leftNav.map(({ item, i }) => (
                <NavLink
                  key={item.href}
                  item={item}
                  index={i}
                  active={isActive(item.href)}
                />
              ))}
            </nav>
            <span className="md:hidden" />

            {/* Centre mark */}
            <Link
              href="/"
              className="group flex flex-col items-center leading-none"
              aria-label={`${settings.brand} — home`}
            >
              {solid ? (
                <EditableImage bind="@settings.logo" folder="branding">
                  {settings.logo ? (
                    <Image
                      src={settings.logo}
                      alt={settings.brand}
                      width={1600}
                      height={381}
                      priority
                      className="h-12 w-auto object-contain md:h-12"
                    />
                  ) : (
                    <span className="font-display text-[0.95rem] font-normal uppercase tracking-[0.24em] text-ink">
                      <EditableText bind="@settings.brand">{settings.brand}</EditableText>
                    </span>
                  )}
                </EditableImage>
              ) : (
                <EditableImage bind="@settings.logoInverted" folder="branding">
                  {settings.logoInverted ? (
                    <Image
                      src={settings.logoInverted}
                      alt={settings.brand}
                      width={1600}
                      height={381}
                      priority
                      className="h-12 w-auto object-contain md:h-12"
                    />
                  ) : (
                    <span className="font-display text-[0.95rem] font-normal uppercase tracking-[0.24em] text-paper">
                      <EditableText bind="@settings.brand">{settings.brand}</EditableText>
                    </span>
                  )}
                </EditableImage>
              )}
            </Link>

            {/* Right half of the nav */}
            <nav
              className="hidden items-center justify-end gap-10 md:flex lg:gap-16"
              aria-label="Primary"
            >
              {rightNav.map(({ item, i }) => (
                <NavLink
                  key={item.href}
                  item={item}
                  index={i}
                  active={isActive(item.href)}
                />
              ))}
            </nav>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="group -mr-2 flex h-11 w-11 items-center justify-self-end md:hidden"
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-controls="site-menu"
              aria-expanded={menuOpen}
            >
              <Magnetic strength={0.2}>
                <span className="flex flex-col gap-[5px]">
                  <span className="block h-px w-6 bg-current" />
                  <span className="block h-px w-6 bg-current" />
                </span>
              </Magnetic>
            </button>
          </div>
        </div>
      </motion.header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        settings={settings}
        profile={profile}
      />
    </>
  );
}

function NavLink({
  item,
  index,
  active,
}: {
  item: { label: string; href: string };
  index: number;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className="group relative py-1 text-[0.72rem] font-normal uppercase tracking-[0.24em] transition-opacity duration-300 hover:opacity-100 aria-[current=page]:opacity-100 opacity-80"
    >
      <EditableText bind={`@settings.nav.${index}.label`}>{item.label}</EditableText>
      <span
        className={cn(
          "absolute -bottom-0.5 left-0 h-px w-full origin-right bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-left group-hover:scale-x-100",
          active ? "scale-x-100" : "scale-x-0",
        )}
      />
    </Link>
  );
}
