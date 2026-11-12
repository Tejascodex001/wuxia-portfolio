import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { sections } from '@/data/content';
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion';

/** Sect insignia: crimson ring, gold inner ring, bamboo sword with gold guard. */
const Insignia = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
    <circle cx="32" cy="32" r="30" fill="hsl(var(--ink-black))" stroke="hsl(var(--crimson-red))" strokeWidth="3" />
    <circle cx="32" cy="32" r="25" fill="none" stroke="hsl(var(--ancient-gold))" strokeWidth="1.5" />
    <rect x="29.5" y="13" width="5" height="34" rx="2.5" fill="hsl(var(--crimson-red))" />
    <rect x="19" y="24" width="26" height="4" rx="2" fill="hsl(var(--ancient-gold))" />
    <circle cx="32" cy="19" r="2" fill="hsl(var(--ancient-gold))" />
    <circle cx="32" cy="33" r="2" fill="hsl(var(--ancient-gold))" />
    <circle cx="32" cy="43" r="2" fill="hsl(var(--ancient-gold))" />
  </svg>
);

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
      className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-[hsl(var(--crimson-red)/0.1)] hover:text-wuxia-crimson"
    >
      <Sun
        aria-hidden
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ease-out ${
          dark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
        }`}
      />
      <Moon
        aria-hidden
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ease-out ${
          dark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'
        }`}
      />
    </button>
  );
};

const Nav = () => {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState<string>(sections[0].id);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  const listRef = useRef<HTMLUListElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const openRef = useRef(open);
  openRef.current = open;

  const goTo = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      const el = document.getElementById(id);
      setOpen(false);
      if (!el) return;
      window.scrollTo({
        top: id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY,
        behavior: reduced ? 'auto' : 'smooth',
      });
      try {
        history.replaceState(null, '', id === 'top' ? window.location.pathname : `#${id}`);
      } catch {
        /* ignore */
      }
    },
    [reduced],
  );

  /* Active section via IntersectionObserver */
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* Sliding pill position */
  const measure = useCallback(() => {
    const list = listRef.current;
    const link = linkRefs.current[active];
    if (!list || !link || list.offsetParent === null) {
      setPill(null);
      return;
    }
    setPill({ x: link.offsetLeft, w: link.offsetWidth });
  }, [active]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure).catch(() => undefined);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  /* Hide on scroll down, show on scroll up (rAF throttled) */
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const dy = y - lastY;
      if (openRef.current || y < 120) setHidden(false);
      else if (dy > 6) setHidden(true);
      else if (dy < -6) setHidden(false);
      if (Math.abs(dy) > 6 || y < 120) lastY = y;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close mobile menu: Escape, outside press, or growing to desktop */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const mq = window.matchMedia('(min-width: 768px)');
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    mq.addEventListener('change', onMq);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
      mq.removeEventListener('change', onMq);
    };
  }, [open]);

  const openCommand = () => window.dispatchEvent(new CustomEvent('open-command'));

  return (
    <>
      {/* Scroll progress */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px]">
        <div
          className="h-full w-full origin-left bg-gradient-to-r from-[hsl(var(--crimson-red))] via-[hsl(var(--crimson-red))] to-[hsl(var(--ancient-gold))]"
          style={{ transform: 'scaleX(var(--p, 0))' }}
        />
      </div>

      <header
        className={`fixed inset-x-0 top-3 z-50 flex justify-center px-3 transition-transform duration-500 [transition-timing-function:cubic-bezier(.2,.7,.2,1)] md:top-4 ${
          hidden && !open ? '-translate-y-[160%]' : 'translate-y-0'
        }`}
      >
        <div ref={wrapRef} className="relative w-full max-w-md md:w-auto md:max-w-none">
          <nav
            aria-label="Primary"
            className="glass flex items-center gap-1 rounded-full py-1.5 pl-2 pr-1.5 shadow-[0_8px_30px_-12px_hsl(var(--shadow-gray)/0.45)] md:gap-2 md:pl-2.5 md:pr-2"
          >
            <a
              href="#top"
              onClick={goTo('top')}
              aria-label="Back to the top"
              className="group grid h-9 w-9 shrink-0 place-items-center rounded-full"
            >
              <Insignia className="h-8 w-8 transition-transform duration-500 group-hover:rotate-[24deg] group-hover:scale-110" />
            </a>

            {/* Desktop links */}
            <ul ref={listRef} className="relative ml-1 hidden items-center md:flex">
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 rounded-full bg-[hsl(var(--crimson-red)/0.1)] ring-1 ring-inset ring-[hsl(var(--ancient-gold)/0.5)] transition-[transform,width,opacity] duration-500 [transition-timing-function:cubic-bezier(.2,.8,.2,1)]"
                style={{
                  width: pill?.w ?? 0,
                  transform: `translateX(${pill?.x ?? 0}px)`,
                  opacity: pill ? 1 : 0,
                }}
              >
                <span className="absolute inset-x-4 bottom-1 h-px bg-gradient-to-r from-transparent via-[hsl(var(--ancient-gold))] to-transparent" />
              </span>
              {sections.map((s) => {
                const isActive = active === s.id;
                return (
                  <li key={s.id} className="relative">
                    <a
                      ref={(el) => {
                        linkRefs.current[s.id] = el;
                      }}
                      href={`#${s.id}`}
                      onClick={goTo(s.id)}
                      aria-current={isActive ? 'location' : undefined}
                      className={`block rounded-full px-3.5 py-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] transition-colors ${
                        isActive ? 'text-wuxia-crimson' : 'text-foreground/70 hover:text-foreground'
                      }`}
                    >
                      {s.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            <span className="flex-1 md:hidden" />

            <button
              type="button"
              onClick={openCommand}
              aria-label="Open command menu"
              aria-keyshortcuts="Control+K Meta+K"
              className="flex h-9 shrink-0 items-center gap-2 rounded-full px-2.5 text-foreground/80 transition-colors hover:bg-[hsl(var(--crimson-red)/0.1)] hover:text-wuxia-crimson md:ml-1 md:border md:border-border md:px-3"
            >
              <Search aria-hidden className="h-4 w-4" />
              <kbd className="hidden font-mono text-[0.68rem] tracking-wider md:inline">⌘K</kbd>
            </button>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-[hsl(var(--crimson-red)/0.1)] hover:text-wuxia-crimson md:hidden"
            >
              <Menu
                aria-hidden
                className={`absolute h-5 w-5 transition-all duration-300 ${open ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'}`}
              />
              <X
                aria-hidden
                className={`absolute h-5 w-5 transition-all duration-300 ${open ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'}`}
              />
            </button>
          </nav>

          {/* Mobile sheet */}
          <div
            id="mobile-menu"
            hidden={!open}
            className="glass absolute inset-x-0 top-full mt-2 overflow-hidden rounded-3xl p-2 shadow-[0_20px_50px_-20px_hsl(var(--shadow-gray)/0.6)] md:hidden"
          >
            <ul className="flex flex-col">
              {sections.map((s, i) => {
                const isActive = active === s.id;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={goTo(s.id)}
                      aria-current={isActive ? 'location' : undefined}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
                        isActive ? 'bg-[hsl(var(--crimson-red)/0.1)] text-wuxia-crimson' : 'text-foreground hover:bg-foreground/5'
                      }`}
                    >
                      <span className="w-6 font-mono text-[0.7rem] text-gold">{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-display text-2xl leading-none">{s.label}</span>
                      {isActive && (
                        <span aria-hidden className="ml-auto h-1.5 w-1.5 rounded-full bg-[hsl(var(--ancient-gold))]" />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </header>
    </>
  );
};

export default Nav;
