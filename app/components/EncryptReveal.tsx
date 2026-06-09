"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

interface EncryptRevealProps {
  text: string;
  className?: string;
  as?: "span" | "h2" | "h3" | "p";
}

export function EncryptReveal({ text, className = "", as: Tag = "span" }: EncryptRevealProps) {
  const [displayed, setDisplayed] = useState(text);
  const [triggered, setTriggered] = useState(false);

  const scramble = useCallback(() => {
    if (triggered) return;
    setTriggered(true);
    const steps = 15;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setDisplayed(
        text.split("").map((char, i) => {
          if (char === " ") return " ";
          if (i / text.length < step / steps) return char;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join("")
      );
      if (step >= steps) { clearInterval(interval); setDisplayed(text); }
    }, 40);
  }, [text, triggered]);

  return (
    <motion.span
      onMouseEnter={scramble}
      className={className}
    >
      {displayed}
    </motion.span>
  );
}
