"use client";

import { motion } from "framer-motion";

import { useScrollProgress } from "../hooks/useScrollProgress";

/**
 * Thin progress bar fixed to the top of the viewport. It scales with a motion
 * value, so scrolling updates its style directly and re-renders nothing.
 */
export function ScrollProgress() {
  const progress = useScrollProgress();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-red z-[60] origin-left"
      style={{ scaleX: progress }}
      aria-hidden="true"
    />
  );
}
