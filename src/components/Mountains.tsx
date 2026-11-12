import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = { className?: string; parallax?: boolean };

const W = 1440;
const H = 500;

const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Pt = [number, number];

/** Jagged, hand-inked ridge line: broad swells with sharp random peaks. */
const ridge = (seed: number, base: number, amp: number, steps: number): Pt[] => {
  const rnd = mulberry32(seed);
  const pts: Pt[] = [];
  const dx = W / steps;
  for (let i = 0; i <= steps; i++) {
    const x = i === 0 ? 0 : i === steps ? W : i * dx + (rnd() - 0.5) * dx * 0.7;
    const swell = Math.sin((i / steps) * Math.PI * 2.4 + seed) * amp * 0.45;
    const peak = i % 2 === 0 ? -rnd() * amp * 0.75 : rnd() * amp * 0.35;
    pts.push([Math.round(x), Math.round(base + swell + peak)]);
  }
  return pts;
};

const toPath = (pts: Pt[]) =>
  `M0 ${H} L${pts.map(([x, y]) => `${x} ${y}`).join(' L')} L${W} ${H} Z`;

/** Ridge height at a given x, by linear interpolation. */
const ridgeY = (pts: Pt[], x: number) => {
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1];
    const [x2, y2] = pts[i];
    if (x <= x2) return y1 + ((y2 - y1) * (x - x1)) / Math.max(1, x2 - x1);
  }
  return pts[pts.length - 1][1];
};

const Bamboo = ({ x, y, h, lean }: { x: number; y: number; h: number; lean: number }) => {
  const topX = x + lean;
  const nodes = Math.floor(h / 34);
  return (
    <g stroke="hsl(var(--mount-3))" strokeLinecap="round" fill="none">
      <path d={`M${x} ${y} Q${x + lean * 0.2} ${y - h * 0.5} ${topX} ${y - h}`} strokeWidth="4" />
      {Array.from({ length: nodes }, (_, i) => {
        const t = (i + 1) / (nodes + 1);
        const nx = x + lean * t * t;
        const ny = y - h * t;
        return (
          <g key={i}>
            <path d={`M${nx - 4} ${ny} L${nx + 4} ${ny}`} strokeWidth="2" />
            {i % 2 === 0 && (
              <path
                d={`M${nx} ${ny} q${i % 4 === 0 ? 22 : -22} -6 ${i % 4 === 0 ? 38 : -38} 8`}
                strokeWidth="2.4"
              />
            )}
          </g>
        );
      })}
    </g>
  );
};

const Pagoda = ({ x, y }: { x: number; y: number }) => (
  <g fill="hsl(var(--mount-2))" opacity="0.8" transform={`translate(${x} ${y})`}>
    {/* base reaches below the ridge so it never floats */}
    <rect x="-14" y="-6" width="28" height="40" />
    {[0, 1, 2, 3].map((i) => {
      const w = 44 - i * 8;
      const top = -10 - i * 20;
      return (
        <g key={i}>
          <rect x={-w / 2 + 6} y={top - 12} width={w - 12} height="12" />
          <path d={`M${-w / 2 - 12} ${top - 10} Q${-w / 2 + 4} ${top - 12} 0 ${top - 24} Q${w / 2 - 4} ${top - 12} ${w / 2 + 12} ${top - 10} Q0 ${top - 14} ${-w / 2 - 12} ${top - 10} Z`} />
        </g>
      );
    })}
    <rect x="-1.5" y="-112" width="3" height="22" />
  </g>
);

const Mountains = ({ className, parallax = false }: Props) => {
  const shapes = useMemo(() => {
    const far = ridge(11, 190, 120, 14);
    const mid = ridge(23, 290, 90, 18);
    const near = ridge(37, 385, 70, 22);
    return {
      far: { pts: far, d: toPath(far) },
      mid: { pts: mid, d: toPath(mid) },
      near: { pts: near, d: toPath(near) },
    };
  }, []);

  const move = (factor: number): CSSProperties | undefined =>
    parallax
      ? {
          transform: `translate3d(0, min(calc(var(--sy, 0px) * ${factor}), 320px), 0)`,
          willChange: 'transform',
        }
      : undefined;

  const mist = (cls: string, top: string, color: string): ReactNode => (
    <div className="absolute inset-x-0 overflow-hidden" style={{ top, height: '26%' }}>
      <div
        className={cn(cls, 'absolute -inset-x-[15%] inset-y-0')}
        style={{
          background: `radial-gradient(ellipse 55% 50% at 30% 50%, hsl(${color} / 0.55), transparent 70%), radial-gradient(ellipse 50% 45% at 78% 55%, hsl(${color} / 0.45), transparent 70%)`,
          filter: 'blur(6px)',
        }}
      />
    </div>
  );

  const layer = 'absolute inset-0 h-full w-full';
  const farY = ridgeY(shapes.far.pts, 760);

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none relative w-full overflow-hidden', !className && 'aspect-[1440/500]', className)}
    >
      {/* Far range with pagoda */}
      <div className="absolute inset-0" style={move(0.34)}>
        <svg className={layer} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
          <path d={shapes.far.d} fill="hsl(var(--mount-1))" opacity="0.55" />
          <Pagoda x={760} y={farY + 4} />
        </svg>
      </div>

      {mist('mist-a', '22%', 'var(--sky-a)')}

      {/* Middle range */}
      <div className="absolute inset-0" style={move(0.2)}>
        <svg className={layer} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
          <path d={shapes.mid.d} fill="hsl(var(--mount-2))" opacity="0.82" />
        </svg>
      </div>

      {mist('mist-b', '42%', 'var(--sky-b)')}

      {/* Near range with bamboo */}
      <div className="absolute inset-0" style={move(0.08)}>
        <svg className={layer} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
          <path d={shapes.near.d} fill="hsl(var(--mount-3))" />
          <Bamboo x={120} y={ridgeY(shapes.near.pts, 120) + 6} h={170} lean={-14} />
          <Bamboo x={152} y={ridgeY(shapes.near.pts, 152) + 6} h={120} lean={10} />
          <Bamboo x={640} y={ridgeY(shapes.near.pts, 640) + 6} h={130} lean={-10} />
          <Bamboo x={668} y={ridgeY(shapes.near.pts, 668) + 6} h={175} lean={12} />
          <Bamboo x={1290} y={ridgeY(shapes.near.pts, 1290) + 6} h={150} lean={12} />
          <Bamboo x={1322} y={ridgeY(shapes.near.pts, 1322) + 6} h={105} lean={-8} />
        </svg>
      </div>
    </div>
  );
};

export default Mountains;
