import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ScrollProgress } from "./components/ScrollProgress";
import { ScrollHint } from "./components/ScrollHint";
import { CursorGlow } from "./components/CursorGlow";
import { PageIntro } from "./components/PageIntro";
import { NeuralMeshBackground } from "./components/NeuralMeshBackground";
import { SmoothScroll } from "./components/SmoothScroll";
import { CustomCursor } from "./components/CustomCursor";
import { SectionDots } from "./components/SectionDots";
import { MouseTrail } from "./components/MouseTrail";
import { PerspectiveScroll } from "./components/PerspectiveScroll";
import { GlitchTransition } from "./components/GlitchTransition";

import { DynamicTitle } from "./components/DynamicTitle";
import { MagneticElements } from "./components/MagneticElements";
import { ScrollVelocityBlur } from "./components/ScrollVelocityBlur";

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
  metadataBase: new URL("https://mrsagarjain.com"),
  title: {
    default: "Sagar Jain | Applied AI Engineer",
    template: "%s | Sagar Jain"
  },
  description:
    "Portfolio of Sagar Jain, an Applied AI Engineer and Founder of valocoach.ai. Specializing in AI-powered applications, machine learning, and scalable platforms.",
  keywords: ["Sagar Jain", "mrsagarjain", "Applied AI Engineer", "AI Developer", "valocoach.ai", "Software Engineer", "Machine Learning", "Portfolio"],
  authors: [{ name: "Sagar Jain", url: "https://mrsagarjain.com" }],
  creator: "Sagar Jain",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mrsagarjain.com",
    title: "Sagar Jain | Applied AI Engineer",
    description:
      "Founder of valocoach.ai. 20K+ users, 1M+ monthly impressions. Building AI coaching infrastructure for competitive gaming.",
    siteName: "Sagar Jain Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sagar Jain | Applied AI Engineer",
    description: "Portfolio of Sagar Jain, an Applied AI Engineer and Founder of valocoach.ai.",
    creator: "@mrsagarjain1",
  },
  alternates: {
    canonical: "https://mrsagarjain.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body suppressHydrationWarning className={`${inter.className} relative overflow-x-hidden`} role="document" aria-label="Sagar Jain portfolio">
        <SmoothScroll />
        <DynamicTitle />
        <CustomCursor />
        <MouseTrail />
        <MagneticElements />
        <ScrollVelocityBlur />

        <HoverPreview />
        <AvailabilityBadge />
        <RippleEffect />
        <TimeOfDayTheme />
        <ScrollStopBounce />
        <EdgeGlow />
        <SparkTrail />
        <ContentBrightness />
        <PageIntro />
        <NeuralMeshBackground />
        <SectionDots />
        <ScrollProgress />
        <ScrollHint />
        <CursorGlow>
          <div className="relative z-10" role="main">
            <PerspectiveScroll>
              <GlitchTransition />
              {children}
            </PerspectiveScroll>
          </div>
        </CursorGlow>
      </body>
    </html>
  );
}
