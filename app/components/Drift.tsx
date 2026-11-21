"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";

import { useReducedMotion } from "../hooks/useReducedMotion";

/** Page scroll, in pixels, over which an item travels its whole distance: about one screen. */
const DRIFT_RANGE = 900;

interface DriftProps {
  children: ReactNode;
  className?: string;
  /** How many pixels higher than the page the item ends up after {@link DRIFT_RANGE} of scrolling. */
  rise: number;
}

/**
 * Lifts its content a little faster than the page as the visitor scrolls away
 * from the top. Items with different `rise` values drift at different speeds,
 * so the hero's photo and cards read as sitting nearer than the paper behind
 * them. Only a transform changes, driven by the scroll position, so nothing
 * re-renders or re-lays out. With motion off the item stays where it is.
 */
export function Drift({ children, className = "", rise }: DriftProps) {
  const { scrollY } = useScroll();
  const reduced = useReducedMotion();
  const y = useTransform(scrollY, [0, DRIFT_RANGE], [0, reduced ? 0 : -rise]);

  return (
    <motion.div className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
