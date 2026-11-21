"use client";

import { motion, type Variants } from "framer-motion";

import { useReducedMotion } from "../hooks/useReducedMotion";
import type { RevealRect } from "../lib/content";

/** Seconds between one piece of a diagram being uncovered and the next. */
const BEAT = 0.34;
/** The diagrams are drawn on this ink colour, so a cover of it hides what is under it. */
const COVER = "#080a09";

/** When a cover starts to shrink, and how it moves, for the beat it belongs to. With motion off it just goes. */
const timing = (at: number, reduced: boolean) =>
  reduced
    ? { duration: 0 }
    : {
        delay: at * BEAT,
        duration: 0.55,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      };

/** A cover shrinks along one axis: "x" uncovers left to right, "y" top to bottom. */
function variantsFor(dir: RevealRect["dir"], reduced: boolean): Variants {
  return dir === "y"
    ? {
        covered: { scaleY: 1 },
        drawn: (at: number) => ({ scaleY: 0, transition: timing(at, reduced) }),
      }
    : {
        covered: { scaleX: 1 },
        drawn: (at: number) => ({ scaleX: 0, transition: timing(at, reduced) }),
      };
}

/**
 * Covers a diagram and uncovers it piece by piece, once, when it scrolls into
 * view, so the picture reads as being drawn in the order it should be read.
 *
 * Each cover shrinks with a transform only. With motion off (the system
 * setting or the page's Motion switch) the covers go away at once, as soon as
 * the picture is in view. The covers are decoration over a picture that
 * already has its own alt text.
 */
export function DrawIn({ rects }: { rects: RevealRect[] }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      data-testid="draw-in"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      initial="covered"
      whileInView="drawn"
      viewport={{ once: true, amount: 0.35 }}
    >
      {rects.map((rect, i) => (
        <motion.span
          key={i}
          custom={rect.at}
          className="absolute"
          style={{
            left: `${rect.x}%`,
            top: `${rect.y}%`,
            width: `${rect.w}%`,
            height: `${rect.h}%`,
            backgroundColor: COVER,
            // Shrink towards the far edge, so the picture is uncovered from the near one.
            transformOrigin: rect.dir === "y" ? "50% 100%" : "100% 50%",
          }}
          variants={variantsFor(rect.dir, reduced)}
        />
      ))}
    </motion.div>
  );
}
