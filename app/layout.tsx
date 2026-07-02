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
import { ImmersiveProvider } from "./components/immersive/ImmersiveProvider";
import { PerformanceGovernor } from "./components/immersive/PerformanceGovernor";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://mrsagarjain.com"),
  title: {
    default: "Sagar Jain | Applied AI Engineer & Founder of valocoach.ai",
    template: "%s | Sagar Jain"
  },
  description:
    "Sagar Jain is an Applied AI Engineer and Founder of valocoach.ai — the AI coaching platform for competitive gamers. 20K+ users, 1M+ monthly impressions. Specializing in LangChain, Python, FastAPI, and scalable AI products.",
  keywords: [
    "Sagar Jain",
    "sagar jain portfolio",
    "mrsagarjain",
    "Applied AI Engineer",
    "AI Developer",
    "valocoach.ai",
    "valocoach",
    "AI Engineer India",
    "Sagar Jain AI",
    "Sagar Jain developer",
    "Software Engineer",
    "Machine Learning",
    "LangChain developer",
    "competitive gaming AI",
    "Portfolio",
  ],
  authors: [{ name: "Sagar Jain", url: "https://mrsagarjain.com" }],
  creator: "Sagar Jain",
  publisher: "Sagar Jain",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mrsagarjain.com",
    title: "Sagar Jain | Applied AI Engineer & Founder of valocoach.ai",
    description:
      "Sagar Jain — Applied AI Engineer. Founder of valocoach.ai with 20K+ users and 1M+ monthly impressions. Building AI coaching infrastructure for competitive gaming.",
    siteName: "Sagar Jain — Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sagar Jain — Applied AI Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sagar Jain | Applied AI Engineer",
    description: "Applied AI Engineer and Founder of valocoach.ai. Building the default AI coaching infrastructure for competitive gamers.",
    creator: "@mrsagarjain1",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://mrsagarjain.com",
  },
  other: {
    "google-site-verification": "Pc4Vgac32FHmsYB2jgg4SY7NatF2Ng3F42w8IdeO6y4",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Sagar Jain",
              alternateName: "mrsagarjain",
              url: "https://mrsagarjain.com",
              jobTitle: "Applied AI Engineer",
              description:
                "Applied AI Engineer and Founder of valocoach.ai. Building AI coaching infrastructure for competitive gaming.",
              sameAs: [
                "https://github.com/mrsagarjain1",
                "https://www.linkedin.com/in/mrsagarjain1/",
                "https://x.com/mrsagarjain1",
              ],
              knowsAbout: [
                "Artificial Intelligence",
                "Machine Learning",
                "LangChain",
                "Python",
                "FastAPI",
                "Competitive Gaming",
              ],
              founder: {
                "@type": "Organization",
                name: "valocoach.ai",
                url: "https://www.valocoach.ai",
              },
            }),
          }}
        />
        <ImmersiveProvider>
          <PerformanceGovernor />
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
        </ImmersiveProvider>
      </body>
    </html>
  );
}
