"use client";

import Link from "next/link";
import type { CustomBlock } from "@/lib/types";
import { blurFor } from "@/lib/content/blur";
import { cn } from "@/lib/utils";
import { sectionStyleClass } from "@/lib/editor/section-style";
import { ArtImage } from "@/components/motion/image-reveal";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/primitives";
import { EditableText } from "@/components/editor/editable-text";
import { EditableImage } from "@/components/editor/editable-image";

/**
 * Renders one admin-added section block. All copy is click-to-edit; the
 * background + spacing come from the block's own `background` / `spacing`
 * (edited in the inspector). `id` is the block's key in `home.blocks`.
 */
export function CustomBlockView({ id, block }: { id: string; block: CustomBlock | undefined }) {
  if (!block) return null;
  const base = `home.blocks.${id}`;
  const style = sectionStyleClass(block);
  const dark = block.background === "obsidian";

  const shell = (children: React.ReactNode, extra?: string) => (
    <section className={cn("u-container", style || "py-20 md:py-28", extra)}>
      {children}
    </section>
  );

  switch (block.type) {
    case "richText":
      return shell(
        <Reveal className="max-w-3xl">
          <Eyebrow>
            <EditableText bind={`${base}.eyebrow`}>{block.eyebrow}</EditableText>
          </Eyebrow>
          <EditableText
            as="h2"
            bind={`${base}.heading`}
            className="mt-4 font-display text-[clamp(1.6rem,1rem+2.4vw,3rem)] font-light leading-[1.14]"
          >
            {block.heading}
          </EditableText>
          <EditableText
            as="p"
            bind={`${base}.body`}
            multiline
            className={cn(
              "mt-5 text-[0.98rem] leading-[1.75]",
              dark ? "text-paper/70" : "text-ink-soft",
            )}
          >
            {block.body}
          </EditableText>
        </Reveal>,
      );

    case "quote":
      return shell(
        <Reveal className="mx-auto max-w-4xl text-center">
          <EditableText
            as="p"
            bind={`${base}.text`}
            multiline
            className="font-display text-[clamp(1.5rem,1rem+2.4vw,2.8rem)] font-light italic leading-[1.32]"
          >
            {block.text}
          </EditableText>
          <p className="u-eyebrow mt-6">
            <EditableText bind={`${base}.attribution`}>{block.attribution}</EditableText>
          </p>
        </Reveal>,
      );

    case "image":
      return shell(
        <Reveal className={block.full ? "" : "mx-auto max-w-4xl"}>
          <EditableImage bind={`${base}.image`} folder="media">
            {block.image ? (
              <ArtImage
                src={block.image}
                alt={block.caption || "Image"}
                ratio="16 / 9"
                fill
                sizes="100vw"
                placeholder={blurFor(block.image) ? "blur" : "empty"}
                blurDataURL={blurFor(block.image)}
              />
            ) : (
              <div className="grid aspect-[16/9] place-items-center bg-neutral-100 text-[12px] text-neutral-400">
                Click to add an image
              </div>
            )}
          </EditableImage>
          <figcaption
            className={cn("mt-3 text-[0.78rem]", dark ? "text-paper/55" : "text-ink-mute")}
          >
            <EditableText bind={`${base}.caption`}>{block.caption}</EditableText>
          </figcaption>
        </Reveal>,
      );

    case "cta":
      return shell(
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow className={dark ? "text-paper/50" : undefined}>
            <EditableText bind={`${base}.eyebrow`}>{block.eyebrow}</EditableText>
          </Eyebrow>
          <EditableText
            as="h2"
            bind={`${base}.heading`}
            className="mx-auto mt-4 font-display text-[clamp(1.8rem,1.1rem+2.6vw,3.4rem)] font-light leading-[1.1]"
          >
            {block.heading}
          </EditableText>
          <EditableText
            as="p"
            bind={`${base}.body`}
            multiline
            className={cn("mx-auto mt-4 max-w-md text-[0.92rem]", dark ? "text-paper/60" : "text-ink-soft")}
          >
            {block.body}
          </EditableText>
          <Link href={block.ctaHref || "/contact"} className="u-btn mt-8">
            <EditableText bind={`${base}.ctaLabel`}>{block.ctaLabel}</EditableText>
          </Link>
        </Reveal>,
      );

    case "gallery":
      return shell(
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(block.images ?? []).map((im, i) => (
            <EditableImage key={i} bind={`${base}.images.${i}.url`} folder="media">
              {im.url ? (
                <ArtImage
                  src={im.url}
                  alt={im.alt || "Gallery image"}
                  ratio="1 / 1"
                  fill
                  sizes="(min-width:1024px) 30vw, 50vw"
                  placeholder={blurFor(im.url) ? "blur" : "empty"}
                  blurDataURL={blurFor(im.url)}
                />
              ) : (
                <div className="grid aspect-square place-items-center bg-neutral-100 text-[11px] text-neutral-400">
                  image
                </div>
              )}
            </EditableImage>
          ))}
        </div>,
      );
  }
}
