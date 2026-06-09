"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: string;
  duration?: number;
}

export function AnimatedCounter({ value, duration = 2 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;

    // Extract number from value (e.g., "20K+" -> 20)
    const numericString = value.replace(/[^\d]/g, "");
    const targetNumber = parseInt(numericString, 10);

    if (isNaN(targetNumber)) {
      setDisplayValue(value);
      return;
    }

    const suffix = value.replace(/\d/g, "");
    let currentNumber = 0;
    const increment = targetNumber / (duration * 60); // 60fps

    const timer = setInterval(() => {
      currentNumber += increment;
      if (currentNumber >= targetNumber) {
        setDisplayValue(`${targetNumber}${suffix}`);
        clearInterval(timer);
      } else {
        setDisplayValue(`${Math.floor(currentNumber)}${suffix}`);
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {displayValue}
    </motion.div>
  );
}
