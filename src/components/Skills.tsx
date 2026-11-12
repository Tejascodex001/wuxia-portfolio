import { useMemo, useState } from 'react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { schools, type School, type Skill } from '@/data/content';

/* ---------- constellation layout ---------- */

const VIEW_W = 1100;
const VIEW_H = 620;
const HUB_R = 46;
const CY = 310;

type Layout = { cx: number; radius: number; start: number };
const layout: Record<string, Layout> = {
  languages: { cx: 200, radius: 120, start: 45 },
  ml: { cx: 550, radius: 165, start: 0 },
  dev: { cx: 900, radius: 120, start: 45 },
};
const fallbackLayouts: Layout[] = [layout.languages, layout.ml, layout.dev];

type Placed = {
  skill: Skill;
  x: number;
  y: number;
  anchor: 'start' | 'end' | 'middle';
  delay: number;
};
type PlacedSchool = { school: School; cx: number; nodes: Placed[] };

const place = (list: School[]): PlacedSchool[] =>
  list.map((school, si) => {
    const l = layout[school.id] ?? fallbackLayouts[si % fallbackLayouts.length];
    const n = school.skills.length;
    const nodes = school.skills.map((skill, i) => {
      const a = ((l.start + (360 / n) * i) * Math.PI) / 180;
      const cos = Math.cos(a);
      return {
        skill,
        x: l.cx + l.radius * cos,
        y: CY + l.radius * Math.sin(a),
        anchor: (cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle') as Placed['anchor'],
        delay: ((si * 7 + i * 5) % 9) * -0.7,
      };
    });
    return { school, cx: l.cx, nodes };
  });

type Active = { schoolId: string; skill: Skill } | null;

const NODE_R = 11;
const LABEL_SIZE = 16;

/* ---------- desktop constellation ---------- */

const Constellation = () => {
  const placed = useMemo(() => place(schools), []);
  const [active, setActive] = useState<Active>(null);
  const activeSchool = active ? schools.find((s) => s.id === active.schoolId) : undefined;

  return (
    <div className="hidden md:block">
      <style>{`
        @keyframes skill-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        .skill-float { transform-box: fill-box; transform-origin: center; animation: skill-float 6s ease-in-out infinite; }
        .skill-node { outline: none; cursor: pointer; transition: opacity .35s ease; }
        .skill-pop { transition: transform .35s cubic-bezier(.2,.8,.2,1), filter .35s ease; }
        .skill-link { transition: stroke .3s ease, stroke-width .3s ease, opacity .3s ease; }
        @media (prefers-reduced-motion: reduce) { .skill-float { animation: none; } }
      `}</style>

      <Reveal>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full overflow-visible"
          role="group"
          aria-label="Skill constellation: three schools with their techniques"
        >
          {/* links between hubs */}
          {placed.slice(0, -1).map((p, i) => (
            <line
              key={p.school.id}
              x1={p.cx + HUB_R}
              y1={CY}
              x2={placed[i + 1].cx - HUB_R}
              y2={CY}
              strokeDasharray="2 10"
              strokeLinecap="round"
              style={{ stroke: 'hsl(var(--ancient-gold))', strokeWidth: 2, opacity: 0.4 }}
            />
          ))}

          {placed.map(({ school, cx, nodes }) => {
            const schoolActive = active?.schoolId === school.id;
            const dimmed = active !== null && !schoolActive;
            return (
              <g key={school.id} style={{ opacity: dimmed ? 0.22 : 1, transition: 'opacity .35s ease' }}>
                {/* spokes */}
                {nodes.map(({ skill, x, y }) => {
                  const lit = active?.skill.name === skill.name && schoolActive;
                  return (
                    <line
                      key={skill.name}
                      className="skill-link"
                      x1={cx}
                      y1={CY}
                      x2={x}
                      y2={y}
                      strokeDasharray="4 6"
                      strokeLinecap="round"
                      style={{
                        stroke: lit ? 'hsl(var(--crimson-red))' : 'hsl(var(--ancient-gold))',
                        strokeWidth: lit ? 2.5 : 1.5,
                        opacity: lit ? 1 : 0.5,
                        animation: 'dash 1.6s linear infinite',
                      }}
                    />
                  );
                })}

                {/* hub */}
                <circle cx={cx} cy={CY} r={HUB_R + 22} style={{ fill: 'hsl(var(--glow) / 0.07)' }} />
                <circle
                  cx={cx}
                  cy={CY}
                  r={HUB_R}
                  style={{
                    fill: 'hsl(var(--card))',
                    stroke: 'hsl(var(--crimson-red))',
                    strokeWidth: schoolActive ? 3 : 2,
                    transition: 'stroke-width .3s ease',
                  }}
                />
                <circle
                  cx={cx}
                  cy={CY}
                  r={HUB_R - 7}
                  fill="none"
                  strokeDasharray="1 5"
                  strokeLinecap="round"
                  style={{ stroke: 'hsl(var(--ancient-gold))', strokeWidth: 1.5 }}
                />
                <text
                  x={cx}
                  y={CY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-display"
                  style={{ fontSize: 46, fill: 'hsl(var(--crimson-red))' }}
                  aria-hidden="true"
                >
                  {school.zh}
                </text>
                <text
                  x={cx}
                  y={CY + HUB_R + 34}
                  textAnchor="middle"
                  className="font-mono"
                  style={{
                    fontSize: 15,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fill: 'hsl(var(--gold-ink))',
                    paintOrder: 'stroke',
                    stroke: 'hsl(var(--background))',
                    strokeWidth: 5,
                    strokeLinejoin: 'round',
                  }}
                >
                  {school.name}
                </text>

                {/* skills */}
                {nodes.map(({ skill, x, y, anchor, delay }) => {
                  const lit = schoolActive && active?.skill.name === skill.name;
                  const dx = anchor === 'start' ? NODE_R + 8 : anchor === 'end' ? -(NODE_R + 8) : 0;
                  const dy = anchor === 'middle' ? (y < CY ? -(NODE_R + 12) : NODE_R + 22) : 0;
                  return (
                    <g
                      key={skill.name}
                      className="skill-node"
                      tabIndex={0}
                      role="button"
                      aria-label={`${skill.name}: ${skill.note} (${school.name})`}
                      aria-pressed={lit}
                      onMouseEnter={() => setActive({ schoolId: school.id, skill })}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive({ schoolId: school.id, skill })}
                      onBlur={() => setActive(null)}
                      onClick={() => setActive({ schoolId: school.id, skill })}
                      style={{ opacity: schoolActive && !lit ? 0.6 : 1 }}
                    >
                      <g className="skill-float" style={{ animationDelay: `${delay}s` }}>
                        {/* generous hit area */}
                        <circle cx={x} cy={y} r={NODE_R + 14} fill="transparent" />
                        <g
                          className="skill-pop"
                          style={{
                            transformOrigin: `${x}px ${y}px`,
                            transform: lit ? 'scale(1.55)' : 'scale(1)',
                            filter: lit ? 'drop-shadow(0 0 7px hsl(var(--glow)))' : 'none',
                          }}
                        >
                          {lit && (
                            <circle
                              cx={x}
                              cy={y}
                              r={NODE_R + 6}
                              fill="none"
                              strokeDasharray="3 4"
                              style={{ stroke: 'hsl(var(--crimson-red))', strokeWidth: 1.5 }}
                            />
                          )}
                          <circle
                            cx={x}
                            cy={y}
                            r={NODE_R}
                            style={{
                              fill: lit ? 'hsl(var(--crimson-red))' : 'hsl(var(--background))',
                              stroke: lit ? 'hsl(var(--glow))' : 'hsl(var(--ancient-gold))',
                              strokeWidth: 2.5,
                              transition: 'fill .3s ease, stroke .3s ease',
                            }}
                          />
                        </g>
                        <text
                          x={x + dx}
                          y={y + dy}
                          textAnchor={anchor}
                          dominantBaseline={anchor === 'middle' ? 'auto' : 'central'}
                          className="font-mono"
                          style={{
                            fontSize: LABEL_SIZE,
                            fontWeight: lit ? 700 : 500,
                            fill: lit ? 'hsl(var(--crimson-red))' : 'hsl(var(--foreground))',
                            paintOrder: 'stroke',
                            stroke: 'hsl(var(--background))',
                            strokeWidth: 5,
                            strokeLinejoin: 'round',
                            pointerEvents: 'none',
                            transition: 'fill .3s ease',
                          }}
                        >
                          {skill.name}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </Reveal>

      {/* detail panel */}
      <div
        className="glass mx-auto mt-6 flex min-h-[7rem] max-w-2xl items-center gap-5 rounded-2xl p-5 sm:p-6"
        aria-live="polite"
        aria-atomic="true"
      >
        {active && activeSchool ? (
          <>
            <span
              aria-hidden
              className="seal font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-md text-3xl"
            >
              {activeSchool.zh}
            </span>
            <div className="min-w-0">
              <p className="kicker">{activeSchool.name}</p>
              <p className="font-display mt-1 text-3xl leading-tight text-foreground">{active.skill.name}</p>
              <p className="mt-1 text-muted-foreground">{active.skill.note}</p>
            </div>
          </>
        ) : (
          <p className="w-full text-center font-mono text-sm tracking-wide text-muted-foreground">
            Hover or focus a technique to read its story.
          </p>
        )}
      </div>
    </div>
  );
};

/* ---------- mobile cards ---------- */

const MobileSchools = () => (
  <div className="space-y-5 md:hidden">
    {schools.map((school, i) => (
      <Reveal key={school.id} delay={i * 80}>
        <article className="glass relative overflow-hidden rounded-2xl p-5">
          <span
            aria-hidden
            className="font-display pointer-events-none absolute -right-2 -top-4 select-none text-9xl leading-none text-wuxia-crimson/[0.08]"
          >
            {school.zh}
          </span>
          <header className="relative mb-4 flex items-center gap-4">
            <span
              aria-hidden
              className="seal font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-2xl"
            >
              {school.zh}
            </span>
            <h3 className="text-3xl leading-none text-foreground">{school.name}</h3>
          </header>
          <ul className="relative space-y-3">
            {school.skills.map((skill) => (
              <li key={skill.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="rounded-full border border-wuxia-crimson/50 bg-background/60 px-3 py-1 font-mono text-sm text-foreground">
                  {skill.name}
                </span>
                <span className="text-sm text-muted-foreground">{skill.note}</span>
              </li>
            ))}
          </ul>
        </article>
      </Reveal>
    ))}
  </div>
);

/* ---------- section ---------- */

const Skills = () => (
  <section id="skills" className="relative overflow-hidden px-5 py-24 sm:px-8 md:py-36">
    <div className="mx-auto max-w-6xl">
      <SectionHeading kicker="Martial techniques" zh="技">
        Three schools, <em>one blade</em>
      </SectionHeading>
      <Constellation />
      <MobileSchools />
    </div>
  </section>
);

export default Skills;
