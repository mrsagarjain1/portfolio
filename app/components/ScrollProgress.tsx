"use client";

import { motion, useTransform } from "framer-motion";

import { useScrollProgress } from "../hooks/useScrollProgress";
import { rankAt } from "../lib/rank";

/**
 * Thin progress bar fixed to the top of the viewport. It scales with a motion
 * value, so scrolling updates its style directly and re-renders nothing. Its
 * colour follows the rank in the nav badge, so each rank-up is visible here too.
 */
export function ScrollProgress() {
  const progress = useScrollProgress();
  const color = useTransform(progress, (value) => rankAt(value * 100).bar);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left transition-colors duration-300"
      style={{ scaleX: progress, backgroundColor: color }}
      aria-hidden="true"
    />
  );
}
