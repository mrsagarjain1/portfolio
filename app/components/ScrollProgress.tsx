"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

import { computeScrollProgress } from "../lib/immersive/scroll";
import { useFrameClock } from "../hooks/useFrameClock";

/**
 * Fixed top-of-viewport scroll progress indicator.
 *
 * Reads the current scroll position inside the shared frame-clock callback and
 * routes it through the pure `computeScrollProgress` helper, which bounds the
 * result to `[0, 100]` for any input (including a not-yet-scrollable document).
 * Because the update happens within the coordination layer's single
 * `requestAnimationFrame` loop, progress is recomputed at most once per
 * animation frame rather than on every raw `scroll` event.
 *
 * _Requirements: 3.2, 7.3_
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  // Track the last published value so we only re-render when it actually
  // changes, avoiding a state update every idle frame.
  const lastProgress = useRef(0);

  const onFrame = useCallback(() => {
    if (typeof window === "undefined") return;

    const doc = document.documentElement;
    const next = computeScrollProgress(
      window.scrollY,
      doc.scrollHeight,
      doc.clientHeight,
    );

    if (next !== lastProgress.current) {
      lastProgress.current = next;
      setProgress(next);
    }
  }, []);

  useFrameClock(onFrame);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6ee7b7] via-[#6ee7b7] to-[#6ee7b7]/50 z-50 origin-left"
      style={{ scaleX: progress / 100 }}
      initial={{ scaleX: 0 }}
      aria-hidden="true"
    />
  );
}
