"use client";

import { Suspense } from "react";
import type { Discipline, WorkIndexContent } from "@/lib/types";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/primitives";
import { WorkFilter } from "@/components/work/work-filter";
import { EditableText } from "@/components/editor/editable-text";
import { EditableHeading } from "@/components/editor/editable-heading";
import { useEditable, useEditorMode } from "@/components/editor/use-editable";

export function WorkIndexHeader({
  serverContent,
  total,
  disciplines,
  counts,
}: {
  serverContent: WorkIndexContent;
  total: number;
  disciplines: Discipline[];
  counts: Record<string, number>;
}) {
  const mode = useEditorMode();
  const eyebrow = useEditable("work", "eyebrow", serverContent.eyebrow);
  const heading = useEditable("work", "heading", serverContent.heading);
  const intro = useEditable("work", "intro", serverContent.intro);
  // In edit mode keep the {count} token visible so it isn't baked into the value.
  const introText = mode === "edit" ? intro : intro.replace("{count}", String(total));

  return (
    <header className="u-container pb-14 pt-36 md:pb-20 md:pt-44">
      <Eyebrow>
        <EditableText bind="work.eyebrow">{eyebrow}</EditableText>
      </Eyebrow>
      <EditableHeading
        bind="work.heading"
        className="mt-5 font-display text-[clamp(2.6rem,1.4rem+5vw,6rem)] font-light leading-[0.98]"
      >
        {heading}
      </EditableHeading>
      <Reveal delay={0.1} className="mt-8 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft">
        <EditableText as="p" bind="work.intro" multiline>
          {introText}
        </EditableText>
      </Reveal>

      <Reveal delay={0.15} className="mt-10">
        <Suspense fallback={<div className="h-6" />}>
          <WorkFilter disciplines={disciplines} total={total} counts={counts} />
        </Suspense>
      </Reveal>
    </header>
  );
}
