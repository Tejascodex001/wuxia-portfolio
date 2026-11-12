import { useEffect } from 'react';

/**
 * Writes scroll progress to CSS variables on <html> without re-rendering React:
 *   --p   page progress, 0..1
 *   --sy  scroll offset in px
 *   --sun-x / --sun-y  position of the sun/moon along its arc, in %
 *   --vel  smoothed scroll velocity (px/frame, clamped), drives the speed-skew effect
 */
export const useScrollVars = () => {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    let lastY = window.scrollY;
    let vel = 0;

    const update = () => {
      raf = 0;
      vel = vel * 0.82 + (window.scrollY - lastY) * 0.18;
      lastY = window.scrollY;
      const v = Math.max(-8, Math.min(8, vel));
      root.style.setProperty('--vel', Math.abs(v) < 0.02 ? '0' : v.toFixed(3));
      const max = Math.max(1, root.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      root.style.setProperty('--p', p.toFixed(4));
      root.style.setProperty('--sy', `${window.scrollY}px`);
      root.style.setProperty('--sun-x', `${8 + p * 84}%`);
      root.style.setProperty('--sun-y', `${34 - Math.sin(p * Math.PI) * 22}%`);
      // keep easing the skew back to zero after the user stops scrolling
      if (Math.abs(vel) > 0.02 && !raf) raf = requestAnimationFrame(update);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
};
