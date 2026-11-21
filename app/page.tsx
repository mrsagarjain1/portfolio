import About from "./components/About";
import Contact from "./components/Contact";
import Experience from "./components/Experience";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Projects from "./components/Projects";
import { SkillFocusProvider } from "./components/SkillFocus";

/**
 * One page, five sections, in the order a visitor reads them:
 * who I am, what I built, where I worked, how to reach me.
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-transparent" aria-label="Portfolio content">
      <SkillFocusProvider>
        <Navbar />
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Contact />
      </SkillFocusProvider>
    </main>
  );
}
