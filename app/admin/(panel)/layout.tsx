import { resolveAdmin } from "@/lib/admin/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gate = await resolveAdmin();
  if (gate.state === "unconfigured") redirect("/admin");
  if (gate.state === "signed-out") redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col">
      <AdminSidebar email={gate.user.email} />
      <div className="flex flex-1 flex-col lg:pl-60">
        <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 lg:px-10 lg:py-12">
          {children}
        </div>
        <footer className="border-t border-neutral-200 bg-neutral-50 px-6 py-5 flex justify-center">
          <a
            href="https://nexusolutions.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border-2 border-neutral-200 bg-white px-6 py-3.5 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
          >
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Developed by
            </span>
            <div className="h-5 w-px bg-neutral-200" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/nexus-logo-horizontal.png"
              alt="Nexus Solutions"
              className="h-10 w-auto object-contain"
            />
          </a>
        </footer>
      </div>
    </div>
  );
}
