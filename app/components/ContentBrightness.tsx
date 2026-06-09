"use client";

import { useEffect, useRef, useState } from "react";

export function ContentBrightness() {
  const [active, setActive] = useState("");
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    const sections = ["hero", "work", "story", "stack", "contact"];

    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            timers.current[id] = (timers.current[id] || 0) + 1;
            if (timers.current[id] > 30) setActive(id);
          }
        },
        { threshold: 0.6 }
      );
      obs.observe(el);
      return obs;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-active-section", active);
  }, [active]);

  return null;
}
