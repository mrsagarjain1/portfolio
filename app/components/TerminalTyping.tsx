"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TerminalTypingProps {
  lines: string[];
  className?: string;
  startDelay?: number;
  typeSpeed?: number;
}

export function TerminalTyping({
  lines,
  className = "",
  startDelay = 2000,
  typeSpeed = 60,
}: TerminalTypingProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const start = setTimeout(() => setVisible(true), startDelay);
    return () => clearTimeout(start);
  }, [startDelay]);

  useEffect(() => {
    if (!visible || currentLine >= lines.length) return;
    if (currentChar >= lines[currentLine].length) {
      const next = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 400);
      return () => clearTimeout(next);
    }
    const timer = setTimeout(() => {
      setCurrentChar((c) => c + 1);
    }, typeSpeed);
    return () => clearTimeout(timer);
  }, [currentChar, currentLine, lines, visible, typeSpeed]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`font-mono text-xs text-[#6ee7b7]/70 ${className}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {lines.map((line, li) => {
            if (li > currentLine) return null;
            const chars =
              li < currentLine
                ? line
                : line.slice(0, currentChar);
            return (
              <div key={li} className="flex items-baseline gap-2">
                <span className="text-[#6ee7b7]/40 select-none">$</span>
                <span>{chars}</span>
                {li === currentLine && (
                  <motion.span
                    className="inline-block w-2 h-3.5 bg-[#6ee7b7] ml-0.5"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                )}
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
