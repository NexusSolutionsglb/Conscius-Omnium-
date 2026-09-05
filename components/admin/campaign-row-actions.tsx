"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCampaign } from "@/lib/admin/newsletter-actions";

export function CampaignRowActions({ id, subject }: { id: string; subject: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-3 text-[12px]">
      <Link href={`/admin/newsletter/${id}`} className="text-ink-mute hover:text-ink">
        Edit
      </Link>
      <a
        href={`/admin/newsletter/${id}/preview`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-ink-mute hover:text-ink"
      >
        Preview ↗
      </a>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete “${subject}” permanently?`)) return;
          const fd = new FormData();
          fd.set("id", id);
          start(async () => {
            await deleteCampaign(fd);
            router.refresh();
          });
        }}
        className="text-red-600 hover:underline disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
