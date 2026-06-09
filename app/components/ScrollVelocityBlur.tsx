"use client";

import { useEffect, useRef } from "react";

export function ScrollVelocityBlur() {
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const fastTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: no-preference)");
    if (!media.matches) return;

    const onScroll = () => {
      const now = performance.now();
      const dy = Math.abs(window.scrollY - lastY.current);
      const dt = now - lastTime.current;
      const velocity = dt > 0 ? dy / dt : 0;

      // If scrolling fast, add blur class
      if (velocity > 1.2) {
        document.body.classList.add("scrolling-fast");
        clearTimeout(fastTimeout.current);
        fastTimeout.current = setTimeout(() => {
          document.body.classList.remove("scrolling-fast");
        }, 300);
      }

      lastY.current = window.scrollY;
      lastTime.current = now;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(fastTimeout.current);
      document.body.classList.remove("scrolling-fast");
    };
  }, []);

  return null;
}
