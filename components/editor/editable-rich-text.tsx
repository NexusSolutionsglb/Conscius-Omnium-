"use client";

import type { ElementType } from "react";
import { EmphasisText } from "@/components/ui/primitives";
import { EditableText } from "./editable-text";
import { useEditorMode } from "./use-editable";

/**
 * A paragraph that supports `*emphasis*` markers. On the public site (and in
 * Preview) the markers render as `<em>`. In edit mode the raw text — markers
 * visible — is click-to-edit.
 */
export function EditableRichText({
  bind,
  children,
  className,
  as: Tag = "p",
}: {
  bind: string;
  children: string;
  className?: string;
  as?: ElementType;
}) {
  const mode = useEditorMode();

  if (mode === "edit") {
    return (
      <EditableText as={Tag} bind={bind} multiline className={className}>
        {children}
      </EditableText>
    );
  }

  return (
    <Tag className={className}>
      <EmphasisText>{children}</EmphasisText>
    </Tag>
  );
}
