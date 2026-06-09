import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Work from "./components/Work";
import Story from "./components/Story";
import Stack from "./components/Stack";
import Contact from "./components/Contact";
import { SVGLineDraw } from "./components/SVGLineDraw";

export default function Home() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Navbar />
      <Hero />
      <SVGLineDraw
        lines={[
          { path: "M 200 0 Q 400 150 600 0 T 1000 0", color: "#6ee7b7", width: 1.5 },
          { path: "M 300 50 Q 500 200 700 50 T 1100 50", color: "#34d399", width: 1 },
        ]}
        className="relative z-10 -my-4 opacity-30"
        viewBox="0 0 1200 200"
      />
      <Work />
      <SVGLineDraw
        lines={[
          { path: "M 800 0 Q 600 150 400 0 T 0 0", color: "#a78bfa", width: 1.5 },
        ]}
        className="relative z-10 -my-4 opacity-20"
        viewBox="0 0 1200 150"
      />
      <Story />
      <Stack />
      <Contact />
    </main>
  );
}
