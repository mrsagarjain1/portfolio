"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScrollImageSequenceProps {
  frames: string[];
  className?: string;
}

export function ScrollImageSequence({ frames, className = "" }: ScrollImageSequenceProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % frames.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [frames.length]);

  return (
    <div className={`relative rounded-2xl border border-[#1f1f1f] overflow-hidden bg-[#0a0a0a] ${className}`} style={{ width: "100%", aspectRatio: "16/9" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="absolute inset-0"
          style={{ background: frames[current] }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </AnimatePresence>
    </div>
  );
}
