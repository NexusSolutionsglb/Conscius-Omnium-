"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { adminSignOut } from "@/lib/admin/actions";

const NAV: { group: string; items: { label: string; href: string }[] }[] = [
  {
    group: "Overview",
    items: [{ label: "Dashboard", href: "/admin" }],
  },
  {
    group: "Content",
    items: [
      { label: "Edit site ✦", href: "/admin/edit/home" },
      { label: "Works", href: "/admin/works" },
      { label: "Collections", href: "/admin/collections" },
      { label: "Exhibitions", href: "/admin/exhibitions" },
      { label: "Timeline", href: "/admin/timeline" },
      { label: "Media", href: "/admin/media" },
    ],
  },
  {
    group: "Site",
    items: [
      { label: "Pages", href: "/admin/pages" },
      { label: "Profile", href: "/admin/profile" },
      { label: "Settings", href: "/admin/settings" },
    ],
  },
  {
    group: "Enquiries",
    items: [{ label: "Inbox", href: "/admin/inquiries" }],
  },
];

export function AdminSidebar({ email }: { email: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed left-3 top-3 z-50 rounded-md border border-line-strong bg-paper px-3 py-2 text-xs font-medium lg:hidden"
        aria-label="Toggle menu"
      >
        Menu
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-line bg-paper transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-line px-5 py-5">
          <Image
            src="/logo/mark-black.png"
            alt="Conscius Omnium™"
            width={1600}
            height={381}
            className="h-6 w-auto object-contain"
          />
          <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            Studio CMS
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((section) => (
            <div key={section.group} className="mb-5">
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                {section.group}
              </p>
              {section.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-md px-2 py-1.5 text-[13px] transition-colors",
                      active
                        ? "bg-ink text-paper"
                        : "text-ink-soft hover:bg-paper-dim hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-line px-3 py-3">
          <Link
            href="/"
            target="_blank"
            className="block rounded-md px-2 py-1.5 text-[12px] text-ink-mute hover:bg-paper-dim"
          >
            View site ↗
          </Link>
          <p className="truncate px-2 pt-2 text-[11px] text-ink-faint" title={email ?? ""}>
            {email}
          </p>
          <form action={adminSignOut}>
            <button
              type="submit"
              className="mt-1 w-full rounded-md px-2 py-1.5 text-left text-[12px] text-ink-mute hover:bg-paper-dim hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
        />
      )}
    </>
  );
}
