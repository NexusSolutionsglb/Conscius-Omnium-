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
    <div className="min-h-screen bg-neutral-100 font-sans text-[13.5px] text-neutral-900 antialiased">
      {isSupabaseConfigured ? children : <SetupNotice />}
    </div>
  );
}
