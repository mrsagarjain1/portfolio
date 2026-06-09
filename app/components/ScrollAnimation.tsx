"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollAnimationProps {
  children: React.ReactNode;
  delay?: number;
}

export function ScrollAnimation({ children, delay = 0 }: ScrollAnimationProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

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
