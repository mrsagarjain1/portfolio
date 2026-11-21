"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { sections } from "../lib/content";

export function SectionDots() {
  const [active, setActive] = useState("hero");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      // Active while the section crosses the middle of the viewport, so tall
      // sections still register.
      const obs = new IntersectionObserver(
        (entries) => {
          // One target per observer: the last entry is its latest state.
          if (entries[entries.length - 1]?.isIntersecting) setActive(id);
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
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
      className="hidden md:flex fixed right-3 top-1/2 -translate-y-1/2 z-50 flex-col gap-3"
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
          <span className="font-mono text-[0.7rem] text-red bg-paper px-1.5 py-0.5 tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {label}
          </span>
          <motion.span
            className="block rounded-full bg-red ring-1 ring-[#eee9e5]/70 transition-all duration-300"
            animate={{
              width: active === id ? 20 : 6,
              height: active === id ? 6 : 6,
              opacity: active === id ? 1 : 0.45,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </a>
      ))}
    </motion.div>
  );
}
