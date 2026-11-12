import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import Mountains from './Mountains';
import { profile, roles } from '@/data/content';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/use-reduced-motion';

const REPEL_RADIUS = 170;

const heroStyles = `
@keyframes hero-enso { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
@keyframes hero-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes hero-stamp {
  0% { opacity: 0; transform: scale(2.4) rotate(-14deg); }
  60% { opacity: 1; transform: scale(.92) rotate(0deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
.hero-enso-a { stroke-dasharray: 100; stroke-dashoffset: 100; animation: hero-enso 2.8s .35s cubic-bezier(.65,0,.25,1) forwards; }
.hero-enso-b { stroke-dasharray: 100; stroke-dashoffset: 100; animation: hero-enso 3.2s .7s cubic-bezier(.65,0,.25,1) forwards; }
.hero-rise { opacity: 0; animation: hero-rise .9s cubic-bezier(.2,.8,.2,1) forwards; animation-delay: var(--rd, 1.4s); }
.hero-stamp { opacity: 0; animation: hero-stamp .6s cubic-bezier(.3,1.4,.5,1) forwards; animation-delay: var(--rd, 1.9s); }
@media (prefers-reduced-motion: reduce) {
  .hero-enso-a, .hero-enso-b { animation: none; stroke-dashoffset: 0; }
  .hero-rise, .hero-stamp { animation: none; opacity: 1; }
}
`;

const words = profile.name.split(' ');

const Hero = () => {
  const reduced = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const interactive = finePointer && !reduced;

  const titleRef = useRef<HTMLDivElement>(null);
  const inners = useRef<HTMLSpanElement[]>([]);
  const raf = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });

  /* ---- letter repel / swirl (refs + rAF, no React state) ---- */
  const apply = useCallback(() => {
    raf.current = 0;
    const { x, y } = pointer.current;
    for (const inner of inners.current) {
      if (!inner) continue;
      const box = (inner.parentElement as HTMLElement).getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const dx = cx - x;
      const dy = cy - y;
      const dist = Math.hypot(dx, dy);
      if (dist < REPEL_RADIUS) {
        const f = Math.pow(1 - dist / REPEL_RADIUS, 1.4);
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);
        // Push away from the cursor, with a perpendicular swirl component.
        const tx = nx * f * 34 - ny * f * 10;
        const ty = ny * f * 34 + nx * f * 10;
        const tr = (dx >= 0 ? 1 : -1) * f * 26;
        inner.style.setProperty('--tx', `${tx.toFixed(1)}px`);
        inner.style.setProperty('--ty', `${ty.toFixed(1)}px`);
        inner.style.setProperty('--tr', `${tr.toFixed(1)}deg`);
      } else {
        inner.style.removeProperty('--tx');
        inner.style.removeProperty('--ty');
        inner.style.removeProperty('--tr');
      }
    }
  }, []);

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || e.pointerType !== 'mouse') return;
    pointer.current = { x: e.clientX, y: e.clientY };
    if (!raf.current) raf.current = requestAnimationFrame(apply);
  };

  const onLeave = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
    for (const inner of inners.current) {
      if (!inner) continue;
      inner.style.removeProperty('--tx');
      inner.style.removeProperty('--ty');
      inner.style.removeProperty('--tr');
    }
  };

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  /* ---- role typewriter ---- */
  const [roleIdx, setRoleIdx] = useState(0);
  const [typed, setTyped] = useState(reduced ? roles[0] : '');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduced) {
      setRoleIdx(0);
      setTyped(roles[0]);
      setDeleting(false);
    }
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const full = roles[roleIdx];
    let delay = deleting ? 28 : 62;
    if (!deleting && typed === full) delay = 2000;
    if (deleting && typed === '') delay = 320;
    const id = window.setTimeout(() => {
      if (!deleting && typed === full) {
        setDeleting(true);
      } else if (deleting && typed === '') {
        setDeleting(false);
        setRoleIdx((i) => (i + 1) % roles.length);
      } else {
        setTyped(deleting ? full.slice(0, typed.length - 1) : full.slice(0, typed.length + 1));
      }
    }, delay);
    return () => window.clearTimeout(id);
  }, [typed, deleting, roleIdx, reduced]);

  const go = (id: string) => (e: ReactMouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  let letterIndex = 0;

  return (
    <section
      id="top"
      aria-label="Introduction"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-40 pt-28 text-center sm:px-6 md:pb-48"
    >
      <style>{heroStyles}</style>

      {/* Giant faint glyph */}
      <span
        aria-hidden
        className="font-display pointer-events-none absolute left-1/2 top-1/2 select-none leading-none text-foreground/[0.05]"
        style={{
          fontSize: 'clamp(20rem, 78vmin, 56rem)',
          transform: 'translate3d(-50%, calc(-52% + var(--sy, 0px) * 0.18), 0)',
        }}
      >
        侠
      </span>

      {/* Ink enso behind the name */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(112vw,52rem)] -translate-x-1/2 -translate-y-[54%]"
      >
        <svg viewBox="0 0 200 200" className="spin-slow h-full w-full overflow-visible" fill="none">
          <defs>
            <filter id="hero-brush" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="4" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
            </filter>
          </defs>
          <g filter="url(#hero-brush)" stroke="hsl(var(--crimson-red))" strokeLinecap="round">
            <path
              className="hero-enso-a"
              pathLength={100}
              d="M154 36 A80 80 0 1 1 42 51"
              strokeWidth="7"
              opacity="0.5"
            />
            <path
              className="hero-enso-b"
              pathLength={100}
              d="M150 33 A84 84 0 1 1 38 56"
              strokeWidth="2.2"
              opacity="0.45"
            />
          </g>
        </svg>
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center">
        {/* Seal + kicker */}
        <div className="mb-6 flex items-center gap-3">
          <div className="hero-stamp" style={{ ['--rd' as string]: '2.1s' }}>
            <div
              className="seal flex h-11 w-11 items-center justify-center rounded-[5px] text-2xl leading-none md:h-14 md:w-14 md:text-3xl"
              aria-hidden
            >
              侠
            </div>
          </div>
          <p className="kicker hero-rise" style={{ ['--rd' as string]: '0.3s' }}>
            {profile.title}
          </p>
        </div>

        {/* Name */}
        <div
          ref={titleRef}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className="-mx-6 px-6 py-6"
        >
          <h1
            aria-label={profile.name}
            className="font-display flex flex-wrap items-baseline justify-center gap-x-[0.28em] text-[clamp(3.4rem,14.5vw,9.5rem)] leading-[1.02] text-foreground"
          >
            {words.map((word, wi) => (
              <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
                {Array.from(word).map((ch, ci) => {
                  const idx = letterIndex++;
                  return (
                    <span key={ci} className="letter" style={{ ['--i' as string]: idx }}>
                      <span
                        className="letter-inner"
                        ref={(el) => {
                          if (el) inners.current[idx] = el;
                        }}
                      >
                        {ch}
                      </span>
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>
        </div>

        <div className="brush-line mt-1 w-[min(72vw,30rem)]" aria-hidden />

        <p
          className="font-display hero-rise mt-6 text-3xl md:text-5xl"
          style={{ color: 'hsl(var(--crimson-red))', ['--rd' as string]: '1.5s' }}
        >
          {profile.tagline}
        </p>

        {/* Role rotator */}
        <div className="hero-rise mt-4 h-8 md:h-9" style={{ ['--rd' as string]: '1.7s' }}>
          <span className="sr-only" aria-live="polite" role="status">
            {roles[roleIdx]}
          </span>
          <p aria-hidden className="font-mono text-base text-muted-foreground md:text-xl">
            <span>{typed}</span>
            {!reduced && (
              <span
                className="caret ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.2em]"
                style={{ background: 'hsl(var(--crimson-red))' }}
              />
            )}
          </p>
        </div>

        {/* CTAs */}
        <div
          className="hero-rise mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
          style={{ ['--rd' as string]: '1.9s' }}
        >
          <a
            href="#about"
            onClick={go('about')}
            className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide shadow-lg transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: 'hsl(var(--crimson-red))',
              color: 'hsl(var(--primary-foreground))',
              boxShadow: '0 10px 30px hsl(var(--crimson-red) / 0.35)',
            }}
          >
            Enter the Jianghu
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-command'))}
            className="glass inline-flex items-center justify-center gap-3 rounded-full px-6 py-3.5 text-sm font-medium tracking-wide text-foreground transition-transform duration-300 hover:-translate-y-0.5"
          >
            Open scrolls
            <kbd className="rounded-md border border-border bg-background/60 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Employer */}
        <p
          className="hero-rise mt-8 max-w-md text-balance font-mono text-xs leading-relaxed text-muted-foreground md:max-w-none md:text-sm"
          style={{ ['--rd' as string]: '2.1s' }}
        >
          {profile.title} at{' '}
          <a
            href={profile.employer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline decoration-dotted underline-offset-4 transition-colors hover:text-wuxia-crimson"
          >
            {profile.employer.name}
          </a>{' '}
          · maintainer of{' '}
          <a
            href={profile.lab.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline decoration-dotted underline-offset-4 transition-colors hover:text-wuxia-crimson"
          >
            {profile.lab.name}
          </a>
        </p>
      </div>

      {/* Mountains with fade into the page */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[30svh] min-h-[12rem] md:h-[32svh]"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 45%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, #000 45%)',
        }}
      >
        <Mountains parallax className="absolute inset-0" />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/5"
          style={{
            background:
              'linear-gradient(to top, hsl(var(--background)) 4%, hsl(var(--background) / 0.75) 38%, transparent 100%)',
          }}
        />
      </div>

      {/* Scroll cue */}
      <a
        href="#about"
        onClick={go('about')}
        aria-label="Scroll to the next section"
        className="hero-rise absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        style={{ ['--rd' as string]: '2.4s' }}
      >
        <span className="kicker">Scroll</span>
        <ArrowDown className="bob h-4 w-4" aria-hidden />
      </a>
    </section>
  );
};

export default Hero;
