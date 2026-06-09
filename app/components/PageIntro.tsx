"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function PageIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Block scroll during intro
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, 1800);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#0a0a0a]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
        >
          {/* Teal accent line sweeping in from left */}
          <motion.div
            className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-[#6ee7b7] to-transparent"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Logo reveal */}
          <div className="flex flex-col items-center gap-3 overflow-hidden">
            <motion.div
              className="text-3xl font-semibold tracking-tight text-[#e8e8e8]"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              Sagar Jain
            </motion.div>
            <motion.div
              className="text-sm text-[#6ee7b7] tracking-widest uppercase"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
            >
              Applied AI Engineer
            </motion.div>
            {/* Loading bar */}
            <motion.div className="mt-4 w-32 h-px bg-[#1f1f1f] relative overflow-hidden rounded-full">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#6ee7b7] to-[#34d399]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.6, ease: "easeInOut" }}
              />
            </motion.div>
          </div>

          {/* Bottom accent line */}
          <motion.div
            className="absolute bottom-0 right-0 h-0.5 bg-gradient-to-l from-transparent via-[#6ee7b7] to-transparent"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
