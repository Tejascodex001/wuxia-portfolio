import { useScrollVars } from '@/hooks/use-scroll-vars';
import Nav from '@/components/Nav';
import CommandMenu from '@/components/CommandMenu';
import Easter from '@/components/Easter';
import Fx from '@/components/Fx';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Work from '@/components/Work';
import Stack from '@/components/Stack';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const Index = () => {
  useScrollVars();

  return (
    <div className="grain relative">
      <Nav />
      <CommandMenu />
      <Easter />
      <Fx />
      <main>
        <Hero />
        <Marquee />
        <Work />
        <Stack />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
