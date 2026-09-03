import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <div className="fixed inset-0 flex flex-col bg-neutral-200">{children}</div>;
}
