import { useState } from 'react';
import { toolbox } from '@/data/content';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

/** Toolbox as three typographic columns; hovering or focusing a name dims all the rest. */
const Stack = () => {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="stack" className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 md:py-36 lg:px-10">
      <SectionHeading index="03" kicker="Stack">
        The tools I <em>reach for</em>
      </SectionHeading>

      <div className="grid gap-14 md:grid-cols-3 md:gap-8 lg:gap-12">
        {toolbox.map((group, gi) => (
          <Reveal key={group.id} delay={gi * 90}>
            <div className="mb-6 flex items-center gap-4">
              <h3 className="kicker whitespace-nowrap">{group.name}</h3>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </div>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const key = `${group.id}:${item.name}`;
                const isActive = active === key;
                const dimmed = active !== null && !isActive;
                return (
                  <li
                    key={key}
                    tabIndex={0}
                    onMouseEnter={() => setActive(key)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(key)}
                    onBlur={() => setActive(null)}
                    className={`cursor-default rounded-md py-1 transition-opacity duration-300 ${
                      dimmed ? 'opacity-25' : 'opacity-100'
                    }`}
                  >
                    <span
                      className={`block break-words font-display text-4xl font-semibold leading-[1.02] tracking-tight transition-colors duration-300 lg:text-5xl ${
                        isActive ? 'text-primary' : ''
                      }`}
                    >
                      {item.name}
                    </span>
                    <span
                      className={`mt-1 block h-5 font-mono text-xs text-muted-foreground transition-all duration-300 ease-out ${
                        isActive ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'
                      }`}
                    >
                      {item.note}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200} className="mt-16 border-t pt-6 md:mt-24">
        <p className="font-mono text-sm text-muted-foreground">
          Currently exploring: generative AI, private systems, Rust for ML.
          <span className="caret ml-1 inline-block h-[1.05em] w-[0.5ch] translate-y-[0.2em] bg-primary" aria-hidden />
        </p>
      </Reveal>
    </section>
  );
};

export default Stack;
