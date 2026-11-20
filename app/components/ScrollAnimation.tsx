"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollAnimationProps {
  children: React.ReactNode;
  delay?: number;
}

export function ScrollAnimation({ children, delay = 0 }: ScrollAnimationProps) {
  const ref = useRef(null);
  // Reveal as soon as the top of the block is inside the upper 80% of the
  // viewport. A percentage-of-height threshold would never fire for a block
  // taller than the screen allows (a long section on a short window), leaving
  // it invisible.
  const isInView = useInView(ref, {
    once: true,
    amount: "some",
    margin: "0px 0px -20% 0px",
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
