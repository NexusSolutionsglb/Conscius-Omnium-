"use client";

import type { ReactNode } from "react";
import { useEditorMode } from "./use-editable";

/**
 * Marks an image (any renderer — `<Image>`, `<ArtImage>`, a background) as
 * editable. On the public site it's a transparent pass‑through. In the editor a
 * `display:contents` wrapper carries `data-edit-image="<bind>|<folder>"` so the
 * image overlay can offer replace / upload / remove. The `<bind>` should point
 * at the URL string (e.g. `"studio.body.0.image"`, `"@profile.portrait"`,
 * `"@works.3.images.0.url"`).
 */
export function EditableImage({
  bind,
  folder = "media",
  children,
}: {
  bind: string;
  folder?: string;
  children: ReactNode;
}) {
  const mode = useEditorMode();
  if (mode === undefined) return <>{children}</>;
  return (
    <span style={{ display: "contents" }} data-edit-image={`${bind}|${folder}`}>
      {children}
    </span>
  );
}
