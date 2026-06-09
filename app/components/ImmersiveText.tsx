"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ImmersiveTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
  delay?: number;
}

export function ImmersiveText({
  text,
  className = "",
  as = "div",
  delay = 0,
}: ImmersiveTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.5, rootMargin: "-50px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const characters = text.split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: delay,
      },
    },
  };

  const charVariants = {
    hidden: { opacity: 0, y: 20, rotateZ: -10 },
    visible: {
      opacity: 1,
      y: 0,
      rotateZ: 0,
      transition: { type: "spring" as const, stiffness: 200, damping: 20 },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {characters.map((char, idx) => (
        <motion.span key={idx} variants={charVariants} className="inline-block">
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
}
