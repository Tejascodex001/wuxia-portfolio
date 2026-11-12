import { useEffect, useLayoutEffect, useState } from 'react';

const KEY = 'wuxia-intro-seen';

/** Cinematic intro: an enso draws itself, a counter climbs, then a sword slash splits the screen open. */
const Preloader = () => {
  const [skip] = useState(() => {
    try {
      return sessionStorage.getItem(KEY) === '1' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });
  const [phase, setPhase] = useState<'run' | 'split' | 'gone'>(skip ? 'gone' : 'run');
  const [n, setN] = useState(0);

  // Hold hero animations and page scroll until the gate opens.
  useLayoutEffect(() => {
    if (phase === 'gone') return;
    document.documentElement.classList.add('preloading');
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.classList.remove('preloading');
      document.body.style.overflow = '';
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'run') return;
    const start = performance.now();
    const dur = 1900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setPhase('split');
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'split') return;
    try { sessionStorage.setItem(KEY, '1'); } catch { /* storage unavailable */ }
    const id = setTimeout(() => setPhase('gone'), 1100);
    return () => clearTimeout(id);
  }, [phase]);

  if (phase === 'gone') return null;
  const split = phase === 'split';

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="status"
      aria-label="Loading"
      onClick={() => setPhase('split')}
    >
      {/* top & bottom halves, cut on a diagonal */}
      <div
        className="absolute inset-0 bg-[#0e0c0b]"
        style={{ clipPath: 'polygon(0 0,100% 0,100% 42%,0 58%)', transform: split ? 'translateY(-105%)' : 'none', transition: 'transform .9s cubic-bezier(.7,0,.2,1)' }}
      />
      <div
        className="absolute inset-0 bg-[#0e0c0b]"
        style={{ clipPath: 'polygon(0 58%,100% 42%,100% 100%,0 100%)', transform: split ? 'translateY(105%)' : 'none', transition: 'transform .9s cubic-bezier(.7,0,.2,1)' }}
      />

      {/* the slash */}
      <div
        className="absolute left-[-10%] top-1/2 h-[3px] w-[120%] origin-center bg-gradient-to-r from-transparent via-[#ffe3b0] to-transparent shadow-[0_0_40px_10px_rgba(255,120,80,.7)]"
        style={{
          transform: `translateY(-50%) rotate(-5.2deg) scaleX(${split ? 1 : 0})`,
          opacity: split ? 0 : 1,
          transition: 'transform .35s cubic-bezier(.7,0,.2,1), opacity .9s .15s',
        }}
      />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300"
        style={{ opacity: split ? 0 : 1 }}
      >
        <div className="relative h-56 w-56 sm:h-64 sm:w-64">
          <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-90">
            <circle
              cx="100" cy="100" r="86" fill="none" stroke="#c0392b" strokeWidth="5" strokeLinecap="round"
              pathLength={100} strokeDasharray="100" strokeDashoffset={100 - n * 0.92}
              style={{ filter: 'drop-shadow(0 0 8px rgba(224,72,58,.7))' }}
            />
            <circle cx="100" cy="100" r="74" fill="none" stroke="#d4b26a" strokeOpacity=".35" strokeWidth="1" />
          </svg>
          <span
            className="font-display absolute inset-0 flex items-center justify-center text-[6.5rem] leading-none text-[#f1ece1]"
            style={{ opacity: 0.15 + n / 120, transform: `scale(${0.9 + n / 1000})` }}
          >
            侠
          </span>
        </div>
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.35em] text-[#d4b26a]">
          Unsealing the scroll · {String(n).padStart(3, '0')}
        </p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#f1ece1]/40">click to skip</p>
      </div>
    </div>
  );
};

export default Preloader;
