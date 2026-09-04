"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import type { HomeContent, TimelineEntry } from "@/lib/types";
import { EASE } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/client";
import { homeDefaults } from "@/lib/content/defaults/home";
import { Eyebrow } from "@/components/ui/primitives";
import { EditableText } from "@/components/editor/editable-text";
import { EditableImage } from "@/components/editor/editable-image";
import { RepeatableList } from "@/components/editor/repeatable-list";
import { useEditableData, useEditorMode } from "@/components/editor/use-editable";
import { newTimelineEntry } from "@/lib/editor/new-entities";

const STRIP_LABEL_DEFAULT = "His story — 1995 to 2017";

/**
 * "His story" — a visual autobiography. On desktop it pins and scrolls
 * horizontally; on mobile (and under reduced-motion) it is a vertical
 * archive. Typographic by design — archival images attach per-entry
 * from Admin. In the visual editor it collapses to one editable list.
 */
export function Timeline({
  entries,
  label = STRIP_LABEL_DEFAULT,
  labelBind = "about.timeline.stripLabel",
}: {
  entries: TimelineEntry[];
  label?: string;
  labelBind?: string;
}) {
  const editing = useEditorMode() === "edit";
  const live = useEditableData<TimelineEntry>("timeline", entries);

  if (editing) return <EditableTimeline entries={live} label={label} labelBind={labelBind} />;

  const shown = live.filter((e) => e.published);
  return (
    <>
      <HorizontalTimeline entries={shown} label={label} />
      <VerticalTimeline entries={shown} label={label} />
    </>
  );
}

/** One flat, fully editable list — replaces the pinned scroll in edit mode. */
function EditableTimeline({
  entries,
  label,
  labelBind,
}: {
  entries: TimelineEntry[];
  label: string;
  labelBind: string;
}) {
  return (
    <section className="u-container py-16">
      <Eyebrow>
        <EditableText bind={labelBind}>{label}</EditableText>
      </Eyebrow>
      <ol className="mt-10 border-l border-line pl-6">
        <RepeatableList
          slug="about"
          path="timelineEntries"
          items={entries}
          makeItem={newTimelineEntry}
          addLabel="Add a timeline moment"
          addClassName="py-3"
          listBind="@timeline"
          kind="timeline"
          itemLabel={(e) => `${e.year} · ${e.title}` || "Moment"}
        >
          {(entry, i) => (
            <li
              className="relative pb-12 last:pb-0"
              data-unpublished={entry.published ? undefined : ""}
            >
              <span className="absolute -left-[1.6rem] top-1.5 h-2 w-2 rounded-full bg-ink" />
              <span className="font-display text-[2.4rem] font-light leading-none text-ink-faint/60">
                <EditableText bind={`@timeline.${i}.year`}>{entry.year}</EditableText>
              </span>
              <h3 className="mt-3 font-display text-[1.4rem] font-normal leading-tight text-ink">
                <EditableText bind={`@timeline.${i}.title`}>{entry.title}</EditableText>
              </h3>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-soft">
                <EditableText bind={`@timeline.${i}.description`} multiline>
                  {entry.description}
                </EditableText>
              </p>
              <div className="mt-3 max-w-xs">
                <EditableImage bind={`@timeline.${i}.image`} folder="timeline">
                  {entry.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.image} alt="" className="w-full rounded" />
                  ) : (
                    <span className="text-[0.72rem] text-ink-faint underline">
                      Add an image
                    </span>
                  )}
                </EditableImage>
              </div>
              <p className="u-eyebrow mt-3 text-ink-faint">
                <EditableText bind={`@timeline.${i}.category`}>{entry.category ?? ""}</EditableText>
              </p>
            </li>
          )}
        </RepeatableList>
      </ol>
    </section>
  );
}

function HorizontalTimeline({
  entries,
  label,
}: {
  entries: TimelineEntry[];
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const reduced = typeof window !== "undefined" && prefersReducedMotion();
  const [distance, setDistance] = useState(0);

  // Measure how far the track must travel to show its last card.
  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth + 64));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [entries.length]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -distance]);
  const smoothX = useSpring(x, { stiffness: 140, damping: 30, mass: 0.4 });
  const progressWidth = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "100%"]);

  return (
    <section
      ref={ref}
      className="relative hidden lg:block"
      style={{ height: `${Math.min(entries.length * 42 + 60, 460)}vh` }}
      aria-hidden
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="u-container">
          <Eyebrow>{label}</Eyebrow>
        </div>

        <motion.ol
          ref={trackRef}
          style={{ x: reduced ? 0 : smoothX }}
          className="mt-12 flex w-max items-stretch gap-[8vw] pl-[max(4.5rem,calc((100vw-1560px)/2+4.5rem))] pr-[20vw]"
        >
          {entries.map((entry, i) => (
            <li key={entry.id} className="relative w-[46vw] max-w-[560px] shrink-0">
              <span className="font-display text-[clamp(3rem,7vw,7rem)] font-light leading-none text-ink-faint/50">
                {entry.year}
              </span>
              <div className="mt-6 h-px w-full bg-line" />
              <div className="mt-6 flex items-baseline gap-4">
                <span className="u-eyebrow shrink-0 text-accent-deep">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-[1.7rem] font-normal leading-tight text-ink">
                    {entry.title}
                  </h3>
                  <p className="mt-3 max-w-md text-[0.9rem] leading-relaxed text-ink-soft">
                    {entry.description}
                  </p>
                  {entry.category && (
                    <p className="u-eyebrow mt-4 text-ink-faint">{entry.category}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </motion.ol>

        <div className="u-container mt-14">
          <div className="h-px w-full bg-line">
            <motion.div
              style={{ width: progressWidth }}
              className="h-px bg-ink"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function VerticalTimeline({
  entries,
  label,
}: {
  entries: TimelineEntry[];
  label: string;
}) {
  return (
    <section className="u-container py-16 lg:hidden">
      <Eyebrow>{label}</Eyebrow>
      <ol className="mt-10 border-l border-line pl-6">
        {entries.map((entry) => (
          <motion.li
            key={entry.id}
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.6, ease: EASE.outExpo }}
            className="relative pb-12 last:pb-0"
          >
            <span className="absolute -left-[1.6rem] top-1.5 h-2 w-2 rounded-full bg-ink" />
            <span className="font-display text-[2.4rem] font-light leading-none text-ink-faint/60">
              {entry.year}
            </span>
            <h3 className="mt-3 font-display text-[1.4rem] font-normal leading-tight text-ink">
              {entry.title}
            </h3>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-soft">
              {entry.description}
            </p>
            {entry.category && (
              <p className="u-eyebrow mt-3 text-ink-faint">{entry.category}</p>
            )}
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

/** Compact teaser used on the home page. */
export function TimelineStrip({
  entries,
  copy = homeDefaults.timeline,
}: {
  entries: TimelineEntry[];
  copy?: HomeContent["timeline"];
}) {
  const editing = useEditorMode() === "edit";
  const live = useEditableData<TimelineEntry>("timeline", entries);
  const published = live.filter((e) => e.published);

  const first = published[0];
  const last = published[published.length - 1];
  if (!editing && (!first || !last)) return null;

  const picks = editing
    ? live.slice(0, 6)
    : [first, published[Math.floor(published.length / 2)], last].filter(
        (e): e is NonNullable<typeof e> => Boolean(e),
      );

  return (
    <section className="u-container py-24 md:py-32">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Eyebrow>
            <EditableText bind="home.timeline.eyebrow">{copy.eyebrow}</EditableText>
          </Eyebrow>
          <EditableText
            as="h2"
            bind="home.timeline.heading"
            multiline
            className="mt-5 font-display text-[clamp(1.7rem,1.1rem+2.4vw,3rem)] font-light leading-[1.14]"
          >
            {copy.heading}
          </EditableText>
          <EditableText
            as="p"
            bind="home.timeline.body"
            multiline
            className="mt-6 max-w-sm text-[0.9rem] leading-relaxed text-ink-soft"
          >
            {copy.body}
          </EditableText>
        </div>

        <div className="md:col-span-8 md:pl-6">
          <div className="relative flex gap-8 overflow-x-auto pb-4 [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
            {editing ? (
              <RepeatableList
                slug="home"
                path="timelinePicks"
                items={picks}
                indexOf={(e) => live.indexOf(e)}
                makeItem={newTimelineEntry}
                addLabel="Add a moment"
                addClassName="py-2 md:col-span-3"
                listBind="@timeline"
                kind="timeline"
                itemLabel={(entry) => `${entry.year} · ${entry.title}`}
              >
                {(entry, i) => (
                  <div className="min-w-[68vw] sm:min-w-[280px] md:min-w-0">
                    <span className="font-display text-[2.6rem] font-light leading-none text-ink-faint/55">
                      <EditableText bind={`@timeline.${i}.year`}>{entry.year}</EditableText>
                    </span>
                    <h3 className="mt-3 font-display text-[1.15rem] leading-snug text-ink">
                      <EditableText bind={`@timeline.${i}.title`}>{entry.title}</EditableText>
                    </h3>
                    <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-mute">
                      <EditableText bind={`@timeline.${i}.description`} multiline>
                        {entry.description}
                      </EditableText>
                    </p>
                  </div>
                )}
              </RepeatableList>
            ) : (
              picks.map((entry) => (
                <div key={entry.id} className="min-w-[68vw] sm:min-w-[280px] md:min-w-0">
                  <span className="font-display text-[2.6rem] font-light leading-none text-ink-faint/55">
                    {entry.year}
                  </span>
                  <h3 className="mt-3 font-display text-[1.15rem] leading-snug text-ink">
                    {entry.title}
                  </h3>
                  <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-mute">
                    {entry.description}
                  </p>
                </div>
              ))
            )}
          </div>
          <p className="mt-10">
            <a
              href="/about#timeline"
              className="u-link text-[0.6875rem] font-medium uppercase tracking-[0.18em]"
            >
              <EditableText bind="home.timeline.linkLabel">{copy.linkLabel}</EditableText>
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
