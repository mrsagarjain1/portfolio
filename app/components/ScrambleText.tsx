"use client";

import { useState, useCallback, ReactNode } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

interface ScrambleTextProps {
  text: string;
  className?: string;
  as?: "span" | "div" | "h1" | "h2" | "h3" | "p";
  duration?: number;
}

export function ScrambleText({
  text,
  className = "",
  as: Tag = "span",
  duration = 600,
}: ScrambleTextProps) {
  const [displayed, setDisplayed] = useState(text);
  const intervalRef = useCallback(() => {}, []);

  const scramble = useCallback(() => {
    const steps = 12;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      setDisplayed(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i / text.length < progress) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );
      if (step >= steps) {
        clearInterval(interval);
        setDisplayed(text);
      }
    }, duration / steps);
  }, [text, duration]);

  return (
    <Tag
      className={`cursor-default ${className}`}
      onMouseEnter={scramble}
    >
      {displayed}
    </Tag>
  );
}
