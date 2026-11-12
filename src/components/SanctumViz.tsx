import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const GRID = 5;
const SEED_MS = 3500;
const FADE_MS = 900;
const MONO = '"JetBrains Mono", ui-monospace, monospace';

type Cell = { a: number; shape: number };
type Sigil = { cells: Cell[]; digits: string };

const mulberry = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** 5x5 mirrored identicon plus a 25-digit safety number, both derived from one seed. */
const makeSigil = (seed: number): Sigil => {
  const rnd = mulberry(seed);
  const half = Math.ceil(GRID / 2);
  const cells: Cell[] = new Array<Cell>(GRID * GRID);
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < half; x++) {
      const r = rnd();
      const c: Cell = { a: r < 0.3 ? 0 : r < 0.55 ? 0.35 : r < 0.8 ? 0.65 : 1, shape: Math.floor(rnd() * 3) };
      cells[y * GRID + x] = c;
      cells[y * GRID + (GRID - 1 - x)] = c;
    }
  }
  let digits = '';
  for (let i = 0; i < 25; i++) digits += Math.floor(rnd() * 10);
  return { cells, digits };
};

const hsla = (triple: string, a: number) => `hsl(${triple} / ${Math.max(0, Math.min(1, a))})`;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const drawLock = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  ctx.lineWidth = Math.max(1, s * 0.16);
  ctx.beginPath();
  ctx.arc(x, y - s * 0.12, s * 0.28, Math.PI, 0);
  ctx.stroke();
  ctx.fillRect(x - s * 0.42, y - s * 0.12, s * 0.84, s * 0.62);
};

const groups = (d: string) => `${d.slice(0, 5)} ${d.slice(5, 10)} ${d.slice(10, 15)} ${d.slice(15, 20)} ${d.slice(20, 25)}`;

/**
 * Canvas visual for SANCTUM: a safety-number sigil that regenerates every few
 * seconds, ringed by rotating onion hops with encrypted packets in transit.
 */
const SanctumViz = ({ className }: { className?: string }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = reduceMq.matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let alive = true;
    let last = 0;
    let clock = 0; // seconds of animation time
    let epoch = 0; // index of current seed
    let seedAt = 0; // clock (ms) when the current sigil appeared
    let base = (Math.random() * 1e9) | 0;
    let prev = makeSigil(base);
    let cur = prev;
    let pal = { sanctum: '162 78% 34%', fg: '232 28% 8%', border: '40 14% 78%', card: '42 30% 96%' };

    const readPalette = () => {
      const cs = getComputedStyle(document.documentElement);
      const get = (n: string, f: string) => cs.getPropertyValue(n).trim() || f;
      pal = {
        sanctum: get('--sanctum', pal.sanctum),
        fg: get('--foreground', pal.fg),
        border: get('--border', pal.border),
        card: get('--card', pal.card),
      };
    };

    const drawCell = (x: number, y: number, s: number, shape: number, fill: string) => {
      ctx.fillStyle = fill;
      if (shape === 0) {
        ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
      } else if (shape === 1) {
        ctx.beginPath();
        ctx.arc(x + s / 2, y + s / 2, s / 2 - 1, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(x + s / 2, y + 0.5);
        ctx.lineTo(x + s - 0.5, y + s / 2);
        ctx.lineTo(x + s / 2, y + s - 0.5);
        ctx.lineTo(x + 0.5, y + s / 2);
        ctx.closePath();
        ctx.fill();
      }
    };

    const draw = () => {
      if (w < 10 || h < 10) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const ms = clock * 1000;
      const since = ms - seedAt;
      const fade = ease(Math.min(1, since / FADE_MS));

      const capH = 46;
      const availH = h - capH;
      const R = Math.max(40, Math.min(w / 2 - 10, availH / 2 - 4));
      const cx = w / 2;
      const cy = 6 + availH / 2;
      const rings = [R * 0.5, R * 0.74, R * 0.98];
      const speeds = [0.34, -0.21, 0.12];
      const counts = [3, 4, 5];
      const sanct = pal.sanctum;

      // dashed rings
      ctx.lineWidth = 1;
      for (let r = 0; r < 3; r++) {
        ctx.setLineDash([2 + r * 2, 5 + r * 2]);
        ctx.strokeStyle = hsla(sanct, 0.5 - r * 0.1);
        ctx.beginPath();
        ctx.arc(cx, cy, rings[r], 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // node positions per ring
      const nodes: { x: number; y: number }[][] = rings.map((rad, r) => {
        const out: { x: number; y: number }[] = [];
        for (let k = 0; k < counts[r]; k++) {
          const ang = clock * speeds[r] + (k / counts[r]) * Math.PI * 2 + r * 0.9;
          out.push({ x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad });
        }
        return out;
      });

      // circuit: outer hop -> middle hop -> inner hop -> sigil
      const path = [nodes[2][0], nodes[1][1], nodes[0][2], { x: cx, y: cy }];
      ctx.strokeStyle = hsla(sanct, 0.35);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
      ctx.stroke();

      // nodes
      for (let r = 0; r < 3; r++) {
        for (const n of nodes[r]) {
          ctx.fillStyle = hsla(pal.card, 1);
          ctx.beginPath();
          ctx.arc(n.x, n.y, 3.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = hsla(sanct, 0.9);
          ctx.lineWidth = 1.25;
          ctx.stroke();
        }
      }
      for (const n of path.slice(0, 3)) {
        ctx.fillStyle = hsla(sanct, 1);
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // sigil
      const side = Math.floor((rings[0] * 1.3) / GRID) * GRID;
      const cell = side / GRID;
      const sx = cx - side / 2;
      const sy = cy - side / 2;
      ctx.fillStyle = hsla(pal.card, 1);
      ctx.fillRect(sx - 6, sy - 6, side + 12, side + 12);
      ctx.strokeStyle = hsla(pal.border, 1);
      ctx.lineWidth = 1;
      ctx.strokeRect(sx - 6.5, sy - 6.5, side + 13, side + 13);
      for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
          const i = y * GRID + x;
          const p = prev.cells[i];
          const c = cur.cells[i];
          if (fade < 1 && p.a > 0) drawCell(sx + x * cell, sy + y * cell, cell, p.shape, hsla(sanct, p.a * (1 - fade)));
          if (c.a > 0) drawCell(sx + x * cell, sy + y * cell, cell, c.shape, hsla(sanct, c.a * fade));
        }
      }

      // packets (little padlocks) riding the circuit
      const seg = [0, 0, 0];
      let total = 0;
      for (let i = 0; i < 3; i++) {
        seg[i] = Math.hypot(path[i + 1].x - path[i].x, path[i + 1].y - path[i].y);
        total += seg[i];
      }
      const packets = reduced ? [0.18, 0.5, 0.82] : [0, 1, 2].map((k) => (clock * 0.22 + k / 3) % 1);
      for (const u of packets) {
        let d = u * total;
        let i = 0;
        while (i < 2 && d > seg[i]) {
          d -= seg[i];
          i++;
        }
        const f = seg[i] ? d / seg[i] : 0;
        const px = path[i].x + (path[i + 1].x - path[i].x) * f;
        const py = path[i].y + (path[i + 1].y - path[i].y) * f;
        ctx.fillStyle = hsla(pal.card, 1);
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = hsla(sanct, 1);
        ctx.fillStyle = hsla(sanct, 1);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.stroke();
        drawLock(ctx, px, py + 0.5, 7);
      }

      // caption: label + scrambling safety number
      const digits = cur.digits;
      const settleBase = reduced ? 1e6 : since;
      let shown = '';
      for (let i = 0; i < 25; i++) {
        const settleAt = 120 + i * 24;
        if (settleBase >= settleAt) shown += digits[i];
        else shown += Math.floor(mulberry(i * 977 + Math.floor(ms / 55) * 31 + epoch)() * 10);
      }
      const text = groups(shown);
      const fs = Math.max(9, Math.min(13, (w - 24) / (text.length * 0.62)));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.font = `${Math.max(8.5, fs - 3)}px ${MONO}`;
      ctx.fillStyle = hsla(pal.fg, 0.55);
      ctx.fillText('SAFETY NUMBER', cx, h - 26);
      ctx.font = `500 ${fs}px ${MONO}`;
      ctx.fillStyle = hsla(pal.fg, 0.92);
      ctx.fillText(text, cx, h - 8);
    };

    const advance = () => {
      const ms = clock * 1000;
      while (ms - seedAt >= SEED_MS) {
        seedAt += SEED_MS;
        epoch++;
        prev = cur;
        base = (base * 1664525 + 1013904223) | 0;
        cur = makeSigil(base ^ Math.imul(epoch, 0x9e3779b1));
      }
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      draw();
    };

    const tick = (now: number) => {
      raf = 0;
      if (!alive || !visible || reduced) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      clock += dt;
      advance();
      draw();
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (raf || !visible || reduced || !alive) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const freeze = () => {
      // one settled, fully faded-in frame
      prev = cur;
      seedAt = -FADE_MS * 10;
      clock = 1.2;
      draw();
    };

    readPalette();
    if (reduced) freeze();
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const mo = new MutationObserver(() => {
      readPalette();
      if (reduced) draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const onReduce = () => {
      reduced = reduceMq.matches;
      if (reduced) {
        stop();
        freeze();
      } else {
        seedAt = clock * 1000;
        start();
      }
    };
    reduceMq.addEventListener('change', onReduce);
    start();

    return () => {
      alive = false;
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      reduceMq.removeEventListener('change', onReduce);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="A safety-number sigil that regenerates every few seconds, ringed by rotating relay nodes with encrypted packets passing between them."
      className={cn('block h-full w-full', className)}
    />
  );
};

export default SanctumViz;
