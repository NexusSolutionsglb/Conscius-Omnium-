"use client";

import { useMemo } from "react";
import type { Work } from "@/lib/types";
import { StaggerList } from "@/components/motion/reveal";
import { WorkCard, type CardSize } from "./work-card";

/**
 * Editorial composition — not a uniform grid. Works flow through a
 * repeating six-beat rhythm: a full-bleed opener, an offset pair, a
 * centred smaller piece, a right-shifted wide, a left-held standard,
 * then a portrait. Whitespace does the rest.
 */

type Slot =
  | { kind: "single"; size: CardSize; align: "left" | "right" | "center"; width: string }
  | { kind: "pair" };

const RHYTHM: Slot[] = [
  { kind: "single", size: "wide", align: "left", width: "w-full" },
  { kind: "pair" },
  { kind: "single", size: "portrait", align: "center", width: "mx-auto w-full max-w-xl" },
  { kind: "single", size: "standard", align: "right", width: "ml-auto w-full lg:w-[78%]" },
  { kind: "single", size: "square", align: "left", width: "w-full lg:w-[64%]" },
  { kind: "pair" },
];

export function WorkIndex({ works }: { works: Work[] }) {
  const rows = useMemo(() => {
    const out: { slot: Slot; items: Work[]; key: string }[] = [];
    let i = 0;
    let beat = 0;
    while (i < works.length) {
      const slot = RHYTHM[beat % RHYTHM.length];
      if (slot.kind === "pair") {
        out.push({ slot, items: works.slice(i, i + 2), key: `r${beat}-${i}` });
        i += 2;
      } else {
        out.push({ slot, items: [works[i]], key: `r${beat}-${i}` });
        i += 1;
      }
      beat += 1;
    }
    return out;
  }, [works]);

  return (
    <div className="flex flex-col gap-24 md:gap-32">
      {rows.map(({ slot, items, key }, rowIndex) => {
        if (!items.length || !items[0]) return null;

        if (slot.kind === "pair") {
          return (
            <StaggerList
              key={key}
              className="grid gap-x-10 gap-y-16 md:grid-cols-2 md:gap-x-16"
            >
              {items.map((work, i) => (
                <div key={work.slug} className={i === 1 ? "md:pt-24" : undefined}>
                  <WorkCard
                    work={work}
                    size={i === 1 ? "portrait" : "standard"}
                    priority={rowIndex === 0}
                  />
                </div>
              ))}
            </StaggerList>
          );
        }

        return (
          <StaggerList key={key} className={slot.width}>
            <WorkCard
              work={items[0]}
              size={slot.size}
              align={slot.align}
              priority={rowIndex === 0}
            />
          </StaggerList>
        );
      })}
    </div>
  );
}
