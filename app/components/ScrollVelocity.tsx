"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface ScrollVelocityProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollVelocity({ children, className = "" }: ScrollVelocityProps) {
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const lastScrollYRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      const scrollY = window.scrollY;
      const timeDelta = now - lastTimeRef.current;
      
      if (timeDelta > 0) {
        const velocity = (scrollY - lastScrollYRef.current) / timeDelta;
        setScrollVelocity(velocity);
      }

      lastScrollYRef.current = scrollY;
      lastTimeRef.current = now;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      className={className}
      animate={{
        opacity: [0.8, 1, 0.8],
      }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        delay: Math.abs(scrollVelocity) * 0.1,
      }}
    >
      {children}
    </motion.div>
  );
}
