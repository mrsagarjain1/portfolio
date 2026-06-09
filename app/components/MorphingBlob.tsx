"use client";

import { useEffect, useRef } from "react";

const paths = [
  "M 600 0 C 700 50 800 100 900 80 C 1000 60 1100 30 1200 0 L 1200 100 L 0 100 L 0 0 C 100 30 200 50 300 40 C 400 30 500 10 600 0 Z",
  "M 600 0 C 500 60 400 90 300 70 C 200 50 100 20 0 0 L 0 100 L 1200 100 L 1200 0 C 1100 20 1000 50 900 60 C 800 70 700 40 600 0 Z",
  "M 600 0 C 800 80 900 120 1000 90 C 1100 60 1150 20 1200 0 L 1200 100 L 0 100 L 0 0 C 50 40 150 70 250 50 C 350 30 500 10 600 0 Z",
];

export function MorphingBlob() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % paths.length;
      if (pathRef.current) {
        pathRef.current.style.transition = "d 2s cubic-bezier(0.45, 0, 0.55, 1)";
        pathRef.current.setAttribute("d", paths[index]);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-20 overflow-hidden" aria-hidden="true">
      <svg viewBox="0 0 1200 100" preserveAspectRatio="none" className="w-full h-full">
        <path
          ref={pathRef}
          d={paths[0]}
          fill="rgba(110,231,183,0.03)"
        />
        <path
          d={paths[1]}
          fill="rgba(52,211,153,0.02)"
        />
      </svg>
    </div>
  );
}
