import { ErrorState, NOT_FOUND_SUGGESTIONS } from "@/components/site/error-state";

export default function SiteNotFound() {
  return (
    <div className="pt-16 md:pt-[4.75rem]">
      <ErrorState
        code="404"
        title="This page has dissolved."
        message="The work or page you're looking for isn't here — it may have been moved, unpublished, or never existed."
        action={{ label: "Return home", href: "/" }}
        suggestions={NOT_FOUND_SUGGESTIONS}
      />
    </div>
  );
}
