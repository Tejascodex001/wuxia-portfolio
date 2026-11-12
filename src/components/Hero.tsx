import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowRight } from 'lucide-react';
import ParticleText from './ParticleText';
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion';
import { intro, profile, stats } from '@/data/content';

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/** Picks the particle word's height from the viewport width. */
const useWordHeight = () => {
  const calc = () => {
    const w = typeof window === 'undefined' ? 1024 : window.innerWidth;
    return Math.round(Math.min(340, Math.max(150, w * 0.26)));
  };
  const [h, setH] = useState(calc);
  useEffect(() => {
    const onResize = () => setH(calc());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return h;
};

/** Counts up from zero once scrolled into view. */
const CountUp = ({ value, decimals }: { value: number; decimals: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setN(value);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setN(value);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1400;
        const tick = (t: number) => {
          const p = Math.min((t - start) / dur, 1);
          setN(value * (1 - Math.pow(1 - p, 3)));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, reduced]);

  return <span ref={ref}>{n.toFixed(decimals)}</span>;
};

const Hero = () => {
  const height = useWordHeight();
  const [before, after] = profile.headline.split('scratch');

  return (
    <section id="top" className="relative pt-28 md:pt-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="rise flex items-center gap-3" style={{ ['--rd' as string]: '100ms' }}>
          <span className="relative flex h-2 w-2" aria-hidden>
            <span
              className="absolute inset-0 rounded-full bg-primary"
              style={{ animation: 'pulse-dot 2s ease-out infinite' }}
            />
            <span className="relative h-2 w-2 rounded-full bg-primary" />
          </span>
          <p className="kicker">
            {profile.title} · {profile.employer.name} · {profile.lab.name}
          </p>
        </div>

        <h1 aria-label={profile.name} className="mt-6 -ml-1 md:mt-8">
          <ParticleText
            text={profile.short.toUpperCase()}
            height={height}
            align="left"
            reach={0.55}
            className="font-display font-normal text-ink"
          />
        </h1>
        <p className="kicker rise mt-3 hidden normal-case tracking-normal sm:block" style={{ ['--rd' as string]: '500ms' }}>
          ↑ hover, push and click the letters
        </p>

        <div className="mt-12 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-8">
            <p
              className="rise font-display text-3xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl"
              style={{ ['--rd' as string]: '300ms', textWrap: 'balance' }}
            >
              {before}
              <span className="relative inline-block">
                scratch
                <svg
                  className="absolute -bottom-1 left-0 h-[0.28em] w-full text-primary md:-bottom-2"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M1 6 C 20 1, 40 9, 60 4 S 90 3, 99 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </span>
              {after}
            </p>
          </div>

          <div className="rise md:col-span-4 md:pt-3" style={{ ['--rd' as string]: '450ms' }}>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{intro[0]}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => scrollToId('work')}
                className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                See the work
                <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollToId('contact')}
                className="group inline-flex items-center gap-2 rounded-md border border-foreground/30 px-5 py-3 text-sm font-semibold transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
              >
                Say hello
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-3 border-t border-border md:mt-24">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`py-6 md:py-8 ${i > 0 ? 'border-l border-border pl-4 md:pl-8' : ''}`}
            >
              <dd className="font-display text-5xl font-normal leading-none tracking-tight sm:text-7xl md:text-8xl">
                <CountUp value={s.value} decimals={s.decimals} />
              </dd>
              <dt className="kicker mt-3 normal-case leading-snug tracking-normal">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default Hero;
