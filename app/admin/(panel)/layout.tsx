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
    <>
      <AdminSidebar email={gate.user.email} />
      <div className="lg:pl-60">
        <div className="mx-auto max-w-5xl px-5 py-10 lg:px-10 lg:py-12">
          {children}
        </div>
      </div>
    </>
  );
}
