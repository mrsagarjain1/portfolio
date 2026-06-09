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
import { GlitchTransition } from "./components/GlitchTransition";
import { PerspectiveScroll } from "./components/PerspectiveScroll";
import { MouseTrail } from "./components/MouseTrail";
import { ShaderBackground } from "./components/ShaderBackground";

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
      <body className={`${inter.className} relative overflow-x-hidden`}>
        <SmoothScroll />
        <CustomCursor />
        <MouseTrail />
        <PageIntro />
        <ShaderBackground />
        <AmbientBackground />
        <SectionDots />
        <GlitchTransition />
        <ScrollProgress />
        <ScrollHint />
        <PerspectiveScroll>
          <CursorGlow>
            <div className="relative z-10">
              {children}
            </div>
          </CursorGlow>
        </PerspectiveScroll>
      </body>
    </html>
  );
}
