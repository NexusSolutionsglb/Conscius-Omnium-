"use client";

import { useMemo } from "react";
import type { Work } from "@/lib/types";
import { StaggerList } from "@/components/motion/reveal";
import { EditableText } from "@/components/editor/editable-text";
import { EditableImage } from "@/components/editor/editable-image";
import { RepeatableList } from "@/components/editor/repeatable-list";
import { useEditableData, useEditorMode } from "@/components/editor/use-editable";
import { newWork } from "@/lib/editor/new-entities";
import { WorkCard, type CardSize } from "./work-card";

/**
 * Editorial composition — not a uniform grid. Works flow through a
 * repeating six-beat rhythm: a full-bleed opener, an offset pair, a
 * centred smaller piece, a right-shifted wide, a left-held standard,
 * then a portrait. Whitespace does the rest.
 *
 * In the visual editor it becomes one plain editable grid so every work
 * can be added / reordered / hidden / opened for editing.
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
  const editing = useEditorMode() === "edit";
  const live = useEditableData<Work>("works", works);

  if (editing) return <EditableWorkGrid works={live} />;

  return <RhythmGrid works={works} />;
}

export function EditableWorkGrid({ works }: { works: Work[] }) {
  return (
    <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      <RepeatableList
        slug="work"
        path="items"
        items={works}
        makeItem={newWork}
        addLabel="Add a work"
        addClassName="py-3 sm:col-span-2 lg:col-span-3"
        listBind="@works"
        kind="work"
        itemLabel={(w) => w.title || "Artwork"}
      >
        {(work, i) => (
          <article data-unpublished={work.status === "published" ? undefined : ""}>
            <div className="relative">
              <EditableImage bind={`@works.${i}.coverImage`} folder="work">
                {work.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={work.coverImage}
                    alt={work.title}
                    className="aspect-[3/2] w-full rounded object-cover"
                  />
                ) : (
                  <div className="grid aspect-[3/2] place-items-center rounded bg-neutral-100 text-[12px] text-neutral-400">
                    Click to add a cover
                  </div>
                )}
              </EditableImage>
            </div>
            <h3 className="mt-4 font-display text-[1.35rem] font-normal leading-tight text-ink">
              <EditableText bind={`@works.${i}.title`}>{work.title}</EditableText>
            </h3>
            <p className="u-eyebrow mt-1.5 text-ink-mute">
              <EditableText bind={`@works.${i}.year`}>{work.year ?? ""}</EditableText>
            </p>
          </article>
        )}
      </RepeatableList>
    </div>
  );
}

function RhythmGrid({ works }: { works: Work[] }) {
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
    <div className="flex flex-col gap-28 md:gap-40">
      {rows.map(({ slot, items, key }, rowIndex) => {
        if (!items.length || !items[0]) return null;

        if (slot.kind === "pair") {
          return (
            <StaggerList
              key={key}
              className="grid gap-x-12 gap-y-16 md:grid-cols-2 md:gap-x-20"
            >
              {items.map((work, i) => (
                <div key={work.slug} className={i === 1 ? "md:pt-32" : undefined}>
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
