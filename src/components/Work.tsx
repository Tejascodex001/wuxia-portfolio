import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { featured, type Featured } from '@/data/content';
import { cn } from '@/lib/utils';
import ParticleText from './ParticleText';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import FlameViz from './FlameViz';
import SanctumViz from './SanctumViz';
import WorkIndex from './WorkIndex';

const useIsDesktop = () => {
  const [desktop, setDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setDesktop(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return desktop;
};

const hue: Record<Featured['id'], string> = { flame: 'var(--flame)', sanctum: 'var(--sanctum)' };

const gridStyle = {
  backgroundImage:
    'linear-gradient(hsl(var(--border) / 0.55) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.55) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
  backgroundPosition: '-1px -1px',
};

const Feature = ({ item, index, desktop }: { item: Featured; index: number; desktop: boolean }) => {
  const flip = index % 2 === 1;
  return (
    <Reveal>
      <article
        aria-labelledby={`work-${item.id}`}
        className="grid overflow-hidden rounded-xl border bg-card md:min-h-[520px] md:grid-cols-2"
      >
        <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 md:p-12">
          <p className="kicker flex items-center gap-3">
            <span className="h-2 w-2 rounded-full" style={{ background: `hsl(${hue[item.id]})` }} aria-hidden />
            {item.kicker}
          </p>
          <h3 id={`work-${item.id}`} style={{ ['--spark' as string]: hue[item.id] }}>
            <ParticleText
              text={item.name}
              height={desktop ? 120 : 80}
              align="left"
              className="font-display font-normal text-ink"
            />
          </h3>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">{item.blurb}</p>
          <ul className="flex flex-wrap gap-2" aria-label="Stack">
            {item.stack.map((s) => (
              <li key={s} className="rounded-md border px-2.5 py-1 font-mono text-xs text-foreground/80">
                {s}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 pt-1">
            {item.links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group inline-flex items-center gap-1.5 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors',
                  i === 0
                    ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'hover:border-foreground/60 hover:bg-muted',
                )}
              >
                {l.label}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        <div
          className={cn(
            'relative order-first h-[340px] border-b bg-muted/60 md:order-none md:h-auto md:border-b-0',
            flip ? 'md:order-first md:border-r' : 'md:order-last md:border-l',
          )}
          style={gridStyle}
        >
          {item.id === 'flame' ? <FlameViz className="absolute inset-0" /> : <SanctumViz className="absolute inset-0" />}
        </div>
      </article>
    </Reveal>
  );
};

const Work = () => {
  const desktop = useIsDesktop();
  return (
    <section id="work" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 md:py-32">
      <SectionHeading index="02" kicker="Selected work">
        Two things I&apos;m <em>proudest</em> of
      </SectionHeading>
      <div className="flex flex-col gap-8 md:gap-10">
        {featured.map((item, i) => (
          <Feature key={item.id} item={item} index={i} desktop={desktop} />
        ))}
      </div>
      <div className="mt-20 md:mt-28">
        <WorkIndex />
      </div>
    </section>
  );
};

export default Work;
