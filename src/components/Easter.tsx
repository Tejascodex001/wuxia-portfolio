import { useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

const CODE = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
};

/** Konami code: detonates every particle word, three times, and says so politely. */
const Easter = () => {
  useEffect(() => {
    let pos = 0;
    const timers: number[] = [];

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target) || document.querySelector('[cmdk-root]')) {
        pos = 0;
        return;
      }
      const key = e.key.toLowerCase();
      if (key === CODE[pos]) pos += 1;
      else pos = key === CODE[0] ? 1 : 0;

      if (pos === CODE.length) {
        pos = 0;
        [0, 250, 500].forEach((ms) =>
          timers.push(window.setTimeout(() => window.dispatchEvent(new Event('particles-burst')), ms)),
        );
        toast('Konami accepted', {
          description: '30 extra lives granted. None of them will be needed, but the particles appreciate the gesture.',
        });
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return null;
};

export default Easter;
