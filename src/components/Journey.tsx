import { useEffect, useRef } from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';
import { journey } from '@/data/content';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const nodeBase =
  'absolute left-5 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[hsl(var(--ancient-gold))] bg-background transition-all duration-500 md:left-1/2 ' +
  'data-[on=true]:scale-125 data-[on=true]:border-[hsl(var(--crimson-red))] data-[on=true]:bg-[hsl(var(--crimson-red))] ' +
  'data-[on=true]:shadow-[0_0_0_4px_hsl(var(--crimson-red)/0.18),0_0_18px_4px_hsl(var(--glow)/0.55)]';

const Journey = () => {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const r = line.getBoundingClientRect();
      if (!r.height) return;
      const reach = Math.min(Math.max(window.innerHeight * 0.55 - r.top, 0), r.height);
      line.style.setProperty('--p', (reach / r.height).toFixed(4));
      line.querySelectorAll<HTMLElement>('[data-node]').forEach((n) => {
        const nr = n.getBoundingClientRect();
        const centre = nr.top + nr.height / 2 - r.top;
        const on = centre <= reach ? 'true' : 'false';
        if (n.dataset.on !== on) n.dataset.on = on;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="journey" className="relative px-4 py-24 md:py-36">
      <div className="mx-auto max-w-5xl">
        <SectionHeading kicker="The journey" zh="途">
          Path walked, <em>so far</em>
        </SectionHeading>

        <div ref={lineRef} className="relative" style={{ ['--p' as string]: 0 }}>
          {/* spine: track + scroll-driven fill (ends at the closing node) */}
          <div aria-hidden className="absolute bottom-7 left-5 top-0 w-px -translate-x-1/2 bg-border md:left-1/2">
            <div
              className="absolute -left-px top-0 h-full w-[3px] origin-top rounded-full"
              style={{
                transform: 'scaleY(var(--p, 0))',
                background: 'linear-gradient(to bottom, hsl(var(--crimson-red)), hsl(var(--ancient-gold)))',
                boxShadow: '0 0 12px hsl(var(--glow) / 0.5)',
              }}
            />
          </div>

          <ol className="relative flex flex-col gap-10 md:gap-14">
            {journey.map((c, i) => {
              const Icon = c.kind === 'work' ? Briefcase : GraduationCap;
              const left = i % 2 === 0;
              return (
                <li key={`${c.period}-${c.title}`} className="relative pl-14 md:grid md:grid-cols-2 md:pl-0">
                  <span data-node data-on="false" aria-hidden className={`${nodeBase} top-8`} />
                  <Reveal
                    delay={80}
                    className={left ? 'md:col-start-1 md:pr-14' : 'md:col-start-2 md:pl-14'}
                  >
                    <article className="glass relative rounded-2xl p-6 md:p-8">
                      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                        <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold">{c.period}</p>
                        {c.current && (
                          <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--crimson-red))] px-2.5 py-0.5 font-mono text-[0.65rem] font-medium uppercase tracking-widest text-[hsl(var(--rice-paper))]">
                            <span className="relative flex h-2 w-2" aria-hidden>
                              <span
                                className="absolute inset-0 rounded-full bg-[hsl(var(--rice-paper))]"
                                style={{ animation: 'pulse-ring 1.8s ease-out infinite' }}
                              />
                              <span className="relative h-2 w-2 rounded-full bg-[hsl(var(--rice-paper))]" />
                            </span>
                            Now
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-3xl leading-tight md:text-4xl">{c.title}</h3>
                      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon className="h-4 w-4 shrink-0 text-wuxia-crimson" aria-hidden />
                        <span>{c.place}</span>
                        <span className="sr-only">{c.kind === 'work' ? '(work)' : '(education)'}</span>
                      </p>
                      <ul className="mt-4 space-y-2.5">
                        {c.points.map((pt) => (
                          <li key={pt} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                            <span
                              aria-hidden
                              className="mt-[0.55rem] h-1 w-3 shrink-0 rounded-full bg-[hsl(var(--ancient-gold))]"
                            />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  </Reveal>
                </li>
              );
            })}

            {/* closing node */}
            <li className="relative h-14 pl-14 md:pl-0 md:text-center">
              <span data-node data-on="false" aria-hidden className={`${nodeBase} top-7 -mt-2 md:hidden`} />
              <Reveal delay={80} className="h-full">
                <p className="bob inline-flex h-14 items-center rounded-full border border-border bg-background px-6 font-display text-xl text-gold md:relative md:z-10 md:text-2xl">
                  …and the road continues <span aria-hidden className="ml-2">➜</span>
                </p>
              </Reveal>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
};

export default Journey;
