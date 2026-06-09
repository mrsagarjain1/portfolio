"use client";

import { motion } from "framer-motion";

export function OrbitingRing() {
  return (
    <motion.div
      className="absolute -inset-4 pointer-events-none"
      animate={{ rotate: 360 }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle
          cx="100" cy="100" r="90"
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="0.8"
          strokeDasharray="80 150"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

export function ProgressRing({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <circle cx="50" cy="50" r="44" fill="none" stroke="#1f1f1f" strokeWidth="1.5" />
      <circle
        cx="50" cy="50" r="44"
        fill="none"
        stroke="#6ee7b7"
        strokeWidth="1.5"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        className="transition-all duration-300"
      />
    </svg>
  );
}
