"use client";

import { useEffect } from "react";

const titles: Record<string, string> = {
  hero: "Sagar Jain — Applied AI Engineer",
  work: "Sagar Jain — valocoach.ai",
  story: "Sagar Jain — Origin Story",
  stack: "Sagar Jain — Tech Stack",
  contact: "Sagar Jain — Let's Build",
};

export function DynamicTitle() {
  useEffect(() => {
    const sections = ["hero", "work", "story", "stack", "contact"];
    const base = "Sagar Jain — Applied AI Engineer";
    document.title = base;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          document.title = titles[entry.target.id] ?? base;
        }
      },
      { threshold: 0.5 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  return null;
}
