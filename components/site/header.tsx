"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import type { Profile, SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/motion/magnetic";
import { EditableText } from "@/components/editor/editable-text";
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

  return (
    <>
      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        data-solid={solid}
        className={cn(
          "u-no-print fixed inset-x-0 top-0 z-[120] transition-colors duration-500",
          solid
            ? "bg-paper/88 text-ink backdrop-blur-md"
            : "bg-transparent text-paper",
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-line transition-transform duration-500",
            solid ? "scale-x-100" : "scale-x-0",
          )}
        />
        <div className="u-container">
          <div className="flex h-16 items-center justify-between gap-6 md:h-[4.75rem]">
            <Link
              href="/"
              className="group flex flex-col leading-none"
              aria-label={`${settings.brand} — home`}
            >
              <span className="font-display text-[0.95rem] font-medium uppercase tracking-[0.2em]">
                <EditableText bind="@settings.brand">{settings.brand}</EditableText>
              </span>
              <span
                className={cn(
                  "mt-1 text-[0.5rem] uppercase tracking-[0.34em] transition-colors",
                  solid ? "text-ink-mute" : "text-paper/60",
                )}
              >
                <EditableText bind="@settings.brandLine">{settings.brandLine}</EditableText>
              </span>
            </Link>

            <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
              {settings.nav.map((item, i) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="group relative py-1 text-[0.6875rem] font-medium uppercase tracking-[0.16em]"
                  >
                    <EditableText bind={`@settings.nav.${i}.label`}>{item.label}</EditableText>
                    <span
                      className={cn(
                        "absolute -bottom-0.5 left-0 h-px w-full origin-right bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-left group-hover:scale-x-100",
                        active ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="group -mr-2 flex h-11 w-11 items-center justify-center md:hidden"
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
