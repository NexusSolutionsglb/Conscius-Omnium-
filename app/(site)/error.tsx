"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/site/error-state";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="pt-20">
      <ErrorState
        title="Something interrupted the view."
        message="An unexpected error occurred while loading this page. Please try again."
        action={{ label: "Try again", href: "/" }}
      />
      <div className="flex justify-center pb-16">
        <button type="button" onClick={reset} className="u-btn u-btn--ghost">
          Reload this page
        </button>
      </div>
    </div>
  );
}
