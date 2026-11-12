import { Fragment, useEffect, useRef, useState } from 'react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion';
import { intro, profile, schools, stats } from '@/data/content';

/* ---------- helpers ---------- */

/** True once the element has scrolled into view (never flips back). */
const useOnceInView = <T extends HTMLElement>(threshold = 0.3) => {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, seen] as const;
};

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

type Stat = (typeof stats)[number];

const formatStat = (n: number, decimals: number, plain?: boolean) =>
  plain
    ? n.toFixed(decimals)
    : n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const StatTile = ({ stat, index }: { stat: Stat; index: number }) => {
  const reduced = usePrefersReducedMotion();
  const [ref, seen] = useOnceInView<HTMLDivElement>(0.4);
  const [display, setDisplay] = useState(() => (reduced ? stat.value : 0));
  const plain = 'plain' in stat ? stat.plain : false;

  useEffect(() => {
    if (reduced) {
      setDisplay(stat.value);
      return;
    }
    if (!seen) return;
    const duration = 1800;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setDisplay(stat.value * easeOutExpo(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, reduced, stat.value]);

  const final = formatStat(stat.value, stat.decimals, plain);

  return (
    <Reveal delay={index * 90}>
      <div
        ref={ref}
        className="glass group relative h-full overflow-hidden rounded-2xl p-5 transition-transform duration-500 hover:-translate-y-1 sm:p-6"
      >
        <span
          aria-hidden
          className="font-display pointer-events-none absolute -bottom-6 -right-2 select-none text-8xl leading-none text-wuxia-crimson/[0.07] transition-colors duration-500 group-hover:text-wuxia-crimson/[0.14]"
        >
          {['一', '二', '三', '四'][index]}
        </span>
        <p className="font-display relative text-5xl leading-none text-foreground sm:text-6xl">
          <span aria-hidden className="tabular-nums">
            {formatStat(display, stat.decimals, plain)}
          </span>
          <span className="sr-only">{final}</span>
        </p>
        <span aria-hidden className="relative mt-4 block h-px w-10 bg-wuxia-crimson" />
        <p className="relative mt-3 text-sm leading-snug text-muted-foreground">{stat.label}</p>
      </div>
    </Reveal>
  );
};

/** Underline key phrases inside a paragraph with a crimson ink stroke. */
const KEY_PHRASES = ['RTensorLabs', 'Kenpath', 'Transformer by hand in Rust', 'end-to-end encrypted messenger in Flutter'];

const Inked = ({ text }: { text: string }) => {
  const pattern = new RegExp(`(${KEY_PHRASES.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  return (
    <>
      {text.split(pattern).map((part, i) =>
        KEY_PHRASES.includes(part) ? (
          <span
            key={i}
            className="text-foreground underline decoration-wuxia-crimson/70 decoration-2 underline-offset-[6px]"
          >
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
};

/* ---------- cultivation realms ---------- */

const realms = [
  { numeral: '一', stage: 'Foundation', title: 'C & Python' },
  { numeral: '二', stage: 'Awakening', title: 'ML & Deep Learning' },
  { numeral: '三', stage: 'Forging', title: 'C++, CUDA & Rust' },
  { numeral: '四', stage: 'Current trial', title: 'Generative AI & private systems' },
];

const Realms = () => {
  const reduced = usePrefersReducedMotion();
  const [ref, seen] = useOnceInView<HTMLOListElement>(0.25);
  const on = seen || reduced;

  return (
    <ol ref={ref} className="relative grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-4" aria-label="Cultivation realms">
      {/* vertical connector (mobile) */}
      <span aria-hidden className="absolute bottom-7 left-7 top-7 w-px -translate-x-1/2 bg-border md:hidden" />
      <span
        aria-hidden
        className="absolute bottom-7 left-7 top-7 w-px origin-top -translate-x-1/2 bg-wuxia-crimson transition-transform [transition-duration:1800ms] ease-out md:hidden"
        style={{ transform: `translateX(-50%) scaleY(${on ? 1 : 0})` }}
      />
      {/* horizontal connector (desktop) */}
      <span aria-hidden className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-border md:block" />
      <span
        aria-hidden
        className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px origin-left bg-wuxia-crimson transition-transform [transition-duration:1800ms] ease-out md:block"
        style={{ transform: `scaleX(${on ? 1 : 0})` }}
      />

      {realms.map((r, i) => {
        const current = i === realms.length - 1;
        return (
          <li key={r.numeral} className="relative flex items-start gap-5 md:flex-col md:items-center md:gap-4 md:text-center">
            <div
              className="relative shrink-0 transition-all duration-700"
              style={{
                opacity: on ? 1 : 0,
                transform: on ? 'scale(1)' : 'scale(0.5)',
                transitionDelay: `${i * 380}ms`,
              }}
            >
              {current && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full border-2 border-wuxia-crimson motion-reduce:hidden"
                  style={{ animation: 'pulse-ring 2.2s ease-out infinite' }}
                />
              )}
              <span
                className={`font-display relative flex h-14 w-14 items-center justify-center rounded-full border-2 text-2xl ${
                  current
                    ? 'border-wuxia-crimson bg-wuxia-crimson text-[hsl(var(--rice-paper))] shadow-[0_0_28px_hsl(var(--glow)/0.45)]'
                    : 'border-wuxia-crimson/70 bg-background text-wuxia-crimson'
                }`}
              >
                {r.numeral}
              </span>
            </div>
            <div
              className="pt-1 transition-all duration-700 md:pt-0"
              style={{
                opacity: on ? 1 : 0,
                transform: on ? 'none' : 'translateY(12px)',
                transitionDelay: `${i * 380 + 150}ms`,
              }}
            >
              <p className="kicker">{r.stage}</p>
              <h3 className="mt-1 text-xl leading-snug text-foreground md:text-2xl">{r.title}</h3>
              {current && (
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-wuxia-crimson">In progress</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

/* ---------- tools marquee ---------- */

const toolNames = schools.flatMap((s) => s.skills.map((k) => k.name));

const MarqueeList = ({ hidden = false }: { hidden?: boolean }) => (
  <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
    {toolNames.map((name) => (
      <li key={name} className="flex shrink-0 items-center whitespace-nowrap">
        <span className="font-display px-6 text-3xl text-foreground/80 md:px-8 md:text-4xl">{name}</span>
        <span aria-hidden className="text-lg text-wuxia-crimson">
          ✦
        </span>
      </li>
    ))}
  </ul>
);

const Marquee = () => {
  const fade = 'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)';
  return (
    <div
      className="marquee overflow-hidden border-y border-border py-5"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      <div className="marquee-track flex w-max motion-reduce:animate-none">
        <MarqueeList />
        <MarqueeList hidden />
      </div>
    </div>
  );
};

/* ---------- section ---------- */

const About = () => (
  <section id="about" className="relative overflow-hidden px-5 py-24 sm:px-8 md:py-36">
    <div className="mx-auto max-w-6xl">
      <SectionHeading kicker="The path" zh="道">
        A wanderer, <em>self-forged</em>
      </SectionHeading>

      <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="space-y-8">
          <Reveal>
            <p className="first-letter:font-display text-2xl leading-[1.55] text-foreground/90 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[4.5rem] first-letter:leading-[0.8] first-letter:text-wuxia-crimson sm:text-[1.7rem]">
              <Inked text={intro[0]} />
            </p>
          </Reveal>
          {intro.slice(1).map((p, i) => (
            <Reveal key={i} delay={120}>
              <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
                <Inked text={p} />
              </p>
            </Reveal>
          ))}

          <Reveal delay={200}>
            <a
              href={profile.lab.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass group relative flex items-center gap-4 overflow-hidden rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1 hover:border-wuxia-crimson/60 hover:shadow-[0_12px_40px_-12px_hsl(var(--glow)/0.45)]"
            >
              <span className="seal font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-md text-3xl">
                研
              </span>
              <span className="min-w-0 flex-1">
                <span className="kicker block">Independent lab</span>
                <span className="font-display mt-1 block truncate text-2xl text-foreground">{profile.lab.name}</span>
              </span>
              <span
                aria-hidden
                className="text-2xl text-wuxia-crimson transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
              >
                ↗
              </span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5">
          {stats.map((s, i) => (
            <StatTile key={s.label} stat={s} index={i} />
          ))}
        </div>
      </div>

      <div className="mt-24 md:mt-32">
        <Reveal className="mb-12 md:mb-16">
          <p className="kicker mb-3">Cultivation realms</p>
          <h3 className="font-display text-3xl text-foreground md:text-4xl">Four steps along the road</h3>
        </Reveal>
        <Realms />
      </div>
    </div>

    <div className="mt-24 md:mt-32">
      <Marquee />
    </div>
  </section>
);

export default About;
