import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { usePrefersReducedMotion, useFinePointer } from '@/hooks/use-reduced-motion';

type P = {
  x: number; y: number; vx: number; vy: number;
  r: number; life: number; max: number; hue: number; kind: 'ink' | 'petal';
  rot: number; vr: number; sway: number;
};

/**
 * Full-viewport canvas: your cursor paints brush ink, clicks bloom,
 * and crimson petals drift down. Everything fades; nothing blocks input.
 */
const InkCanvas = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  const dark = resolvedTheme === 'dark';

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1, raf = 0;
    const parts: P[] = [];
    let last: { x: number; y: number } | null = null;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ink = (x: number, y: number, speed: number) => {
      parts.push({
        x, y,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.min(2 + speed * 0.12, 9) * (0.6 + Math.random() * 0.8),
        life: 0, max: 50 + Math.random() * 40,
        hue: Math.random() < 0.18 ? 40 : 0,
        kind: 'ink', rot: 0, vr: 0, sway: 0,
      });
    };

    const bloom = (x: number, y: number, count = 36) => {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const s = 1.5 + Math.random() * 5;
        parts.push({
          x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          r: 2 + Math.random() * 5, life: 0, max: 40 + Math.random() * 30,
          hue: Math.random() < 0.3 ? 40 : 0, kind: 'ink', rot: 0, vr: 0, sway: 0,
        });
      }
    };

    const petal = (burst = false) => {
      parts.push({
        x: burst ? Math.random() * w : Math.random() * w,
        y: burst ? -20 - Math.random() * h * 0.3 : -20,
        vx: 0.2 + Math.random() * 0.6, vy: 0.6 + Math.random() * 1.1,
        r: 4 + Math.random() * 5, life: 0, max: 99999,
        hue: Math.random() < 0.7 ? 0 : 40,
        kind: 'petal', rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.04,
        sway: Math.random() * 6,
      });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (last) {
        const dx = e.clientX - last.x, dy = e.clientY - last.y;
        const dist = Math.hypot(dx, dy);
        const steps = Math.min(Math.ceil(dist / 6), 14);
        for (let i = 0; i < steps; i++) ink(last.x + (dx * i) / steps, last.y + (dy * i) / steps, dist);
      }
      last = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => { last = null; };
    const onDown = (e: PointerEvent) => bloom(e.clientX, e.clientY, e.pointerType === 'touch' ? 24 : 36);
    const onBurst = (e: Event) => {
      const d = (e as CustomEvent<{ x?: number; y?: number; count?: number }>).detail || {};
      if (d.x === undefined) for (let i = 0; i < (d.count ?? 90); i++) petal(true);
      else bloom(d.x, d.y ?? 0, d.count ?? 60);
    };

    const crimson = dark ? '255,72,52' : '170,28,28';
    const gold = dark ? '230,190,110' : '150,100,30';
    const black = dark ? '255,235,210' : '20,14,10';

    const frame = () => {
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';

      if (Math.random() < 0.035 && parts.filter((p) => p.kind === 'petal').length < 18) petal();

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        if (p.kind === 'ink') {
          p.x += p.vx; p.y += p.vy; p.vx *= 0.96; p.vy *= 0.96;
          const t = p.life / p.max;
          if (t >= 1) { parts.splice(i, 1); continue; }
          const a = (1 - t) * (dark ? 0.55 : 0.7);
          const rad = p.r * (1 - t * 0.5);
          const c = p.hue === 40 ? gold : t < 0.35 ? black : crimson;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
          g.addColorStop(0, `rgba(${c},${a})`);
          g.addColorStop(1, `rgba(${c},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
          ctx.fill();
        } else {
          p.sway += 0.02;
          p.x += p.vx + Math.sin(p.sway) * 0.6;
          p.y += p.vy;
          p.rot += p.vr;
          if (p.y > h + 20 || p.x > w + 20) { parts.splice(i, 1); continue; }
          const c = p.hue === 40 ? gold : crimson;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(1, 0.55 + Math.abs(Math.sin(p.sway)) * 0.45);
          ctx.fillStyle = `rgba(${c},${dark ? 0.55 : 0.5})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      if (parts.length > 900) parts.splice(0, parts.length - 900);
    };

    resize();
    for (let i = 0; i < 8; i++) petal(true);
    frame();

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('ink-burst', onBurst);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('ink-burst', onBurst);
    };
  }, [dark, reduced, fine]);

  if (reduced) return null;
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[45]" />;
};

export default InkCanvas;
