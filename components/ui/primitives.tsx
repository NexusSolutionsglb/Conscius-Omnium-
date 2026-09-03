"use client";

import Link from "next/link";
import {
  Fragment,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";
import { motion } from "motion/react";
import { drawLine } from "@/lib/motion";
import { cn, isExternal } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return <Tag className={cn("u-eyebrow", className)}>{children}</Tag>;
}

/** Hairline that draws itself in on scroll. */
export function Rule({ className, width = 48 }: { className?: string; width?: number }) {
  return (
    <motion.span
      className={cn("block h-px origin-left bg-line-strong", className)}
      style={{ width }}
      variants={drawLine}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
    />
  );
}

type SmartLinkProps = ComponentPropsWithoutRef<typeof Link> & { href: string };

/** Link that opens external hrefs in a new tab automatically. */
export function SmartLink({ href, children, ...rest }: SmartLinkProps) {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" {...(rest as ComponentPropsWithoutRef<"a">)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}

/** Text link with the wipe underline. */
export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <SmartLink
      href={href}
      className={cn(
        "u-link text-[0.6875rem] font-medium uppercase tracking-[0.18em]",
        className,
      )}
    >
      {children}
    </SmartLink>
  );
}

/**
 * Renders a plain string with `*emphasis*` spans as `<em>`. Used for the few
 * places (e.g. film titles) that need italics inside otherwise editable copy.
 */
export function EmphasisText({ children }: { children: string }) {
  const parts = children.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
          <em key={i}>{part.slice(1, -1)}</em>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "sold" | "available" | "muted";
  className?: string;
}) {
  const tones = {
    default: "border-line-strong text-ink-soft",
    sold: "border-ink/25 text-ink-mute",
    available: "border-accent/40 text-accent-deep",
    muted: "border-line text-ink-faint",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.16em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
