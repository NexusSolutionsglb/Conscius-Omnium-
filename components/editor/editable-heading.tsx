"use client";

import type { ElementType } from "react";
import { TextReveal } from "@/components/motion/text-reveal";
import { EditableText } from "./editable-text";
import { useEditorMode } from "./use-editable";

/**
 * A page hero heading. On the public site (and in Preview) it is the animated
 * `<TextReveal>` exactly as before. In edit mode it becomes a plain
 * click-to-edit element (the per-character animation can't host a caret).
 */
export function EditableHeading({
  bind,
  children,
  className,
  as = "h1",
}: {
  bind: string;
  children: string;
  className?: string;
  as?: ElementType;
}) {
  const mode = useEditorMode();

  if (mode === "edit") {
    return (
      <EditableText as={as} bind={bind} linebreaks className={className}>
        {children}
      </EditableText>
    );
  }

  return <TextReveal as={as} text={children} className={className} />;
}
