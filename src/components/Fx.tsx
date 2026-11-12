import { useEffect } from 'react';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/use-reduced-motion';

const SCRAMBLE = '░▒▓█<>/\\{}[]=+*01';

/**
 * Global, DOM-level flourishes (no per-component wiring needed):
 *  - magnetic pull on buttons and links
 *  - text-scramble decode on every `.kicker` when it scrolls into view
 */
const Fx = () => {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();

  // Magnetic buttons + links
  useEffect(() => {
    if (!fine || reduced) return;
    let el: HTMLElement | null = null;
    let raf = 0;

    const release = () => {
      if (el) el.style.translate = '';
      el = null;
    };
    const onMove = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest('a[href],button') as HTMLElement | null;
      if (target !== el) release();
      if (!target) return;
      const r = target.getBoundingClientRect();
      if (r.width > 380 || r.height > 130) return; // cards and blocks stay put
      if (!el) {
        el = target;
        target.style.transition = 'translate .25s cubic-bezier(.2,.8,.2,1)';
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        target.style.translate = `${dx * 0.28}px ${dy * 0.38}px`;
      });
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
      release();
    };
  }, [fine, reduced]);

  // Scramble-decode kickers
  useEffect(() => {
    if (reduced || typeof IntersectionObserver === 'undefined') return;
    const timers = new Set<number>();
    const seen = new WeakSet<Element>();

    const decode = (node: HTMLElement) => {
      const final = node.textContent ?? '';
      if (!final.trim()) return;
      const start = performance.now();
      const dur = 650 + final.length * 22;
      const step = () => {
        const p = Math.min(1, (performance.now() - start) / dur);
        const lock = Math.floor(p * final.length);
        let out = '';
        for (let i = 0; i < final.length; i++) {
          const ch = final[i];
          out += i < lock || ch === ' ' ? ch : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
        }
        node.textContent = out;
        if (p < 1) timers.add(requestAnimationFrame(step));
        else node.textContent = final;
      };
      step();
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting && !seen.has(en.target)) {
            seen.add(en.target);
            decode(en.target as HTMLElement);
            io.unobserve(en.target);
          }
        }
      },
      { threshold: 0.6 },
    );

    const scan = () => document.querySelectorAll('.kicker').forEach((k) => !seen.has(k) && io.observe(k));
    const t = window.setTimeout(scan, 600);
    return () => {
      clearTimeout(t);
      io.disconnect();
      timers.forEach((id) => cancelAnimationFrame(id));
    };
  }, [reduced]);

  return null;
};

export default Fx;
