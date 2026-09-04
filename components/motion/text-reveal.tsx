"use client";

import { type ElementType } from "react";
import { motion } from "motion/react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { m } from "@/lib/motion-dom";

/**
 * Reveals a headline line-by-line behind a mask. Split the text yourself
 * with `\n` for deliberate line breaks, or pass an array of lines.
 */
export function TextReveal({
  text,
  as: Tag = "h2",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.08,
  once = true,
}: {
  text: string | string[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  const lines = Array.isArray(text) ? text : text.split("\n");
  const MotionTag = m(Tag as ElementType);

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "0px 0px -10% 0px" }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={lines.join(" ")}
    >
      {lines.map((line, i) => (
        <span
          key={i}
          aria-hidden
          className="block overflow-hidden"
          style={{ paddingBottom: "0.08em", marginBottom: "-0.08em" }}
        >
          <motion.span
            className={cn("block", lineClassName)}
            variants={{
              hidden: { y: "110%" },
              show: {
                y: "0%",
                transition: { duration: 0.9, ease: EASE.outExpo },
              },
            }}
          >
            {/* Trailing space keeps copied text readable across masked line
                breaks ("scale of a table", not "scaleof a table"). */}
            {line || " "}
            {i < lines.length - 1 ? " " : null}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
