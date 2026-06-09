"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sectionColors: Record<string, string> = {
  hero:    "radial-gradient(ellipse 80vw 60vh at 60% 30%, rgba(110,231,183,0.05) 0%, transparent 70%)",
  work:    "radial-gradient(ellipse 80vw 60vh at 30% 50%, rgba(96,165,250,0.05) 0%, transparent 70%)",
  story:   "radial-gradient(ellipse 80vw 60vh at 70% 60%, rgba(167,139,250,0.05) 0%, transparent 70%)",
  stack:   "radial-gradient(ellipse 80vw 60vh at 40% 40%, rgba(251,191,36,0.04) 0%, transparent 70%)",
  contact: "radial-gradient(ellipse 80vw 60vh at 60% 70%, rgba(110,231,183,0.06) 0%, transparent 70%)",
};

export function AmbientBackground() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const sections = ["hero", "work", "story", "stack", "contact"];
    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0"
      animate={{ background: sectionColors[activeSection] ?? sectionColors.hero }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    />
  );
}
