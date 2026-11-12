import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { Copy, ExternalLink, Github, Linkedin, Moon, Sparkles, Sun, Twitter } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { profile, sections } from '@/data/content';
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion';

const GLYPHS: Record<string, string> = {
  top: '门',
  about: '道',
  skills: '武',
  projects: '卷',
  journey: '路',
  contact: '盟',
};

const links = [
  { label: 'GitHub', href: profile.github, icon: <Github aria-hidden /> },
  { label: 'LinkedIn', href: profile.linkedin, icon: <Linkedin aria-hidden /> },
  { label: 'X (Twitter)', href: profile.x, icon: <Twitter aria-hidden /> },
  { label: 'RTensorLabs', href: profile.lab.url, icon: <Glyph>器</Glyph> },
  { label: 'FLAME site', href: 'https://learn-rust-flame-site.vercel.app/', icon: <Glyph>焰</Glyph> },
  { label: 'Sanctum site', href: 'https://sanctum-rtensorlabs.vercel.app/', icon: <Glyph>盾</Glyph> },
];

function Glyph({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="font-display grid !h-6 !w-6 shrink-0 place-items-center rounded-md border border-[hsl(var(--ancient-gold)/0.6)] text-base leading-none text-wuxia-crimson"
    >
      {children}
    </span>
  );
}

const itemClass =
  'gap-3 rounded-lg data-[selected=true]:bg-[hsl(var(--crimson-red)/0.1)] data-[selected=true]:text-foreground [&_svg]:text-wuxia-crimson';

const isTypingTarget = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
};

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
};

const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const reduced = usePrefersReducedMotion();
  const dark = resolvedTheme === 'dark';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !isTypingTarget(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-command', onOpen);
    };
  }, []);

  const run = useCallback((fn: () => void) => {
    setOpen(false);
    // let the dialog close (and release scroll lock) before acting
    window.setTimeout(fn, 120);
  }, []);

  const goTo = (id: string) =>
    run(() => {
      const el = document.getElementById(id);
      if (!el) return;
      window.scrollTo({
        top: id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY,
        behavior: reduced ? 'auto' : 'smooth',
      });
    });

  const openLink = (href: string) => run(() => window.open(href, '_blank', 'noopener,noreferrer'));

  const copyEmail = () =>
    run(async () => {
      const ok = await copyText(profile.email);
      if (ok) toast.success('Email copied', { description: profile.email });
      else toast.error('Could not copy', { description: profile.email });
    });

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Command menu</DialogTitle>
      <DialogDescription className="sr-only">
        Search sections, links and actions. Use arrow keys to move and Enter to choose.
      </DialogDescription>
      <CommandInput placeholder="Where to, wanderer?" />
      <CommandList className="max-h-[min(60vh,360px)]">
        <CommandEmpty>
          <span className="font-display text-2xl text-muted-foreground">空</span>
          <span className="mt-1 block text-sm text-muted-foreground">Nothing found on this path.</span>
        </CommandEmpty>

        <CommandGroup heading="Navigate">
          {sections.map((s) => (
            <CommandItem
              key={s.id}
              value={`go ${s.label} ${s.id}`}
              onSelect={() => goTo(s.id)}
              className={itemClass}
            >
              <Glyph>{GLYPHS[s.id] ?? '道'}</Glyph>
              <span>{s.label}</span>
              <CommandShortcut className="font-mono">#{s.id}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Links">
          {links.map((l) => (
            <CommandItem
              key={l.label}
              value={`link ${l.label}`}
              onSelect={() => openLink(l.href)}
              className={itemClass}
            >
              {l.icon}
              <span>{l.label}</span>
              <ExternalLink aria-hidden className="!ml-auto !h-3.5 !w-3.5 opacity-50" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem value="copy email address" onSelect={copyEmail} className={itemClass}>
            <Copy aria-hidden />
            <span>Copy email</span>
            <CommandShortcut className="hidden truncate font-mono sm:inline">{profile.email}</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="toggle theme dark light"
            onSelect={() => run(() => setTheme(dark ? 'light' : 'dark'))}
            className={itemClass}
          >
            {dark ? <Sun aria-hidden /> : <Moon aria-hidden />}
            <span>Toggle theme</span>
            <CommandShortcut>{dark ? 'to day' : 'to night'}</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="summon petals ink burst"
            onSelect={() => run(() => window.dispatchEvent(new CustomEvent('ink-burst', { detail: { count: 120 } })))}
            className={itemClass}
          >
            <Sparkles aria-hidden />
            <span>Summon petals</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>

      <div className="flex items-center justify-between border-t border-border px-4 py-2 font-mono text-[0.68rem] uppercase tracking-widest text-muted-foreground">
        <span className="font-display text-base normal-case tracking-normal text-wuxia-crimson">剑</span>
        <span>
          <kbd>↑↓</kbd> move · <kbd>↵</kbd> choose · <kbd>esc</kbd> close
        </span>
      </div>
    </CommandDialog>
  );
};

export default CommandMenu;
