"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const sections = [
  { id: "hero", label: "Home" },
  { id: "work", label: "Work" },
  { id: "story", label: "Story" },
  { id: "stack", label: "Stack" },
  { id: "contact", label: "Contact" },
];

export function SectionDots() {
  const [active, setActive] = useState("hero");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { threshold: 0.45 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    // Show dots only after first scroll
    const onScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observers.forEach((o) => o.disconnect());
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <motion.div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 20 }}
      transition={{ duration: 0.4 }}
    >
      {sections.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          title={label}
          className="group flex items-center gap-2 justify-end"
        >
          <span className="text-xs text-[#6ee7b7] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {label}
          </span>
          <motion.span
            className="block rounded-full bg-[#6ee7b7] transition-all duration-300"
            animate={{
              width: active === id ? 20 : 6,
              height: active === id ? 6 : 6,
              opacity: active === id ? 1 : 0.3,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </a>
      ))}
    </motion.div>
  );
}
