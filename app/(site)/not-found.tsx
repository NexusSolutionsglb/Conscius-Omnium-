import { ErrorState } from "@/components/site/error-state";

export default function SiteNotFound() {
  return (
    <ErrorState
      code="404"
      title="This page has dissolved."
      message="The work or page you're looking for isn't here — it may have been moved, unpublished, or never existed."
      action={{ label: "Return home", href: "/" }}
    />
  );
}
