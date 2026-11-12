import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion';

type Dot = { ox: number; oy: number; x: number; y: number; vx: number; vy: number; r: number; tone: number };

type Props = {
  text: string;
  /** Height of the canvas in px. */
  height: number;
  /** Applied to the wrapper; its font-family / font-weight are used to draw the word. */
  className?: string;
  /** Radius of the cursor's push, as a fraction of height (default 0.5, capped at 240px). */
  reach?: number;
  /** Align the word inside the box. */
  align?: 'left' | 'center';
  /** Set false to skip the scatter-in on mount. */
  intro?: boolean;
};

const readVar = (el: Element, name: string, fallback: string) => {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v ? `hsl(${v})` : fallback;
};

/**
 * A word built from dots. Dots start scattered and spring home, flee the cursor
 * (or a finger), glow in the accent colour while they travel, and explode on
 * click. The loop sleeps whenever everything is at rest or off screen.
 *
 * Listens for a window `particles-burst` event so the page can detonate every word at once.
 */
const ParticleText = ({ text, height, className = '', reach = 0.5, align = 'center', intro = true }: Props) => {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  // re-run colour sampling when the theme class flips
  const [themeTick, setThemeTick] = useState(0);

  useEffect(() => {
    const mo = new MutationObserver(() => setThemeTick((t) => t + 1));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const host = wrap.current;
    const canvas = cv.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let dots: Dot[] = [];
    let w = 0;
    let raf = 0;
    let awake = false;
    let alive = true;
    let visible = true;
    const mouse = { x: -9999, y: -9999 };
    let ink = '#111';
    let spark = '#33f';
    let inkSoft = '#444';

    const radius = () => Math.min(height * reach, 240);

    const paint = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, height);
      for (const d of dots) {
        const sp = d.vx * d.vx + d.vy * d.vy;
        ctx.fillStyle = sp > 0.9 ? spark : d.tone === 2 ? spark : d.tone === 1 ? inkSoft : ink;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      if (!awake || !alive) return;
      const R = radius();
      let rest = true;
      for (const d of dots) {
        d.vx = (d.vx + (d.ox - d.x) * 0.03) * 0.86;
        d.vy = (d.vy + (d.oy - d.y) * 0.03) * 0.86;
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < R && dist > 0.01) {
          const f = ((R - dist) / R) * 2.8;
          d.vx += (dx / dist) * f;
          d.vy += (dy / dist) * f;
        }
        d.x += d.vx;
        d.y += d.vy;
        const ex = d.ox - d.x;
        const ey = d.oy - d.y;
        if (ex * ex + ey * ey > 0.09 || d.vx * d.vx + d.vy * d.vy > 0.0009) rest = false;
      }
      if (rest && mouse.x < -999) {
        for (const d of dots) { d.x = d.ox; d.y = d.oy; d.vx = 0; d.vy = 0; }
        paint();
        awake = false;
        raf = 0;
        return;
      }
      paint();
      raf = requestAnimationFrame(step);
    };

    const wake = () => {
      if (awake || !visible || reduced) return;
      awake = true;
      raf = requestAnimationFrame(step);
    };

    const explode = (cx?: number, cy?: number) => {
      for (const d of dots) {
        const a = Math.random() * Math.PI * 2;
        let s = 6 + Math.random() * 16;
        if (cx !== undefined && cy !== undefined) {
          const dx = d.x - cx;
          const dy = d.y - cy;
          const dist = Math.hypot(dx, dy) || 1;
          s = Math.max(2, 22 - dist * 0.05) * (0.5 + Math.random());
          d.vx += (dx / dist) * s;
          d.vy += (dy / dist) * s;
        } else {
          d.vx += Math.cos(a) * s;
          d.vy += Math.sin(a) * s;
        }
      }
      wake();
    };

    const build = () => {
      const cs = getComputedStyle(host);
      ink = readVar(host, '--ink', cs.color || '#111');
      spark = readVar(host, '--spark', '#33f');
      inkSoft = readVar(host, '--ink-soft', ink);

      w = host.clientWidth;
      if (w < 10) return;
      const family = cs.fontFamily || 'sans-serif';
      const weight = cs.fontWeight || '800';

      // measure the word on an offscreen canvas
      const probe = document.createElement('canvas');
      const pw = Math.max(Math.ceil(w * 2), 800);
      const ph = Math.max(Math.round(height * 1.8), height + 24);
      probe.width = pw;
      probe.height = ph;
      const pc = probe.getContext('2d', { willReadFrequently: true });
      if (!pc) return;
      let size = height * 0.9;
      const draw = () => {
        pc.clearRect(0, 0, pw, ph);
        pc.font = `${weight} ${size}px ${family}`;
        pc.textBaseline = 'middle';
        pc.fillStyle = '#000';
        pc.fillText(text, 8, ph / 2);
      };
      const bounds = () => {
        const data = pc.getImageData(0, 0, pw, ph).data;
        let minX = pw, maxX = -1, minY = ph, maxY = -1;
        for (let y = 0; y < ph; y++) {
          for (let x = 0; x < pw; x++) {
            if (data[(y * pw + x) * 4 + 3] > 128) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        return { data, minX, maxX, minY, maxY };
      };
      draw();
      let b = bounds();
      if (b.maxX < 0) return;
      const fit = Math.min(1, (w - 8) / (b.maxX - b.minX + 1), (height - 4) / (b.maxY - b.minY + 1));
      if (fit < 1) {
        size *= fit;
        draw();
        b = bounds();
        if (b.maxX < 0) return;
      }
      const bw = b.maxX - b.minX + 1;
      const bh = b.maxY - b.minY + 1;
      const cw = Math.min(bw + 8, w);
      canvas.width = Math.max(1, Math.round(cw * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${height}px`;
      canvas.style.marginLeft = align === 'center' ? `${(w - cw) / 2}px` : '0';
      const offX = (cw - bw) / 2 - b.minX;
      const offY = (height - bh) / 2 - b.minY;
      const pitch = Math.max(height < 60 ? 2 : 3, Math.round(height / 34));

      dots = [];
      for (let y = b.minY; y <= b.maxY; y += pitch) {
        for (let x = b.minX; x <= b.maxX; x += pitch) {
          if (b.data[(y * pw + x) * 4 + 3] <= 128) continue;
          const ox = x + offX;
          const oy = y + offY;
          const roll = Math.random();
          dots.push({
            ox, oy,
            x: reduced || !intro ? ox : Math.random() * cw,
            y: reduced || !intro ? oy : Math.random() * height,
            vx: 0, vy: 0,
            r: Math.max(1, pitch * 0.38),
            tone: roll > 0.94 ? 2 : roll > 0.55 ? 1 : 0,
          });
        }
      }
      w = cw;
      paint();
      if (intro && !reduced) wake();
    };

    build();
    const fam = getComputedStyle(host).fontFamily || 'sans-serif';
    Promise.all([document.fonts?.load(`400 80px ${fam}`, text), document.fonts?.ready])
      .then(() => { if (alive) build(); })
      .catch(() => undefined);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) wake();
      else { awake = false; cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(host);

    const rect = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (r.width <= 0) return;
      mouse.x = ((e.clientX - r.left) / r.width) * w;
      mouse.y = ((e.clientY - r.top) / r.height) * height;
      wake();
    };
    const leave = () => { mouse.x = mouse.y = -9999; wake(); };
    const down = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      explode(((e.clientX - r.left) / r.width) * w, ((e.clientY - r.top) / r.height) * height);
    };
    const burst = () => explode();

    host.addEventListener('pointermove', rect);
    host.addEventListener('pointerenter', rect);
    host.addEventListener('pointerleave', leave);
    host.addEventListener('pointerdown', down);
    window.addEventListener('particles-burst', burst);

    const ro = new ResizeObserver(() => build());
    ro.observe(host);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener('pointermove', rect);
      host.removeEventListener('pointerenter', rect);
      host.removeEventListener('pointerleave', leave);
      host.removeEventListener('pointerdown', down);
      window.removeEventListener('particles-burst', burst);
    };
  }, [text, height, reach, align, intro, reduced, themeTick]);

  return (
    <div ref={wrap} className={className} style={{ position: 'relative', cursor: 'crosshair', touchAction: 'pan-y' }}>
      <span className="sr-only">{text}</span>
      <canvas ref={cv} aria-hidden style={{ display: 'block' }} />
    </div>
  );
};

export default ParticleText;
