import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { background, intro, profile } from '@/data/content';

const KEY_PHRASES = ['Transformer by hand in Rust', 'end-to-end encrypted messenger'];

/** Underlines the key phrases in primary. */
const Marked = ({ text }: { text: string }) => {
  const re = new RegExp(`(${KEY_PHRASES.join('|')})`, 'g');
  return (
    <>
      {text.split(re).map((part, i) =>
        KEY_PHRASES.includes(part) ? (
          <span
            key={i}
            className="underline decoration-primary decoration-[3px] underline-offset-[6px] md:decoration-4"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
};

const About = () => (
  <section id="about" className="py-24 md:py-36">
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <SectionHeading index="04" kicker="About">
        Self-taught <em>depth</em>, shipped breadth
      </SectionHeading>

      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="font-display text-2xl font-medium leading-[1.25] md:text-3xl">
              <Marked text={intro[1]} />
            </p>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {intro[0]}
            </p>
          </Reveal>
          <Reveal delay={240}>
            <a
              href={profile.lab.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-10 flex items-start justify-between gap-6 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary md:p-7"
            >
              <div>
                <p className="kicker">The lab</p>
                <p className="mt-2 font-display text-2xl font-semibold md:text-3xl">{profile.lab.name}</p>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  An independent lab where the problem decides what we build next. FLAME and Sanctum live here.
                </p>
              </div>
              <ArrowUpRight className="mt-1 h-6 w-6 shrink-0 text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </a>
          </Reveal>
        </div>

        <ol className="flex flex-col gap-3 lg:col-span-5">
          {background.map((b, i) => (
            <Reveal as="li" key={b.id} delay={i * 130}>
              <article className="group rounded-xl border border-border p-6 transition-colors duration-300 hover:bg-foreground hover:text-background md:p-7">
                <div className="flex items-center gap-2.5">
                  {b.id === 'now' && (
                    <span className="relative flex h-2 w-2" aria-hidden>
                      <span
                        className="absolute inset-0 rounded-full bg-primary"
                        style={{ animation: 'pulse-dot 2s ease-out infinite' }}
                      />
                      <span className="relative h-2 w-2 rounded-full bg-primary" />
                    </span>
                  )}
                  <span className="kicker transition-colors duration-300 group-hover:text-background/70">
                    {b.label}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold leading-tight md:text-3xl">{b.title}</h3>
                <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 text-sm">
                  <span className="font-medium">{b.place}</span>
                  <span className="font-mono text-xs text-muted-foreground transition-colors duration-300 group-hover:text-background/70">
                    {b.when}
                  </span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-background/80">
                  {b.note}
                </p>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </div>
  </section>
);

export default About;
