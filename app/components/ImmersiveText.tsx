"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface ImmersiveTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
  delay?: number;
}

export function ImmersiveText({
  text,
  className = "",
  as = "div",
  delay = 0,
}: ImmersiveTextProps) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
    margin: "-50px",
  });

  const characters = text.split("");
  const Element = motion[as as keyof typeof motion] || motion.div;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: delay,
      },
    },
  };

  const charVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      rotateZ: -10,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateZ: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  };

  return (
    <Element
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {characters.map((char, idx) => (
        <motion.span key={idx} variants={charVariants} className="inline-block">
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </Element>
  );
}
