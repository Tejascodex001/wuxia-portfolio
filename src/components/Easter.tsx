import { useEffect, useRef, useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const STREAKS = [
  { top: '12%', rot: -24, h: 6, d: 0 },
  { top: '26%', rot: -18, h: 3, d: 90 },
  { top: '40%', rot: -28, h: 9, d: 180 },
  { top: '54%', rot: -20, h: 4, d: 270 },
  { top: '66%', rot: -26, h: 7, d: 360 },
  { top: '80%', rot: -16, h: 3, d: 450 },
  { top: '92%', rot: -22, h: 5, d: 540 },
];

const SHOW_MS = 2800;
const TOTAL_MS = 3600;

const Easter = () => {
  const reduced = usePrefersReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle');
  const timers = useRef<number[]>([]);

  useEffect(() => {
    let progress = 0;
    const clearTimers = () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };

    const trigger = () => {
      toast('Sword Saint unlocked', { description: '剑圣 · The blade answers only to you.' });
      if (reducedRef.current) return;
      window.dispatchEvent(new CustomEvent('ink-burst', { detail: { count: 200 } }));
      clearTimers();
      setPhase('in');
      timers.current.push(
        window.setTimeout(() => setPhase('out'), SHOW_MS),
        window.setTimeout(() => setPhase('idle'), TOTAL_MS),
      );
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) {
        progress = 0;
        return;
      }
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI[progress]) {
        progress += 1;
        if (progress === KONAMI.length) {
          progress = 0;
          trigger();
        }
      } else {
        progress = key === KONAMI[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimers();
    };
  }, []);

  if (phase === 'idle') return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
      style={{ opacity: phase === 'out' ? 0 : 1, transition: 'opacity 0.8s ease' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--ink-black) / 0.55), hsl(var(--ink-black) / 0.15) 70%)',
        }}
      />

      {STREAKS.map((s, i) => (
        <div key={i} className="absolute left-[-10%] w-[120%]" style={{ top: s.top, transform: `rotate(${s.rot}deg)` }}>
          <div
            style={{
              height: s.h,
              borderRadius: 9999,
              background:
                'linear-gradient(90deg, transparent, hsl(var(--ancient-gold)) 30%, #fff 50%, hsl(var(--crimson-red)) 75%, transparent)',
              boxShadow: '0 0 18px 3px hsl(var(--ancient-gold) / 0.7), 0 0 40px 8px hsl(var(--crimson-red) / 0.45)',
              animation: `slash 0.9s cubic-bezier(.3,.7,.2,1) ${s.d}ms both`,
              opacity: 0,
            }}
          />
        </div>
      ))}

      <div className="absolute inset-0 grid place-items-center px-4 text-center">
        <div
          style={{
            animation: 'slash-banner-in 0.9s 0.5s cubic-bezier(.2,.8,.2,1) both',
          }}
        >
          <p
            className="font-display text-[clamp(4.5rem,18vw,12rem)] leading-none"
            style={{
              color: 'hsl(var(--rice-paper))',
              textShadow: '0 0 30px hsl(var(--crimson-red)), 0 4px 0 hsl(var(--crimson-red)), 0 0 80px hsl(var(--ancient-gold) / 0.6)',
            }}
          >
            剑圣
          </p>
          <p
            className="mt-2 font-mono text-sm uppercase tracking-[0.5em] md:text-lg"
            style={{ color: 'hsl(var(--ancient-gold))', textShadow: '0 2px 12px hsl(var(--ink-black))' }}
          >
            Sword Saint
          </p>
        </div>
      </div>

      <style>{`@keyframes slash-banner-in { from { opacity: 0; transform: scale(1.25); filter: blur(10px); } to { opacity: 1; transform: none; filter: none; } }`}</style>
    </div>
  );
};

export default Easter;
