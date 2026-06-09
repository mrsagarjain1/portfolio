import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Work from "./components/Work";
import Story from "./components/Story";
import Stack from "./components/Stack";
import Contact from "./components/Contact";

export default function Home() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Navbar />
      <Hero />
      <Work />
      <Story />
      <Stack />
      <Contact />
    </main>
  );
}
