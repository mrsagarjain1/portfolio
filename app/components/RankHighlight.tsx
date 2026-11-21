"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { useReducedMotion } from "../hooks/useReducedMotion";
import { RANKS } from "../lib/rank";

/** The whole rank ladder as one gradient, Iron on the left to Immortal on the right. */
const LADDER = `linear-gradient(90deg, ${RANKS.map((rank) => rank.bar).join(", ")})`;

/**
 * A phrase underlined by the rank ladder. The line draws from left to right,
 * once, when the phrase scrolls into view. With motion off (the system setting
 * or the page's Motion switch) the line appears at once. The words stay plain
 * text in the paragraph.
 */
export function RankHighlight({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <span className="relative whitespace-nowrap font-semibold text-text">
      {children}
      <motion.span
        aria-hidden="true"
        data-testid="rank-highlight-line"
        className="pointer-events-none absolute inset-x-0 -bottom-[0.2em] h-[0.2em] origin-left rounded-full"
        style={{ backgroundImage: LADDER }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: "all" }}
        transition={{ duration: reduced ? 0 : 1.4, ease: "easeOut" }}
      />
    </span>
  );
}
