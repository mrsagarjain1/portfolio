import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ScrollProgress } from "./components/ScrollProgress";
import { ScrollHint } from "./components/ScrollHint";
import { CursorGlow } from "./components/CursorGlow";
import { PageIntro } from "./components/PageIntro";
import { NeuralMeshBackgroundLazy } from "./components/NeuralMeshBackgroundLazy";
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
import { RippleEffect } from "./components/RippleEffect";
import { ScrollStopBounce } from "./components/ScrollStopBounce";
import { EdgeGlow } from "./components/EdgeGlow";
import { SparkTrail } from "./components/SparkTrail";
import { MotionToggle } from "./components/MotionToggle";
import { ImmersiveProvider } from "./components/immersive/ImmersiveProvider";
import { PerformanceGovernor } from "./components/immersive/PerformanceGovernor";
import { links, seo, site } from "./lib/content";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: seo.title,
    template: "%s | Sagar Jain"
  },
  description: seo.description,
  keywords: seo.keywords,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  // The share-card image comes from app/opengraph-image.tsx and
  // app/twitter-image.tsx, so the numbers on it always match the content file.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    title: seo.title,
    description: seo.openGraphDescription,
    siteName: seo.siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: seo.twitterTitle,
    description: seo.twitterDescription,
    creator: seo.twitterHandle,
  },
  alternates: {
    canonical: site.url,
  },
  other: {
    "google-site-verification": "Pc4Vgac32FHmsYB2jgg4SY7NatF2Ng3F42w8IdeO6y4",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: "mrsagarjain",
  url: site.url,
  jobTitle: "Applied AI Engineer",
  description: seo.description,
  sameAs: [links.github, links.linkedin, links.x],
  knowsAbout: seo.knowsAbout,
  worksFor: [
    {
      "@type": "Organization",
      name: "Neural Stats Private Limited",
      url: "https://www.valocoach.ai",
      brand: { "@type": "Brand", name: "ValoCoach.ai" },
    },
    {
      "@type": "Organization",
      name: "Aadvik TekLabs Pvt. Ltd.",
    },
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Apex Professional University",
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
            __html: JSON.stringify(personJsonLd),
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
          <RippleEffect />
          <ScrollStopBounce />
          <EdgeGlow />
          <SparkTrail />
          <PageIntro />
          <NeuralMeshBackgroundLazy />
          <SectionDots />
          <ScrollProgress />
          <ScrollHint />
          <MotionToggle />
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
