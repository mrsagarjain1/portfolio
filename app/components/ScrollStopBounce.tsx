"use client";

import { useEffect, useRef } from "react";

export function ScrollStopBounce() {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      document.body.classList.add("scrolling");
      document.body.classList.remove("scroll-stopped");
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      timeout.current = setTimeout(() => {
        document.body.classList.remove("scrolling");
        document.body.classList.add("scroll-stopped");
        setTimeout(() => document.body.classList.remove("scroll-stopped"), 400);
      }, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (timeout.current) clearTimeout(timeout.current); };
  }, []);

  return null;
}
