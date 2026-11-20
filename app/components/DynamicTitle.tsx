"use client";

import { useEffect } from "react";

import { sectionTitles } from "../lib/content";

export function DynamicTitle() {
  useEffect(() => {
    const sections = Object.keys(sectionTitles);
    const base = sectionTitles.hero;
    document.title = base;

    // A section is "current" while it crosses the middle of the viewport. A
    // visible-percentage threshold would never fire for a section taller than
    // the screen allows.
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            document.title = sectionTitles[entry.target.id] ?? base;
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  return null;
}
