import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Work from "./components/Work";
import Story from "./components/Story";
import Stack from "./components/Stack";
import Contact from "./components/Contact";
import { GeometryConnector } from "./components/GeometryConnector";

function SectionDivider() {
  return <GeometryConnector />;
}

export default function Home() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen" role="main" aria-label="Portfolio content">
      <Navbar />
      <Hero />
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
