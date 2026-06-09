"use client";

import { useRef, useEffect, useState, ReactNode } from "react";

interface ClipRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ClipReveal({ children, delay = 0, className = "" }: ClipRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setTriggered(true), delay * 1000);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div
        style={{
          clipPath: triggered ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
          transition: `clip-path 0.9s cubic-bezier(0.77, 0, 0.175, 1) ${delay}s`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
