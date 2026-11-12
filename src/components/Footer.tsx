import { ArrowUpRight } from 'lucide-react';
import Mountains from './Mountains';
import { profile } from '@/data/content';

const links = [
  { label: 'GitHub', href: profile.github },
  { label: 'LinkedIn', href: profile.linkedin },
  { label: 'X', href: profile.x },
  { label: profile.lab.name, href: profile.lab.url },
  { label: 'Email', href: `mailto:${profile.email}` },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden">
      {/* Mountain silhouette; its nearest layer shares the footer's ink colour so they fuse. */}
      <Mountains className="h-44 sm:h-60 md:h-80" />

      <div
        className="relative -mt-px px-4 pb-10 pt-6 sm:px-6"
        style={{ background: 'hsl(var(--mount-3))', color: 'hsl(var(--rice-paper))' }}
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <div
            className="seal mb-6 flex h-14 w-14 items-center justify-center rounded-[5px] text-3xl leading-none md:h-16 md:w-16 md:text-4xl"
            aria-hidden
          >
            侠
          </div>

          <p className="font-display text-5xl leading-[1.05] md:text-8xl">
            Walk well, <span style={{ color: 'hsl(var(--ancient-gold))' }}>wanderer</span>.
          </p>
          <p className="mt-4 max-w-md text-sm opacity-70 md:text-base">
            The road is long, the compiler is patient. Until we cross paths again.
          </p>

          <nav aria-label="Social links" className="mt-10">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-9">
              {links.map((l) => {
                const external = l.href.startsWith('http');
                return (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="group inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:text-[hsl(var(--ancient-gold))] md:text-sm"
                    >
                      {l.label}
                      <ArrowUpRight
                        className="h-3.5 w-3.5 opacity-60 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            className="mt-12 h-px w-full max-w-md"
            style={{
              background:
                'linear-gradient(90deg, transparent, hsl(var(--ancient-gold) / 0.5), transparent)',
            }}
            aria-hidden
          />

          <p className="mt-6 text-xs opacity-70 md:text-sm">
            © {year} {profile.name} · Forged in the digital Jianghu
          </p>
          <p className="mt-3 font-mono text-[0.68rem] tracking-wide opacity-50 md:text-xs">
            Press ⌘K · or try ↑ ↑ ↓ ↓ ← → ← → B A
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
