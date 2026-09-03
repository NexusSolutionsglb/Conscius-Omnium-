import { PageHeader } from "@/components/admin/ui";
import { MediaLibrary } from "@/components/admin/media-library";

export default function MediaPage() {
  return (
    <>
      <PageHeader
        title="Media"
        description="Upload once, use anywhere. Images are served optimised through next/image."
      />
      <MediaLibrary />
    </>
  );
}
