import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion';

type F = { x: number; y: number; vx: number; vy: number; r: number; depth: number; ph: number };
type Col = { x: number; y: number; speed: number; len: number; chars: string[] };

const GLYPHS = '劍俠武道氣龍虎風雷火山水心魂0101<>{}[]=;'.split('');

/**
 * Behind-content particle universe:
 *  - fireflies that link into a living constellation, flee the cursor,
 *    swirl into a vortex while you hold the pointer, and drift with scroll
 *  - kanji / code rain hugging both edges of wide screens
 */
const Particles = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const reduced = usePrefersReducedMotion();
  const dark = resolvedTheme === 'dark';

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, raf = 0;
    let mx = -9999, my = -9999, down = false, lastScroll = window.scrollY;
    let flies: F[] = [];
    let cols: Col[] = [];

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const n = Math.max(28, Math.min(90, Math.floor((w * h) / 17000)));
      flies = Array.from({ length: n }, () => ({
        x: rnd(0, w), y: rnd(0, h), vx: rnd(-0.25, 0.25), vy: rnd(-0.25, 0.25),
        r: rnd(1, 2.6), depth: rnd(0.2, 1), ph: rnd(0, 6.28),
      }));

      cols = [];
      if (w >= 900) {
        const edge = Math.min(120, w * 0.07);
        for (let x = 6; x < edge; x += 18) {
          for (const bx of [x, w - x]) {
            cols.push({
              x: bx, y: rnd(-h, 0), speed: rnd(0.6, 1.8), len: Math.floor(rnd(8, 20)),
              chars: Array.from({ length: 24 }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]),
            });
          }
        }
      }
    };

    const onMove = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
    const onDown = () => { down = true; };
    const onUp = () => { down = false; };
    const onLeave = () => { mx = my = -9999; };

    const dotC = dark ? '255,214,140' : '70,48,36';
    const hotC = dark ? '255,92,70' : '176,32,32';
    const rainC = dark ? '255,214,140' : '60,40,30';

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, w, h);

      const sy = window.scrollY;
      const dScroll = sy - lastScroll;
      lastScroll = sy;

      ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';

      // --- fireflies
      for (const f of flies) {
        f.ph += 0.02;
        f.vx += Math.cos(f.ph) * 0.004;
        f.vy += Math.sin(f.ph * 1.3) * 0.004;

        const dx = f.x - mx, dy = f.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22000) {
          const d = Math.sqrt(d2) || 1;
          const force = (1 - d / 148) * (down ? -0.9 : 0.55);
          f.vx += (dx / d) * force + (down ? (-dy / d) * 0.5 : 0);
          f.vy += (dy / d) * force + (down ? (dx / d) * 0.5 : 0);
        }

        f.vx *= 0.97; f.vy *= 0.97;
        f.x += f.vx; f.y += f.vy - dScroll * 0.18 * f.depth;
        if (f.x < -10) f.x = w + 10; else if (f.x > w + 10) f.x = -10;
        if (f.y < -10) f.y = h + 10; else if (f.y > h + 10) f.y = -10;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < flies.length; i++) {
        const a = flies[i];
        for (let j = i + 1; j < flies.length; j++) {
          const b = flies[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 12100) {
            const al = (1 - Math.sqrt(d2) / 110) * (dark ? 0.28 : 0.22);
            ctx.strokeStyle = `rgba(${dotC},${al})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const near = Math.hypot(a.x - mx, a.y - my) < 150;
        const tw = 0.55 + Math.sin(a.ph * 2) * 0.35;
        const col = near ? hotC : dotC;
        const rad = a.r * (near ? 1.8 : 1);
        const g = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, rad * 5);
        g.addColorStop(0, `rgba(${col},${(dark ? 0.9 : 0.6) * tw})`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(a.x, a.y, rad * 5, 0, 6.2832); ctx.fill();
      }

      // --- kanji / code rain
      ctx.globalCompositeOperation = 'source-over';
      ctx.font = '15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      for (const c of cols) {
        c.y += c.speed;
        if (c.y - c.len * 18 > h) {
          c.y = rnd(-200, 0); c.speed = rnd(0.6, 1.8);
          c.chars[Math.floor(Math.random() * c.chars.length)] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        for (let k = 0; k < c.len; k++) {
          const yy = c.y - k * 18;
          if (yy < -18 || yy > h + 18) continue;
          const a = (1 - k / c.len) * (dark ? 0.32 : 0.2);
          ctx.fillStyle = k === 0 ? `rgba(${hotC},${a * 2})` : `rgba(${rainC},${a})`;
          ctx.fillText(c.chars[(k + Math.floor(t / 400)) % c.chars.length], c.x, yy);
        }
      }
    };

    setup();
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', setup);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', setup);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [dark, reduced]);

  if (reduced) return null;
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[2]" />;
};

export default Particles;
