"use client";

import { useState, useEffect } from "react";
import { GitHubCalendar } from 'react-github-calendar';

export function GitHubHeatmap() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Custom theme to match the website's dark green aesthetics
  const explicitTheme = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#0a0a0a', '#0f2618', '#1e5c30', '#288040', '#6ee7b7'],
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
    <div className="w-full py-2">
      <GitHubCalendar 
        username="mrsagarjain1" 
        colorScheme="dark"
        theme={explicitTheme}
        fontSize={12}
        blockMargin={4}
        blockSize={10}
      />
    </div>
  );
}
