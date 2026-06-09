import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ScrollProgress } from "./components/ScrollProgress";
import { ScrollHint } from "./components/ScrollHint";
import { CursorGlow } from "./components/CursorGlow";
import { PageIntro } from "./components/PageIntro";
import { AmbientBackground } from "./components/AmbientBackground";
import { SmoothScroll } from "./components/SmoothScroll";
import { CustomCursor } from "./components/CustomCursor";
import { SectionDots } from "./components/SectionDots";
import { MouseTrail } from "./components/MouseTrail";
import { ShaderBackground } from "./components/ShaderBackground";
import { DynamicTitle } from "./components/DynamicTitle";
import { MagneticElements } from "./components/MagneticElements";
import { ScrollVelocityBlur } from "./components/ScrollVelocityBlur";
import { DotGrid } from "./components/DotGrid";
import { HoverPreview } from "./components/HoverPreview";
import { AvailabilityBadge } from "./components/AvailabilityBadge";
import { RippleEffect } from "./components/RippleEffect";
import { TimeOfDayTheme } from "./components/TimeOfDayTheme";
import { ScrollStopBounce } from "./components/ScrollStopBounce";
import { EdgeGlow } from "./components/EdgeGlow";
import { SparkTrail } from "./components/SparkTrail";
import { ContentBrightness } from "./components/ContentBrightness";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sagar Jain - Applied AI Engineer",
  description:
    "Founder of valocoach.ai - AI-powered coaching platform for competitive gamers. 20K+ users, 1M+ monthly impressions.",
  openGraph: {
    title: "Sagar Jain - Applied AI Engineer",
    description:
      "Founder of valocoach.ai. 20K+ users, 1M+ monthly impressions. Building AI coaching infrastructure for competitive gaming.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} relative overflow-x-hidden`} role="document" aria-label="Sagar Jain portfolio">
        <SmoothScroll />
        <DynamicTitle />
        <CustomCursor />
        <MouseTrail />
        <MagneticElements />
        <ScrollVelocityBlur />
        <DotGrid />
        <HoverPreview />
        <AvailabilityBadge />
        <RippleEffect />
        <TimeOfDayTheme />
        <ScrollStopBounce />
        <EdgeGlow />
        <SparkTrail />
        <ContentBrightness />
        <PageIntro />
        <ShaderBackground />
        <AmbientBackground />
        <SectionDots />
        <ScrollProgress />
        <ScrollHint />
        <CursorGlow>
          <div className="relative z-10" role="main">
            {children}
          </div>
        </CursorGlow>
      </body>
    </html>
  );
}
