"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * Applies the site's motion setting to every framer-motion animation inside it.
 *
 * `useReducedMotion` already folds in the visitor's OS preference and the
 * in-page "Motion on / off" switch. When motion is off, framer skips transform
 * animations (slides, scales) and keeps only fades, so reveals still read as
 * reveals without anything moving. Content is always in the DOM, so nothing is
 * hidden from screen readers or search engines either way.
 */
export function MotionPolicy({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <MotionConfig reducedMotion={reduced ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}
