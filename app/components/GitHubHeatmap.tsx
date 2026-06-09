"use client";

import { useState, useEffect, useRef } from "react";
import { GitHubCalendar } from 'react-github-calendar';

export function GitHubHeatmap() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 640);
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Keep scrolling to the right edge while the calendar fetches data
    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
      }
    }, 200);
    // Stop trying after 3 seconds
    const timeout = setTimeout(() => clearInterval(interval), 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [mounted]);

  // Custom theme to match the website's dark green aesthetics
  const explicitTheme = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#0a0a0a', '#0f2618', '#1e5c30', '#288040', '#6ee7b7'],
  };

  // On mobile, only show the last ~5 months so it fits
  const selectLastMonths = (contributions: Array<{ date: string; count: number; level: number }>) => {
    if (!isMobile) return contributions;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 5);
    return contributions.filter((day) => new Date(day.date) >= cutoff);
  };

  if (!mounted) {
    return (
      <div className="w-full py-2">
        {/* Simple skeleton loader for SSR */}
        <div className="w-full h-[120px] rounded-sm bg-[#111] animate-pulse border border-[#222]"></div>
      </div>
    );
  }

  return (
    <div className="w-full py-2 overflow-x-auto scrollbar-hide" ref={scrollRef}>
      <div className="min-w-max pr-2">
        <GitHubCalendar 
          username="mrsagarjain1" 
          colorScheme="dark"
          theme={explicitTheme}
          fontSize={isMobile ? 10 : 12}
          blockMargin={isMobile ? 3 : 4}
          blockSize={isMobile ? 8 : 10}
          transformData={selectLastMonths}
        />
      </div>
    </div>
  );
}
