import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { otherWork } from '@/data/content';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/use-reduced-motion';
import Reveal from './Reveal';

const CARD_W = 304;
const OFFSET = 22;

const pad = (n: number) => String(n).padStart(2, '0');

/** Editorial index of the remaining repos, with a cursor-following preview on desktop. */
const WorkIndex = () => {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const floating = fine && !reduced;

  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const primed = useRef(false);

  const place = useCallback((x: number, y: number) => {
    const maxX = window.innerWidth - CARD_W - 16;
    const cardH = cardRef.current?.offsetHeight ?? 140;
    const maxY = window.innerHeight - cardH - 16;
    target.current = {
      x: Math.max(16, Math.min(x + OFFSET, maxX)),
      y: Math.max(16, Math.min(y + OFFSET, maxY)),
    };
    if (!primed.current) {
      current.current = { ...target.current };
      primed.current = true;
    }
  }, []);

  useEffect(() => {
    if (!floating || !visible) return;
    const tick = () => {
      const c = current.current;
      const t = target.current;
      c.x += (t.x - c.x) * 0.16;
      c.y += (t.y - c.y) * 0.16;
      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px, 0)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [floating, visible]);

  const show = (i: number) => {
    setActive(i);
    setVisible(true);
  };
  const hide = () => {
    setVisible(false);
    primed.current = false;
  };

  const project = otherWork[active];

  return (
    <Reveal className="mt-20 md:mt-28">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-2xl font-semibold md:text-3xl">More work</h3>
        <span className="kicker">{pad(otherWork.length)} repos</span>
      </div>

      <ul
        className="border-t"
        onMouseMove={floating ? (e) => place(e.clientX, e.clientY) : undefined}
        onMouseLeave={floating ? hide : undefined}
      >
        {otherWork.map((p, i) => (
          <li key={p.name} className="border-b">
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden py-6 outline-none focus-visible:ring-2 focus-visible:ring-primary md:py-8"
              onMouseEnter={floating ? () => show(i) : undefined}
              onFocus={
                floating
                  ? (e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      place(r.left + r.width * 0.55, r.top + r.height / 2 - OFFSET);
                      show(i);
                    }
                  : undefined
              }
              onBlur={floating ? hide : undefined}
            >
              <span
                aria-hidden
                className="absolute inset-0 origin-left scale-x-0 bg-primary/5 transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
              />
              <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-x-4 transition-transform duration-300 ease-out group-hover:translate-x-3 group-focus-visible:translate-x-3 md:gap-x-8">
                <span className="kicker self-start pt-2 md:self-center md:pt-0">{pad(i + 1)}</span>

                <div className="min-w-0 md:flex md:items-center md:justify-between md:gap-8">
                  <span className="block font-display text-3xl font-semibold leading-[1.05] tracking-tight transition-colors group-hover:text-primary group-focus-visible:text-primary sm:text-4xl md:text-5xl">
                    {p.name}
                  </span>
                  <span className="mt-3 flex flex-wrap gap-2 md:mt-0 md:shrink-0 md:justify-end">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border bg-background/60 px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </span>
                  <span className="mt-3 block max-w-prose text-sm leading-relaxed text-muted-foreground md:hidden">
                    {p.blurb}
                  </span>
                </div>

                <ArrowRight
                  aria-hidden
                  className="h-6 w-6 shrink-0 self-start text-muted-foreground transition-all duration-300 group-hover:-rotate-45 group-hover:text-primary group-focus-visible:-rotate-45 group-focus-visible:text-primary md:h-8 md:w-8 md:self-center"
                />
              </div>
              <span className="sr-only"> (opens GitHub in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>

      {floating && (
        <div
          ref={cardRef}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-50"
          style={{ width: CARD_W, willChange: 'transform' }}
        >
          <div
            className={`rounded-xl border bg-card p-4 shadow-lg transition-opacity duration-200 ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <span className="font-display text-lg font-semibold leading-tight">{project.name}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{project.blurb}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.map((t) => (
                <span key={t} className="rounded-md border px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </Reveal>
  );
};

export default WorkIndex;
