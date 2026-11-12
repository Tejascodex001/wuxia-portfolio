import { useEffect, useRef } from 'react';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/use-reduced-motion';

/** A lagging crimson ring that swells over anything clickable. Pointer-fine devices only. */
const Cursor = () => {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!fine || reduced) return;
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0, hot = false;

    const onMove = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const t = e.target as Element | null;
      hot = !!t?.closest('a,button,[role="button"],input,textarea,[data-hot]');
      if (dot.current) dot.current.style.opacity = '1';
      if (ring.current) ring.current.style.opacity = '1';
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      if (ring.current) {
        ring.current.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%) scale(${hot ? 1.9 : 1})`;
        ring.current.style.borderColor = hot ? 'hsl(var(--crimson-red))' : 'hsl(var(--foreground) / .45)';
        ring.current.style.background = hot ? 'hsl(var(--crimson-red) / .12)' : 'transparent';
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    tick();
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;
  return (
    <>
      <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[70] h-1.5 w-1.5 rounded-full bg-primary opacity-0" />
      <div ref={ring} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[70] h-9 w-9 rounded-full border opacity-0 transition-[border-color,background] duration-200" />
    </>
  );
};

export default Cursor;
