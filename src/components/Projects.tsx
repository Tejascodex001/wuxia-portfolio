import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { featured, otherWork, type Featured } from '@/data/content';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import Tilt from './Tilt';

const hueVar = (hue: number) => ({ ['--h' as string]: hue }) as CSSProperties;

/* ------------------------------------------------------------------ */
/* Art panels (hand-built inline SVG, tinted via --h on the card)      */
/* ------------------------------------------------------------------ */

const tone = (l = 55, a = 1, s = 78) => `hsl(var(--h) ${s}% ${l}% / ${a})`;

const FlameArt = () => {
  const tokens = [60, 110, 160, 210, 260, 310, 360];
  const arcs: [number, number][] = [[0, 3], [1, 5], [2, 4], [3, 6], [0, 6]];
  return (
    <svg viewBox="0 0 420 420" className="absolute inset-0 h-full w-full" aria-hidden focusable="false" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="flame-outer" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" style={{ stopColor: tone(42) }} />
          <stop offset="55%" style={{ stopColor: tone(55) }} />
          <stop offset="100%" style={{ stopColor: 'hsl(42 95% 62%)' }} />
        </linearGradient>
        <linearGradient id="flame-inner" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" style={{ stopColor: 'hsl(30 95% 55%)' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(50 100% 80%)' }} />
        </linearGradient>
        <radialGradient id="flame-halo" cx="50%" cy="58%" r="50%">
          <stop offset="0%" style={{ stopColor: tone(55, 0.5) }} />
          <stop offset="100%" style={{ stopColor: tone(55, 0) }} />
        </radialGradient>
        <mask id="flame-grid-mask">
          <radialGradient id="flame-grid-fade" cx="50%" cy="55%" r="60%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
          <rect width="420" height="420" fill="url(#flame-grid-fade)" />
        </mask>
      </defs>

      {/* transformer-layer grid */}
      <g mask="url(#flame-grid-mask)" style={{ color: tone(55) }} stroke="currentColor" strokeWidth="1" opacity="0.45">
        {[40, 90, 140, 190, 240, 290, 340].map((y) => (
          <line key={`h${y}`} x1="20" x2="400" y1={y} y2={y} />
        ))}
        {[40, 100, 160, 220, 280, 340, 400].map((x) => (
          <line key={`v${x}`} x1={x} x2={x} y1="20" y2="400" />
        ))}
      </g>

      <circle cx="210" cy="240" r="190" fill="url(#flame-halo)" />

      {/* attention arcs between tokens */}
      <g fill="none" strokeWidth="1.4" strokeLinecap="round" style={{ stroke: tone(60, 0.8) }}>
        {arcs.map(([a, b], i) => {
          const x1 = tokens[a];
          const x2 = tokens[b];
          const mid = (x1 + x2) / 2;
          const lift = 40 + (x2 - x1) * 0.28;
          return (
            <path
              key={i}
              d={`M${x1} 372 Q${mid} ${372 - lift * 1.6} ${x2} 372`}
              strokeDasharray="4 6"
              style={{ animation: `dash ${3 + i * 0.6}s linear infinite` }}
            />
          );
        })}
      </g>
      <g style={{ fill: tone(62) }}>
        {tokens.map((x) => (
          <circle key={x} cx={x} cy="372" r="4.5" />
        ))}
      </g>

      {/* flame */}
      <g className="bob" style={{ transformOrigin: '210px 300px' }}>
        <path
          d="M210 58 C 232 112, 296 138, 290 226 C 286 288, 250 326, 210 326 C 170 326, 132 288, 130 228 C 128 180, 168 160, 176 112 C 188 142, 200 128, 210 58 Z"
          fill="url(#flame-outer)"
        />
        <path
          d="M210 148 C 226 186, 258 206, 254 250 C 252 282, 234 304, 210 304 C 186 304, 168 282, 168 252 C 168 226, 192 214, 196 184 C 202 198, 206 190, 210 148 Z"
          fill="url(#flame-inner)"
          opacity="0.95"
        />
      </g>

      {/* embers */}
      {[
        { x: 150, d: '0s', r: 3 },
        { x: 200, d: '1.1s', r: 2.2 },
        { x: 250, d: '0.5s', r: 3.4 },
        { x: 285, d: '1.7s', r: 2 },
        { x: 175, d: '2.2s', r: 2.4 },
      ].map((e) => (
        <circle
          key={e.x}
          cx={e.x}
          cy="190"
          r={e.r}
          style={{ fill: 'hsl(42 95% 66%)', animation: `ember-rise 3.4s ease-out ${e.d} infinite` }}
        />
      ))}
    </svg>
  );
};

const SanctumArt = () => {
  const nodes = [0, 72, 144, 216, 288];
  return (
    <svg viewBox="0 0 420 420" className="absolute inset-0 h-full w-full" aria-hidden focusable="false" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="sanct-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: tone(58, 0.45) }} />
          <stop offset="100%" style={{ stopColor: tone(58, 0) }} />
        </radialGradient>
        <linearGradient id="sanct-lock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: tone(64) }} />
          <stop offset="100%" style={{ stopColor: tone(40) }} />
        </linearGradient>
      </defs>

      <circle cx="210" cy="210" r="200" fill="url(#sanct-halo)" />

      {/* onion layers */}
      <g fill="none" style={{ stroke: tone(58, 0.75) }} strokeWidth="1.4">
        <circle cx="210" cy="210" r="186" strokeDasharray="2 10" strokeLinecap="round" className="spin-slow" style={{ transformOrigin: '210px 210px', stroke: tone(58, 0.55) }} />
        <circle cx="210" cy="210" r="152" opacity="0.5" />
        <g className="spin-slow" style={{ transformOrigin: '210px 210px', animationDuration: '90s', animationDirection: 'reverse' }}>
          <polygon points={nodes.map((a) => `${210 + 120 * Math.cos(((a - 90) * Math.PI) / 180)},${210 + 120 * Math.sin(((a - 90) * Math.PI) / 180)}`).join(' ')} opacity="0.7" />
          {nodes.map((a) => (
            <circle
              key={a}
              cx={210 + 120 * Math.cos(((a - 90) * Math.PI) / 180)}
              cy={210 + 120 * Math.sin(((a - 90) * Math.PI) / 180)}
              r="5"
              style={{ fill: tone(66), stroke: 'none' }}
            />
          ))}
        </g>
        <circle cx="210" cy="210" r="88" strokeDasharray="14 8" style={{ animation: 'dash 5s linear infinite' }} />
        <circle cx="210" cy="210" r="62" opacity="0.6" />
      </g>

      {/* sigil ticks */}
      <g style={{ stroke: tone(60, 0.5) }} strokeWidth="1.2" strokeLinecap="round">
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={210 + 168 * Math.cos(a)}
              y1={210 + 168 * Math.sin(a)}
              x2={210 + (i % 3 === 0 ? 178 : 174) * Math.cos(a)}
              y2={210 + (i % 3 === 0 ? 178 : 174) * Math.sin(a)}
            />
          );
        })}
      </g>

      {/* lock */}
      <g className="bob" style={{ transformOrigin: '210px 210px' }}>
        <path d="M184 204 V184 a26 26 0 0 1 52 0 V204" fill="none" strokeWidth="9" strokeLinecap="round" style={{ stroke: tone(62) }} />
        <rect x="166" y="200" width="88" height="68" rx="14" fill="url(#sanct-lock)" />
        <circle cx="210" cy="230" r="8" style={{ fill: 'hsl(var(--background))' }} />
        <rect x="207" y="232" width="6" height="16" rx="3" style={{ fill: 'hsl(var(--background))' }} />
      </g>
    </svg>
  );
};

const arts: Record<string, () => JSX.Element> = { flame: FlameArt, sanctum: SanctumArt };

/* ------------------------------------------------------------------ */
/* Featured card                                                       */
/* ------------------------------------------------------------------ */

const linkBase =
  'group/btn inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all duration-300 focus-visible:outline-offset-2';
const linkPrimary =
  'bg-[hsl(var(--crimson-red))] text-[hsl(var(--rice-paper))] shadow-[0_8px_24px_-8px_hsl(var(--crimson-red)/0.6)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_hsl(var(--crimson-red)/0.8)]';
const linkOutline =
  'border border-foreground/30 text-foreground hover:border-[hsl(var(--crimson-red))] hover:text-[hsl(var(--crimson-red))]';

const FeaturedCard = ({ p, index }: { p: Featured; index: number }) => {
  const Art = arts[p.id];
  const flip = index % 2 === 1;
  return (
    <Reveal delay={index * 120}>
      <Tilt hue={p.hue} max={5}>
        <article
          style={hueVar(p.hue)}
          className="glass relative grid overflow-hidden rounded-3xl md:grid-cols-[1.05fr_1fr]"
        >
          {/* art panel */}
          <div
            className={`relative min-h-[260px] overflow-hidden md:min-h-[460px] ${flip ? 'md:order-2' : ''}`}
            style={{
              background: `radial-gradient(120% 90% at 50% 45%, ${tone(55, 0.22)}, transparent 70%), linear-gradient(160deg, ${tone(50, 0.16)}, ${tone(30, 0.06)})`,
            }}
          >
            {Art && <Art />}
            <span
              aria-hidden
              className="pointer-events-none absolute left-4 top-4 font-mono text-[0.7rem] tracking-[0.3em]"
              style={{ color: tone(45, 0.9, 60) }}
            >
              0{index + 1} / 0{featured.length}
            </span>
          </div>

          {/* copy */}
          <div className="relative flex flex-col justify-center gap-5 p-6 sm:p-8 md:p-12">
            <span
              aria-hidden
              className="font-display text-stroke pointer-events-none absolute -right-2 -top-6 select-none text-[10rem] leading-none opacity-60 md:text-[14rem]"
            >
              {p.glyph}
            </span>
            <p className="kicker relative">{p.kicker}</p>
            <h3 className="font-display relative text-6xl leading-none md:text-8xl" style={{ color: 'hsl(var(--foreground))' }}>
              {p.name}
            </h3>
            <p className="relative max-w-prose text-base leading-relaxed text-muted-foreground">{p.blurb}</p>
            <ul className="relative flex flex-wrap gap-2" aria-label={`${p.name} tech stack`}>
              {p.stack.map((s) => (
                <li
                  key={s}
                  className="rounded-full border px-3 py-1 font-mono text-xs text-foreground/80"
                  style={{ borderColor: tone(50, 0.45, 60), background: tone(55, 0.08, 70) }}
                >
                  {s}
                </li>
              ))}
            </ul>
            <div className="relative mt-1 flex flex-wrap gap-3">
              {p.links.map((l, i) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkBase} ${i === 0 ? linkPrimary : linkOutline}`}
                >
                  {l.label}
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
                    aria-hidden
                  />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
          </div>

          <div aria-hidden className="spot pointer-events-none absolute inset-0 z-10 rounded-3xl" />
        </article>
      </Tilt>
    </Reveal>
  );
};

/* ------------------------------------------------------------------ */
/* Other work rail                                                     */
/* ------------------------------------------------------------------ */

const OtherRail = () => {
  const railRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0, id: -1 });

  const measure = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const start = el.scrollLeft <= 4;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setEdge((p) => (p.start === start && p.end === end ? p : { start, end }));
  }, []);

  useEffect(() => {
    measure();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  const scrollByCard = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(320, el.clientWidth * 0.8), behavior: 'smooth' });
  };

  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = railRef.current;
    if (!el) return;
    drag.current = { active: true, moved: false, startX: e.clientX, startLeft: el.scrollLeft, id: e.pointerId };
  };

  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = railRef.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) < 6) return;
      d.moved = true;
      el.style.scrollSnapType = 'none';
      el.style.cursor = 'grabbing';
      try {
        el.setPointerCapture(d.id);
      } catch {
        /* pointer may already be gone */
      }
    }
    el.scrollLeft = d.startLeft - dx;
  };

  const endDrag = () => {
    const d = drag.current;
    const el = railRef.current;
    if (!d.active) return;
    d.active = false;
    if (d.moved && el) {
      el.style.scrollSnapType = '';
      el.style.cursor = '';
      // swallow the click that follows a drag, then re-arm
      window.setTimeout(() => {
        d.moved = false;
      }, 0);
    }
  };

  return (
    <div className="relative">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="kicker mb-2">More scrolls</p>
          <h3 className="font-display text-3xl md:text-4xl">Other work</h3>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={edge.start}
            aria-label="Previous projects"
            className="grid h-11 w-11 place-items-center rounded-full border border-foreground/30 text-foreground transition-all hover:border-[hsl(var(--crimson-red))] hover:text-[hsl(var(--crimson-red))] disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={edge.end}
            aria-label="Next projects"
            className="grid h-11 w-11 place-items-center rounded-full border border-foreground/30 text-foreground transition-all hover:border-[hsl(var(--crimson-red))] hover:text-[hsl(var(--crimson-red))] disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        aria-label="Other projects"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onDragStart={(e) => e.preventDefault()}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-4 py-6 md:cursor-grab"
      >
        {otherWork.map((w, i) => (
          <Tilt key={w.name} hue={[18, 200, 150, 40, 300][i % 5]} max={6} className="w-[300px] shrink-0 snap-start">
            <div className="glass relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <span className="font-mono text-sm text-gold">{String(i + 1).padStart(2, '0')}</span>
                <a
                  href={w.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                  aria-label={`${w.name} on GitHub (opens in a new tab)`}
                  className="grid h-10 w-10 place-items-center rounded-full border border-foreground/25 text-foreground transition-all hover:border-[hsl(var(--crimson-red))] hover:bg-[hsl(var(--crimson-red))] hover:text-[hsl(var(--rice-paper))]"
                >
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
              <h4 className="font-display text-3xl leading-tight">{w.name}</h4>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{w.blurb}</p>
              <ul className="flex flex-wrap gap-2" aria-label="Tags">
                {w.tags.map((t) => (
                  <li key={t} className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[0.7rem] text-foreground/75">
                    {t}
                  </li>
                ))}
              </ul>
              <a
                href={w.href}
                target="_blank"
                rel="noopener noreferrer"
                draggable={false}
                className="font-mono text-xs uppercase tracking-wider text-gold underline-offset-4 hover:underline"
              >
                GitHub
              </a>
              <div aria-hidden className="spot pointer-events-none absolute inset-0 rounded-2xl" />
            </div>
          </Tilt>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */

const Projects = () => (
  <section id="projects" className="relative px-4 py-24 md:py-36">
    <style>{`
      @keyframes ember-rise {
        0% { transform: translateY(0); opacity: 0; }
        20% { opacity: 1; }
        100% { transform: translateY(-130px); opacity: 0; }
      }
    `}</style>
    <div className="mx-auto max-w-6xl">
      <SectionHeading kicker="Scrolls of mastery" zh="卷">
        Things I've <em>forged</em>
      </SectionHeading>

      <div className="flex flex-col gap-10 md:gap-16">
        {featured.map((p, i) => (
          <FeaturedCard key={p.id} p={p} index={i} />
        ))}
      </div>

      <div className="mt-20 md:mt-28">
        <Reveal>
          <OtherRail />
        </Reveal>
      </div>
    </div>
  </section>
);

export default Projects;
