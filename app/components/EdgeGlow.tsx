"use client";

import { useEffect, useRef } from "react";

export function EdgeGlow() {
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const dy = window.scrollY - lastY.current;
      document.body.classList.remove("scrolling-up", "scrolling-down", "edge-glow-top", "edge-glow-bottom");
      if (dy > 0) { document.body.classList.add("scrolling-down", "edge-glow-top"); }
      if (dy < 0) { document.body.classList.add("scrolling-up", "edge-glow-bottom"); }
      lastY.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.classList.remove("edge-glow-top", "edge-glow-bottom");
    };
  }, []);

  return null;
}
