import type { Metadata } from "next";
import { DM_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { DynamicTitle } from "./components/DynamicTitle";
import { MotionPolicy } from "./components/MotionPolicy";
import { MotionToggle } from "./components/MotionToggle";
import { ScrollProgress } from "./components/ScrollProgress";
import { SectionDots } from "./components/SectionDots";
import { ImmersiveProvider } from "./components/immersive/ImmersiveProvider";
import { links, seo, site } from "./lib/content";

// Display type is Montserrat Bold, labels are DM Mono, body copy is plain Arial.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-montserrat",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-mono",
  display: "swap",
});

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
    <html lang="en">
      <body suppressHydrationWarning className={`${montserrat.variable} ${dmMono.variable} relative overflow-x-clip`} role="document" aria-label="Sagar Jain portfolio">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd),
          }}
        />
        <ImmersiveProvider>
          <MotionPolicy>
            <DynamicTitle />
            <SectionDots />
            <ScrollProgress />
            <MotionToggle />
            <div className="relative z-10">{children}</div>
          </MotionPolicy>
        </ImmersiveProvider>
      </body>
    </html>
  );
}
