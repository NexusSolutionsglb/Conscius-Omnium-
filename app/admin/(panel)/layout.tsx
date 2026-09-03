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
        <footer className="border-t border-neutral-200 bg-white px-6 py-6 text-center text-xs text-neutral-500">
          <p className="mx-auto max-w-3xl leading-relaxed">
            <strong className="font-semibold text-neutral-700">Disclaimer:</strong> This website is a sample/demo created solely for presentation and demonstration purposes for the client. It is not intended for reuse or deployment as a production-level website. All designs, visuals, and creative elements presented on this website are copyrighted by Nexus Solutions and may not be reproduced, reused, or distributed without prior written permission.
          </p>
          <p className="mt-2 font-bold tracking-[0.1em] text-neutral-800">
            Owned by Nexus Solutions
          </p>
        </footer>
      </div>
    </div>
  );
}
