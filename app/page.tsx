import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Work from "./components/Work";
import Story from "./components/Story";
import Stack from "./components/Stack";
import Contact from "./components/Contact";
import { MarqueeBand } from "./components/MarqueeBand";

export default function Home() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Navbar />
      <Hero />
      <MarqueeBand />
      <Work />
      <Story />
      <Stack />
      <Contact />
    </main>
  );
}
