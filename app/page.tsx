import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Work from "./components/Work";
import Story from "./components/Story";
import Stack from "./components/Stack";
import Contact from "./components/Contact";
import { GeometryConnector } from "./components/GeometryConnector";
import { MorphingBlob } from "./components/MorphingBlob";
import { SectionTransition } from "./components/SectionTransition";
import { ScrollDepth } from "./components/ScrollDepth";
import { ParallaxSection } from "./components/ParallaxSection";
import { WaveSection } from "./components/WaveSection";

function SectionDivider() {
  return <GeometryConnector />;
}

export default function Home() {
  return (
    <main className="bg-transparent min-h-screen" role="main" aria-label="Portfolio content">
      <Navbar />
      <Hero />
      <MorphingBlob />
      <SectionDivider />
      {/* Work: entrance transition (category C) */}
      <SectionTransition>
        <Work />
      </SectionTransition>
      <SectionDivider />
      {/* Story: heading reveal is applied inside Story via ImmersiveText */}
      <Story />
      {/* Story -> Stack boundary: animated wave divider complementing the connector */}
      <WaveSection>
        <SectionDivider />
      </WaveSection>
      {/* Stack: subtle scroll-driven depth tilt (category A) */}
      <ScrollDepth>
        <Stack />
      </ScrollDepth>
      <SectionDivider />
      {/* Contact: gentle parallax lift (category A) */}
      <ParallaxSection>
        <Contact />
      </ParallaxSection>
    </main>
  );
}
