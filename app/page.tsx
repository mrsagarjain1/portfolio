import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Work from "./components/Work";
import Story from "./components/Story";
import Stack from "./components/Stack";
import Contact from "./components/Contact";
import { GeometryConnector } from "./components/GeometryConnector";
import { MorphingBlob } from "./components/MorphingBlob";

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
      <Work />
      <SectionDivider />
      <Story />
      <SectionDivider />
      <Stack />
      <SectionDivider />
      <Contact />
    </main>
  );
}
