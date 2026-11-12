import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { useTheme } from 'next-themes';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { profile, sections } from '@/data/content';
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion';

const isMacLike = () =>
  typeof navigator !== 'undefined' && /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);

/** 3x3 dot grid; two dots carry the accent. */
const Monogram = () => (
  <span aria-hidden className="grid h-5 w-5 grid-cols-3 gap-[2px]">
    {Array.from({ length: 9 }, (_, i) => (
      <span
        key={i}
        className={`rounded-full transition-transform duration-300 group-hover:scale-125 ${
          i === 0 || i === 4 || i === 8 ? 'bg-primary' : 'bg-foreground'
        }`}
        style={{ transitionDelay: `${i * 18}ms` }}
      />
    ))}
  </span>
);

const Nav = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const reduced = usePrefersReducedMotion();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(sections[0].id);
  const [mac, setMac] = useState(true);

  useEffect(() => setMac(isMacLike()), []);

  // Hide on scroll down, return on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const dy = y - last;
      if (y < 80) setHidden(false);
      else if (dy > 6) setHidden(true);
      else if (dy < -6) setHidden(false);
      if (Math.abs(dy) > 6 || y < 80) last = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Active section.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) setActive(en.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // Mobile menu: lock scroll, close on Escape or when widening to desktop.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const mq = window.matchMedia('(min-width: 768px)');
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open]);

  const go = useCallback(
    (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      setOpen(false);
      const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';
      const el = document.getElementById(id);
      // let the overlay release the scroll lock before scrolling
      window.setTimeout(
        () => (el && id !== 'top' ? el.scrollIntoView({ behavior }) : window.scrollTo({ top: 0, behavior })),
        open ? 60 : 0,
      );
    },
    [reduced, open],
  );

  const openCommand = () => window.dispatchEvent(new CustomEvent('open-command'));
  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  const iconBtn =
    'inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-border bg-background/75 backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
          hidden && !open ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-5 md:px-10"
        >
          <a
            href="#top"
            onClick={go('top')}
            className="group flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${profile.name}, back to top`}
          >
            <Monogram />
            <span className="font-display text-[0.95rem] font-semibold tracking-tight">
              <span className="sm:hidden">TG</span>
              <span className="hidden sm:inline">{profile.name}</span>
            </span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {sections.map((s) => {
              const on = active === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={go(s.id)}
                    aria-current={on ? 'true' : undefined}
                    className={`group/link relative flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`h-1.5 w-1.5 rounded-full bg-primary transition-all duration-300 ${
                        on ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                      }`}
                    />
                    {s.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={openCommand}
              className="hidden h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
              aria-label="Search and commands"
            >
              <Search className="h-3.5 w-3.5" aria-hidden />
              <span>Search</span>
              <kbd className="font-mono text-[0.68rem] tracking-wider text-muted-foreground">
                {mac ? '⌘K' : 'Ctrl K'}
              </kbd>
            </button>
            <button type="button" onClick={openCommand} className={`${iconBtn} md:hidden`} aria-label="Search and commands">
              <Search className="h-[1.1rem] w-[1.1rem]" />
            </button>

            <button type="button" onClick={toggleTheme} className={`${iconBtn} relative`} aria-label="Toggle theme">
              <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
            </button>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className={`${iconBtn} md:hidden`}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        <div aria-hidden className="absolute inset-x-0 bottom-[-1px] h-[2px] overflow-hidden">
          <div
            className="h-full w-full origin-left bg-primary"
            style={{ transform: 'scaleX(var(--p, 0))', willChange: 'transform' }}
          />
        </div>
      </header>

      {/* Sibling of the header: backdrop-filter would otherwise trap a fixed child. */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-0 z-40 overflow-y-auto bg-background pt-14 md:hidden"
      >
        {open && (
          <ul className="flex min-h-full flex-col justify-center gap-1 px-5 pb-10">
            {sections.map((s, i) => (
              <li key={s.id} className="rise border-b border-border" style={{ ['--rd' as string]: `${i * 60}ms` }}>
                <a
                  href={`#${s.id}`}
                  onClick={go(s.id)}
                  className="flex items-baseline justify-between py-4 font-display text-5xl font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className={active === s.id ? 'text-primary' : ''}>{s.label}</span>
                  <span className="kicker">{String(i + 1).padStart(2, '0')}</span>
                </a>
              </li>
            ))}
            <li className="rise pt-6" style={{ ['--rd' as string]: `${sections.length * 60}ms` }}>
              <a
                href={`mailto:${profile.email}`}
                className="font-mono text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {profile.email}
              </a>
            </li>
          </ul>
        )}
      </div>
    </>
  );
};

export default Nav;
