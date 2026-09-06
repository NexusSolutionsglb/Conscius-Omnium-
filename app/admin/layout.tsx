import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/admin/setup-notice";

export const metadata: Metadata = {
  title: "Studio CMS — Conscius Omnium™",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* The public site scales its root font-size on very large displays
          (globals.css) so the design holds up to 4K. The CMS is a working
          tool, not a composition — it stays at the browser's own 16px. */}
      <style>{"@media (min-width:1280px){html{font-size:16px}}"}</style>
      <div className="min-h-screen bg-neutral-100 font-sans text-[13.5px] text-neutral-900 antialiased">
        {isSupabaseConfigured ? children : <SetupNotice />}
      </div>
    </>
  );
}
