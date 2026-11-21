"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

import { useImmersiveContext } from "./immersive/ImmersiveProvider";

/**
 * Applies the site's motion setting to every framer-motion animation inside it.
 *
 *  - "auto" (the default): framer reads the visitor's operating-system setting
 *    itself, and skips slides and scales when the system asks for reduced motion.
 *  - "off" (the in-page switch): framer skips transform animations (slides,
 *    scales) and keeps only fades, so reveals still read as reveals without
 *    anything moving.
 *  - "on" (the in-page switch): framer animates even if the system asks it not to.
 *
 * It must not follow the provider's `motionEnabled` flag. That flag starts as
 * "off" on the server and in the first client render, and framer decides once,
 * when each element mounts, whether to reduce motion. Every element that mounted
 * while hydrating would then stay reduced for good, even though the visitor allows
 * motion. Content is always in the DOM, so nothing is hidden from screen readers
 * or search engines either way.
 */
export function MotionPolicy({ children }: { children: ReactNode }) {
  const { motionOverride } = useImmersiveContext();
  const reducedMotion =
    motionOverride === "off" ? "always" : motionOverride === "on" ? "never" : "user";

  return <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>;
}
