"use client";

import { motion } from "framer-motion";

interface GlowingTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function GlowingText({ text, className = "", delay = 0 }: GlowingTextProps) {
  const characters = text.split("");

  return (
    <motion.div className={`inline-block ${className}`}>
      {characters.map((char, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: delay + idx * 0.03,
            duration: 0.3,
          }}
          className="inline-block text-[#6ee7b7]"
          animate={{
            textShadow: [
              "0 0 0px rgba(110, 231, 183, 0)",
              "0 0 10px rgba(110, 231, 183, 0.6)",
              "0 0 0px rgba(110, 231, 183, 0)",
            ],
            transition: {
              duration: 2,
              repeat: Infinity,
              delay: idx * 0.05,
            },
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
}
