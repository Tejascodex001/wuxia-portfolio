import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { profile } from '@/data/content';
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion';

const Footer = () => {
  const reduced = usePrefersReducedMotion();
  const [mac, setMac] = useState(true);
  useEffect(() => {
    setMac(/mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent));
  }, []);

  const links = [
    { label: 'GitHub', href: profile.github },
    { label: 'LinkedIn', href: profile.linkedin },
    { label: 'X', href: profile.x },
    { label: 'Source', href: profile.repo },
  ];

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1400px] px-5 pb-12 pt-14 md:px-10 md:pb-16 md:pt-20">
        <div className="flex flex-col gap-8 md:grid md:grid-cols-3 md:items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {profile.name}
          </p>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 md:justify-center">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {l.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="md:text-right">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}
              className="group inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors hover:text-primary"
            >
              Back to top
              <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" aria-hidden />
            </button>
          </div>
        </div>

        <p className="mt-14 font-mono text-[0.7rem] tracking-wide text-muted-foreground md:mt-20">
          Press {mac ? '⌘K' : 'Ctrl K'} to jump anywhere · try the Konami code
        </p>
      </div>
    </footer>
  );
};

export default Footer;
