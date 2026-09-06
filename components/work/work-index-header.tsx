"use client";

import type { WorkIndexContent } from "@/lib/types";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/primitives";
import { EditableText } from "@/components/editor/editable-text";
import { EditableHeading } from "@/components/editor/editable-heading";
import { useEditable, useEditorMode } from "@/components/editor/use-editable";

export function WorkIndexHeader({
  serverContent,
  total,
}: {
  serverContent: WorkIndexContent;
  total: number;
}) {
  const mode = useEditorMode();
  const eyebrow = useEditable("work", "eyebrow", serverContent.eyebrow);
  const heading = useEditable("work", "heading", serverContent.heading);
  const intro = useEditable("work", "intro", serverContent.intro);
  // In edit mode keep the {count} token visible so it isn't baked into the value.
  const introText = mode === "edit" ? intro : intro.replace("{count}", String(total));

  return (
    <header className="u-container pb-20 pt-36 md:pb-28 md:pt-44">
      <Eyebrow>
        <EditableText bind="work.eyebrow">{eyebrow}</EditableText>
      </Eyebrow>
      <EditableHeading
        bind="work.heading"
        className="mt-5 font-display text-[clamp(2.4rem,1.4rem+4.2vw,5rem)] leading-[1.02]"
      >
        {heading}
      </EditableHeading>
      <Reveal delay={0.1} className="mt-8 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft">
        <EditableText as="p" bind="work.intro" multiline>
          {introText}
        </EditableText>
      </Reveal>
    </header>
  );
}
