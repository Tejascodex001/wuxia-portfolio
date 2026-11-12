import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/use-reduced-motion';

type Props = {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees. */
  max?: number;
  /** Hue (0-360) fed to the `.spot` overlay via --spot-h. */
  hue?: number;
};

/**
 * 3D pointer tilt. Pure DOM writes in rAF (no React state).
 * Also exposes --mx / --my (px) so a `.spot` child can follow the cursor.
 * Inactive on coarse pointers and with reduced motion.
 */
const Tilt = ({ children, className = '', max = 8, hue = 0 }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  const enabled = fine && !reduced;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let raf = 0;
    let cx = 0;
    let cy = 0;

    const frame = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const x = Math.min(Math.max(cx - r.left, 0), r.width);
      const y = Math.min(Math.max(cy - r.top, 0), r.height);
      const rx = (0.5 - y / r.height) * max * 2;
      const ry = (x / r.width - 0.5) * max * 2;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
      el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      cx = e.clientX;
      cy = e.clientY;
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      el.style.transform = '';
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
    };
  }, [enabled, max]);

  return (
    <div
      ref={ref}
      className={`group tilt ${className}`}
      style={{ ['--spot-h' as string]: hue } as CSSProperties}
    >
      {children}
    </div>
  );
};

export default Tilt;
