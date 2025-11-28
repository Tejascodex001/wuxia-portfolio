import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import mountains from '@/assets/mountains.png';

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToNext = () => {
    const nextSection = document.getElementById('about');
    nextSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden rice-paper">
      {/* Parallax Mountains Background */}
      <div 
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url(${mountains})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />

      {/* Drifting Fog Layers */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-wuxia-paper/40 to-transparent opacity-60 fog-drift"
          style={{ transform: `translateX(${scrollY * 0.1}px)` }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-transparent via-wuxia-paper/30 to-transparent opacity-50 fog-drift-reverse"
          style={{ transform: `translateX(${-scrollY * 0.15}px)` }}
        />
      </div>

      {/* Floating Bamboo Decoration */}
      <div className="absolute top-10 right-10 opacity-20 float-animation z-[2]">
        <div className="w-32 h-64 bg-gradient-to-b from-wuxia-shadow to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto fade-up">
        <div className="mb-8">
          <h1 className="text-7xl md:text-9xl font-calligraphy text-wuxia-ink mb-4 calligraphy-stroke relative" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
            Tejas
          </h1>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-transparent via-wuxia-crimson to-transparent ink-brush" />
        </div>

        <h2 className="text-2xl md:text-4xl font-calligraphy text-wuxia-crimson mb-6 opacity-0" style={{ animation: 'fade-up 0.8s ease-out 0.3s forwards' }}>
          Wanderer of Code
        </h2>

        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto opacity-0" style={{ animation: 'fade-up 0.8s ease-out 0.6s forwards' }}>
          Practitioner of AI · DSA · C++ · ML Arts
        </p>

        <Button 
          onClick={scrollToNext}
          size="lg"
          className="bg-wuxia-crimson hover:bg-wuxia-crimson/90 text-wuxia-paper font-semibold px-8 py-6 text-lg rounded-none border-2 border-wuxia-ink shadow-lg transition-all hover:shadow-2xl hover:scale-105 opacity-0"
          style={{ animation: 'fade-up 0.8s ease-out 0.9s forwards' }}
        >
          Enter the Jianghu
        </Button>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 opacity-0" style={{ animation: 'fade-up 0.8s ease-out 1.2s forwards' }}>
          <div className="w-6 h-10 border-2 border-wuxia-ink rounded-full flex justify-center">
            <div className="w-1 h-3 bg-wuxia-crimson rounded-full mt-2 animate-float" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
