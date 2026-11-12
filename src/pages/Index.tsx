import { useScrollVars } from '@/hooks/use-scroll-vars';
import Sky from '@/components/Sky';
import InkCanvas from '@/components/InkCanvas';
import Cursor from '@/components/Cursor';
import Nav from '@/components/Nav';
import CommandMenu from '@/components/CommandMenu';
import Easter from '@/components/Easter';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Journey from '@/components/Journey';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Particles from '@/components/Particles';
import Preloader from '@/components/Preloader';
import Fx from '@/components/Fx';

const Index = () => {
  useScrollVars();

  return (
    <div className="grain relative">
      <Preloader />
      <Sky />
      <Particles />
      <InkCanvas />
      <Cursor />
      <Nav />
      <CommandMenu />
      <Easter />
      <Fx />
      <main className="skew-on-scroll relative z-10">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Journey />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
