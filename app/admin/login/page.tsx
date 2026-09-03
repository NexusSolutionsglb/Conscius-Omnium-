import { Suspense } from "react";
import { AdminLogin } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-neutral-400">Loading…</div>}>
      <AdminLogin />
    </Suspense>
  );
}
