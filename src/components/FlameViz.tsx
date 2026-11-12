import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const TOKENS = ['the', 'model', 'learns', 'to', 'speak', 'rust'];
const N = TOKENS.length;

type Palette = { flame: string; fg: string; border: string; card: string };

const readTriple = (name: string, fallback: string) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

const hsla = (triple: string, a: number) => `hsl(${triple} / ${Math.max(0, Math.min(1, a))})`;

/** Causal, row-softmaxed attention weights that drift smoothly with time. */
const attention = (t: number, out: number[][]) => {
  for (let i = 0; i < N; i++) {
    let sum = 0;
    const row = out[i];
    for (let j = 0; j < N; j++) {
      if (j > i) {
        row[j] = 0;
        continue;
      }
      const logit =
        1.9 * Math.sin(t * 0.55 + i * 1.31 + j * 0.87) +
        1.4 * Math.sin(t * 0.83 + j * 2.13 - i * 0.4) +
        0.9 * Math.cos(t * 0.31 + (i - j) * 0.9) -
        0.35 * (i - j);
      row[j] = Math.exp(logit);
      sum += row[j];
    }
    for (let j = 0; j <= i; j++) row[j] /= sum;
  }
};

/**
 * Canvas visual for FLAME: a Transformer self-attention matrix whose weights
 * drift over time. Hover or touch a row to highlight that query token.
 */
const FlameViz = ({ className }: { className?: string }) => {
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
    let hover = -1;
    let last = 0;
    let clock = 0;
    const hl = new Array<number>(N).fill(0);
    const m: number[][] = Array.from({ length: N }, () => new Array<number>(N).fill(0));
    let pal: Palette = { flame: '16 96% 50%', fg: '232 28% 8%', border: '40 14% 78%', card: '42 30% 96%' };

    const readPalette = () => {
      pal = {
        flame: readTriple('--flame', pal.flame),
        fg: readTriple('--foreground', pal.fg),
        border: readTriple('--border', pal.border),
        card: readTriple('--card', pal.card),
      };
    };

    const geometry = () => {
      const fs = w < 380 ? 9.5 : 11;
      ctx.font = `${fs}px "JetBrains Mono", ui-monospace, monospace`;
      let labelW = 0;
      for (const tk of TOKENS) labelW = Math.max(labelW, ctx.measureText(tk).width);
      const padL = Math.ceil(labelW) + 14;
      const padT = fs + 22;
      const padR = 14;
      const padB = 36;
      const cell = Math.max(8, Math.floor(Math.min((w - padL - padR) / N, (h - padT - padB) / N)));
      const gridW = cell * N;
      const x0 = padL + Math.max(0, Math.floor((w - padL - padR - gridW) / 2));
      const y0 = padT + Math.max(0, Math.floor((h - padT - padB - gridW) / 2));
      return { fs, cell, x0, y0 };
    };

    const draw = () => {
      if (w < 10 || h < 10) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      attention(clock, m);
      const { fs, cell, x0, y0 } = geometry();
      const gap = Math.max(1.5, cell * 0.06);
      const mono = `${fs}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.font = mono;
      ctx.textBaseline = 'middle';

      // axis captions
      ctx.fillStyle = hsla(pal.fg, 0.5);
      ctx.textAlign = 'left';
      ctx.fillText('keys →', x0, Math.max(fs, y0 - fs - 22));

      // token labels
      for (let i = 0; i < N; i++) {
        const on = hl[i];
        ctx.fillStyle = on > 0.02 ? hsla(pal.flame, 0.55 + on * 0.45) : hsla(pal.fg, 0.7);
        ctx.textAlign = 'right';
        ctx.fillText(TOKENS[i], x0 - 10, y0 + i * cell + cell / 2);

        ctx.save();
        ctx.translate(x0 + i * cell + cell / 2, y0 - 8);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = hsla(pal.fg, 0.6);
        ctx.textAlign = 'left';
        ctx.fillText(TOKENS[i], 0, 0);
        ctx.restore();
      }

      // highlight band behind the hovered query row
      for (let i = 0; i < N; i++) {
        if (hl[i] > 0.01) {
          ctx.fillStyle = hsla(pal.flame, 0.08 * hl[i]);
          ctx.fillRect(x0 - 4, y0 + i * cell - 1, cell * N + 8, cell + 2);
        }
      }

      // cells
      const hmax = Math.max(...hl);
      for (let i = 0; i < N; i++) {
        let best = 0;
        for (let j = 0; j <= i; j++) if (m[i][j] > m[i][best]) best = j;
        for (let j = 0; j < N; j++) {
          const cx = x0 + j * cell;
          const cy = y0 + i * cell;
          const s = cell - gap;
          if (j > i) {
            // masked future: a quiet dot
            ctx.fillStyle = hsla(pal.border, 0.9);
            ctx.beginPath();
            ctx.arc(cx + cell / 2, cy + cell / 2, Math.max(1, cell * 0.04), 0, Math.PI * 2);
            ctx.fill();
            continue;
          }
          // sqrt keeps weak weights visible while the peaks still pop
          const v = Math.sqrt(m[i][j]);
          const dim = 1 - 0.55 * hmax * (1 - hl[i]);
          const a = (0.07 + v * 0.93) * dim;
          ctx.fillStyle = hsla(pal.border, 0.45);
          ctx.fillRect(cx + gap / 2, cy + gap / 2, s, s);
          ctx.fillStyle = hsla(pal.flame, a);
          ctx.fillRect(cx + gap / 2, cy + gap / 2, s, s);

          if (j === best && m[i][j] > 0.28) {
            // ember: the strongest cell per row runs hot
            const heat = Math.min(1, (m[i][j] - 0.2) * 1.6) * dim;
            const mx = cx + cell / 2;
            const my = cy + cell / 2;
            const g = ctx.createRadialGradient(mx, my, 0, mx, my, cell * 0.95);
            g.addColorStop(0, hsla('42 100% 78%', 0.55 * heat));
            g.addColorStop(0.35, hsla(pal.flame, 0.35 * heat));
            g.addColorStop(1, hsla(pal.flame, 0));
            ctx.fillStyle = g;
            ctx.fillRect(mx - cell, my - cell, cell * 2, cell * 2);
            ctx.fillStyle = hsla('42 100% 88%', 0.85 * heat);
            const core = Math.max(2, cell * 0.16);
            ctx.fillRect(mx - core / 2, my - core / 2, core, core);
            if (!reduced) {
              // two sparks drifting up out of the cell
              for (let k = 0; k < 2; k++) {
                const ph = (clock * 0.7 + k * 0.5 + i * 0.37) % 1;
                ctx.fillStyle = hsla('36 100% 70%', (1 - ph) * 0.8 * heat);
                const sz = Math.max(1.5, cell * 0.05);
                ctx.fillRect(mx + (k ? 1 : -1) * cell * 0.18 * Math.sin(ph * 6 + i) - sz / 2, my - ph * cell * 0.9, sz, sz);
              }
            }
          }
        }
      }

      // frame + caption
      ctx.strokeStyle = hsla(pal.border, 1);
      ctx.lineWidth = 1;
      ctx.strokeRect(x0 - 0.5, y0 - 0.5, cell * N + 1, cell * N + 1);
      ctx.fillStyle = hsla(pal.fg, 0.5);
      ctx.textAlign = 'left';
      ctx.fillText('↓ queries', x0, y0 + cell * N + 16);
      ctx.textAlign = 'right';
      const row = hover >= 0 ? hover : -1;
      ctx.fillText(row >= 0 ? `softmax(QKᵀ/√d) · row "${TOKENS[row]}"` : 'softmax(QKᵀ/√d)', x0 + cell * N, y0 + cell * N + 16);
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
      for (let i = 0; i < N; i++) hl[i] += ((i === hover ? 1 : 0) - hl[i]) * Math.min(1, dt * 10);
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

    const setHover = (row: number) => {
      if (row === hover) return;
      hover = row;
      if (reduced) {
        for (let i = 0; i < N; i++) hl[i] = i === hover ? 1 : 0;
        draw();
      }
    };
    const rowAt = (ev: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const { cell, y0 } = geometry();
      const row = Math.floor((ev.clientY - r.top - y0) / cell);
      return row >= 0 && row < N ? row : -1;
    };
    const onMove = (ev: PointerEvent) => setHover(rowAt(ev));
    const onLeave = () => setHover(-1);

    clock = reduced ? 4.2 : 0;
    readPalette();
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
        clock = 4.2;
        draw();
      } else start();
    };
    reduceMq.addEventListener('change', onReduce);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    start();

    return () => {
      alive = false;
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      reduceMq.removeEventListener('change', onReduce);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Animated self-attention matrix for the sentence: the model learns to speak rust. Each row shows how strongly one token attends to the tokens before it."
      className={cn('block h-full w-full touch-pan-y', className)}
    />
  );
};

export default FlameViz;
