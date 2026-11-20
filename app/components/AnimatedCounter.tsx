"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "../hooks/useReducedMotion";

interface AnimatedCounterProps {
  value: string;
  duration?: number;
}

/**
 * Counts a value such as "25K+" up from zero the first time it scrolls into view.
 *
 * The real value is what the server renders and what shows whenever the count-up
 * is not running (before it starts, after it ends, with reduced motion, or with
 * scripts off), so search engines, link previews and no-JS visitors never see a
 * placeholder zero.
 */
export function AnimatedCounter({ value, duration = 2 }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  // null means "show the real value"; a string is the in-flight count-up frame.
  const [frame, setFrame] = useState<string | null>(null);

  useEffect(() => {
    const element = ref.current;
    const target = parseInt(value.replace(/[^\d]/g, ""), 10);
    if (
      !element ||
      reducedMotion ||
      Number.isNaN(target) ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const suffix = value.replace(/\d/g, "");
    let raf = 0;
    let startedAt = 0;

    const step = (now: number) => {
      if (!startedAt) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / (duration * 1000));
      if (progress >= 1) {
        setFrame(null);
        return;
      }
      const eased = 1 - Math.pow(1 - progress, 3);
      setFrame(`${Math.floor(eased * target)}${suffix}`);
      raf = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setFrame(`0${suffix}`);
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, reducedMotion]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {reducedMotion ? value : (frame ?? value)}
    </motion.div>
  );
}
