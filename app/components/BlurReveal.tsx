"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

interface BlurRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export function BlurReveal({ text, className = "", delay = 0 }: BlurRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const words = text.split(" ");

  return (
    <motion.span ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={
            isInView ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(10px)" }
          }
          transition={{
            duration: 0.6,
            delay: delay + i * 0.05,
            ease: "easeOut",
          }}
          className="inline-block"
        >
          {word}&nbsp;
        </motion.span>
      ))}
    </motion.span>
  );
}
