"use client";

import { useEffect } from "react";

export function TimeOfDayTheme() {
  useEffect(() => {
    const update = () => {
      const hour = new Date().getHours();
      // 6am=0°, 12pm=180°, 6pm=360° — map to hue shift
      const progress = (hour - 6) / 12;
      const hue = 160 + Math.sin(progress * Math.PI) * 20; // 160-180 (teal-emerald)
      document.documentElement.style.setProperty("--accent-hue", `${hue}`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
