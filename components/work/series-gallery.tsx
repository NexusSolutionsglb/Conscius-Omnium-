"use client";

import Link from "next/link";
import type { Collection, Series, Work } from "@/lib/types";
import { newCollection } from "@/lib/editor/new-entities";
import { StaggerList } from "@/components/motion/reveal";
import { EditableText } from "@/components/editor/editable-text";
import { EditableImage } from "@/components/editor/editable-image";
import { RepeatableList } from "@/components/editor/repeatable-list";
import { useEditableData, useEditorMode } from "@/components/editor/use-editable";
import { SeriesCard } from "./series-card";
import { ArtworkGrid } from "./artwork-grid";

/**
 * The main gallery — a wall of *series*, not of individual works. Every
 * plate is the same size and the same shape, so the page reads as one
 * curated hang; clicking one opens that series and its own artworks.
 *
 * In the visual editor the same grid becomes an editable list of series
 * (add / reorder / retitle / re-cover), matching how every other managed
 * list on the site behaves.
 */
export function SeriesGallery({
  series,
  unassigned = [],
}: {
  series: Series[];
  /** Published works no series claims — shown after the series wall so
   *  they stay reachable. */
  unassigned?: Work[];
}) {
  const editing = useEditorMode() === "edit";
  const liveCollections = useEditableData<Collection>("collections", series);

  if (editing) {
    return (
      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        <RepeatableList
          slug="work"
          path="series"
          items={liveCollections}
          makeItem={newCollection}
          addLabel="Add a series"
          addClassName="py-3 sm:col-span-2 lg:col-span-3"
          listBind="@collections"
          kind="collection"
          itemLabel={(c) => c.title || "Series"}
        >
          {(collection, i) => (
            <article data-unpublished={collection.published ? undefined : ""}>
              <EditableImage bind={`@collections.${i}.coverImage`} folder="collection">
                {collection.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={collection.coverImage}
                    alt={collection.title}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="grid aspect-square place-items-center bg-neutral-100 text-[12px] text-neutral-400">
                    Click to add a cover
                  </div>
                )}
              </EditableImage>
              <h3 className="mt-4 font-display text-[1.25rem] text-ink">
                <EditableText bind={`@collections.${i}.title`}>
                  {collection.title}
                </EditableText>
              </h3>
              <p className="mt-2 line-clamp-3 text-[0.82rem] leading-relaxed text-ink-mute">
                <EditableText bind={`@collections.${i}.description`} multiline>
                  {collection.description}
                </EditableText>
              </p>
            </article>
          )}
        </RepeatableList>
      </div>
    );
  }

  return (
    <>
      <StaggerList className="grid gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-14">
        {series.map((s, i) => (
          <SeriesCard key={s.slug} series={s} priority={i < 3} />
        ))}
      </StaggerList>

      {unassigned.length > 0 && (
        <section className="mt-40 md:mt-56">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
            <h2 className="font-display text-[clamp(1.4rem,1rem+1.4vw,2rem)] text-ink">
              Other works
            </h2>
            <Link
              href="/contact"
              className="u-tap u-link text-[0.6875rem] uppercase tracking-[0.18em]"
            >
              Enquire
            </Link>
          </div>
          <ArtworkGrid works={unassigned} className="mt-12" />
        </section>
      )}
    </>
  );
}
