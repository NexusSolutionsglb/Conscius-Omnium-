"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/admin/actions";
import { SubmitButton } from "./ui";

/**
 * Thin wrapper: renders children (form fields), calls `action` with the
 * form's FormData, surfaces field + top-level errors, and navigates on
 * success.
 */
export function EntityForm({
  action,
  children,
  submitLabel = "Save",
  redirectTo,
  deleteAction,
  deleteLabel = "Delete",
}: {
  action: (fd: FormData) => Promise<ActionResult>;
  children: (errors: Record<string, string[]>) => React.ReactNode;
  submitLabel?: string;
  redirectTo?: string;
  deleteAction?: () => Promise<ActionResult>;
  deleteLabel?: string;
}) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const res = await action(fd);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      setMsg({ t: "err", m: res.error });
      return;
    }
    setMsg({ t: "ok", m: res.message ?? "Saved" });
    if (redirectTo) router.push(redirectTo);
    else router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {children(errors)}
      <div className="flex items-center gap-3 pt-1">
        <SubmitButton>{submitLabel}</SubmitButton>
        {deleteAction && (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              if (!confirm("Delete permanently?")) return;
              setBusy(true);
              const r = await deleteAction();
              if (r.ok) router.push(redirectTo ?? ".");
              else {
                setMsg({ t: "err", m: r.error });
                setBusy(false);
              }
            }}
            className="text-[12px] text-red-600 hover:underline"
          >
            {deleteLabel}
          </button>
        )}
        {msg && (
          <span className={`text-[12px] ${msg.t === "err" ? "text-red-600" : "text-emerald-600"}`}>
            {msg.m}
          </span>
        )}
      </div>
    </form>
  );
}
