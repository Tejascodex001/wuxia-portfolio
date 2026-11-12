import { useState } from 'react';
import ScrollStage from '@/components/ScrollStage';
import ReadContent from '@/components/ReadContent';
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion';

const Index = () => {
  const reduced = usePrefersReducedMotion();
  const [choice, setChoice] = useState<'play' | 'read' | null>(null);
  const mode = choice ?? (reduced ? 'read' : 'play');

  if (mode === 'read') {
    return (
      <main className="read-wrap">
        <button type="button" className="mini fixed" onClick={() => setChoice('play')}>
          {reduced ? 'PLAY THE SCROLL STORY (MOTION)' : 'PLAY MODE'}
        </button>
        <ReadContent />
      </main>
    );
  }

  return (
    <main>
      <a className="skip" href="#read-fallback" onClick={() => setChoice('read')}>Skip the animation and read the portfolio</a>
      <ScrollStage onRead={() => { window.scrollTo(0, 0); setChoice('read'); }} />
      <div id="read-fallback" className="sr-only"><ReadContent /></div>
    </main>
  );
};

export default Index;
