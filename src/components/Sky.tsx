import { useMemo } from 'react';
import { useTheme } from 'next-themes';

/** Small deterministic PRNG so the star field is identical on every render. */
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const STAR_COUNT = 70;

const makeStars = () => {
  const rnd = mulberry32(0x7e3a5);
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    left: rnd() * 100,
    top: rnd() * 72,
    size: 1 + rnd() * 1.8,
    delay: rnd() * 6,
    duration: 2.6 + rnd() * 4,
    peak: 0.45 + rnd() * 0.55,
  }));
};

/**
 * Fixed full-screen sky. The gradient drifts with --p, the sun (light) or moon (dark)
 * rides the --sun-x/--sun-y arc, and stars twinkle at night. Pure CSS vars, no scroll state.
 */
const Sky = () => {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  const stars = useMemo(makeStars, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
      {/* Gradient that slides as the page scrolls */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(180deg, hsl(var(--sky-a)) 0%, hsl(var(--sky-b)) 100%)',
          backgroundSize: '100% 240%',
          backgroundPosition: '0 calc(var(--p, 0) * 100%)',
        }}
      />
      {/* Keeps text readable: pull the sky towards the page colour near the bottom */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(180deg, transparent 0%, hsl(var(--background) / 0.35) 55%, hsl(var(--background) / 0.75) 100%)',
        }}
      />

      {/* Stars (night only) */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: dark ? 1 : 0 }}
      >
        {stars.map((s) => (
          <span
            key={s.id}
            className="star absolute rounded-full"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              background: 'hsl(var(--rice-paper))',
              opacity: s.peak,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
              boxShadow: s.size > 2.2 ? '0 0 6px hsl(var(--rice-paper) / 0.8)' : undefined,
            }}
          />
        ))}
      </div>

      {/* Sun / moon on the scroll arc */}
      <div
        className="absolute"
        style={{
          left: 'var(--sun-x, 20%)',
          top: 'var(--sun-y, 30%)',
          width: 'clamp(9rem, 24vmin, 17rem)',
          aspectRatio: '1',
          transform: 'translate(-50%, -50%)',
          opacity: dark ? 0.5 : 0.62, // keep headings legible when the orb drifts behind them
        }}
      >
        {/* Sun */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: dark ? 0 : 1 }}
        >
          <div
            className="absolute rounded-full"
            style={{
              inset: '-60%',
              background:
                'radial-gradient(circle, hsl(var(--glow) / 0.22) 0%, hsl(var(--glow) / 0.08) 38%, transparent 66%)',
            }}
          />
          <div
            className="absolute inset-[8%] rounded-full"
            style={{
              background:
                'radial-gradient(circle at 38% 34%, hsl(var(--crimson-red) / 0.78), hsl(var(--crimson-red) / 0.62) 70%)',
              boxShadow: '0 0 60px 14px hsl(var(--glow) / 0.28)',
            }}
          />
        </div>

        {/* Moon */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: dark ? 1 : 0 }}
        >
          <div
            className="absolute rounded-full"
            style={{
              inset: '-70%',
              background:
                'radial-gradient(circle, hsl(var(--rice-paper) / 0.14) 0%, hsl(var(--rice-paper) / 0.05) 36%, transparent 66%)',
            }}
          />
          <div
            className="absolute inset-[14%] rounded-full"
            style={{
              background: [
                'radial-gradient(circle at 34% 40%, hsl(250 12% 70% / 0.45) 0 7%, transparent 8%)',
                'radial-gradient(circle at 62% 28%, hsl(250 12% 70% / 0.35) 0 5%, transparent 6%)',
                'radial-gradient(circle at 58% 66%, hsl(250 12% 70% / 0.4) 0 9%, transparent 10%)',
                'radial-gradient(circle at 36% 30%, hsl(var(--rice-paper)), hsl(40 18% 80%) 75%)',
              ].join(', '),
              boxShadow:
                '0 0 40px 8px hsl(var(--rice-paper) / 0.28), 0 0 120px 30px hsl(var(--rice-paper) / 0.12)',
              opacity: 0.92,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Sky;
