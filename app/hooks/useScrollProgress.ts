"use client";

import { useMotionValue, type MotionValue } from "framer-motion";
import { useEffect } from "react";

import { computeScrollProgress } from "../lib/scroll";

/**
 * Scroll progress from 0 (top) to 1 (bottom) as a motion value.
 *
 * Built so scrolling never forces the browser to recompute layout:
 *  - the page height is measured only when the page is resized or its content
 *    changes size (a ResizeObserver on <body>), never in the scroll path;
 *  - the scroll handler only reads `scrollY`, and publishes at most once per
 *    animation frame;
 *  - consumers read a motion value, so changing it updates styles directly
 *    without re-rendering React components.
 */
export function useScrollProgress(): MotionValue<number> {
  const progress = useMotionValue(0);

  useEffect(() => {
    let scrollHeight = 0;
    let viewportHeight = 0;
    let frame = 0;

    const measure = () => {
      const root = document.documentElement;
      scrollHeight = root.scrollHeight;
      // The root element's clientHeight is the visible page height without
      // scrollbars, so `scrollHeight - clientHeight` is exactly how far the
      // page can scroll.
      viewportHeight = root.clientHeight;
    };

    const publish = () => {
      frame = 0;
      progress.set(
        computeScrollProgress(window.scrollY, scrollHeight, viewportHeight) / 100,
      );
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(publish);
    };

    const onResize = () => {
      measure();
      schedule();
    };

    measure();
    publish();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(onResize);
    observer?.observe(document.body);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [progress]);

  return progress;
}
