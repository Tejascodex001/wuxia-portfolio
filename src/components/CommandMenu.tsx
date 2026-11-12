import { useCallback, useEffect, useState, type ComponentType } from 'react';
import { useTheme } from 'next-themes';
import {
  ArrowUpRight,
  Briefcase,
  Copy,
  Flame,
  Github,
  House,
  Layers,
  Linkedin,
  Lock,
  Mail,
  SquareArrowOutUpRight,
  SunMoon,
  Sparkles,
  Twitter,
  User,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { featured, otherWork, profile, sections } from '@/data/content';

type Icon = ComponentType<{ className?: string }>;

const sectionIcons: Record<string, Icon> = {
  top: House,
  work: Briefcase,
  stack: Layers,
  about: User,
  contact: Mail,
};

const projectIcons: Record<string, Icon> = { flame: Flame, sanctum: Lock };

const links: { label: string; href: string; icon: Icon }[] = [
  { label: 'GitHub', href: profile.github, icon: Github },
  { label: 'LinkedIn', href: profile.linkedin, icon: Linkedin },
  { label: 'X', href: profile.x, icon: Twitter },
  { label: profile.lab.name, href: profile.lab.url, icon: ArrowUpRight },
  { label: profile.employer.name, href: profile.employer.url, icon: ArrowUpRight },
];

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
};

const openExternal = (href: string) => window.open(href, '_blank', 'noopener,noreferrer');

const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping(e.target)) {
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

  // Close first, then act, so focus restoration and scroll lock never fight the action.
  const run = useCallback((fn: () => void) => {
    setOpen(false);
    window.setTimeout(fn, 80);
  }, []);

  const goTo = (id: string) =>
    run(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';
      const el = document.getElementById(id);
      if (el && id !== 'top') el.scrollIntoView({ behavior });
      else window.scrollTo({ top: 0, behavior });
    });

  const copyEmail = () =>
    run(() => {
      navigator.clipboard
        .writeText(profile.email)
        .then(() => toast.success('Email copied', { description: profile.email }))
        .catch(() => toast.error('Could not copy', { description: profile.email }));
    });

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Command menu</DialogTitle>
      <DialogDescription className="sr-only">
        Search for a section, project, link or action, then press Enter.
      </DialogDescription>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>Nothing matches that.</CommandEmpty>

        <CommandGroup heading="Go to">
          {sections.map((s) => {
            const I = sectionIcons[s.id] ?? ArrowUpRight;
            return (
              <CommandItem key={s.id} value={`go ${s.label}`} onSelect={() => goTo(s.id)}>
                <I className="mr-2" />
                {s.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Projects">
          {featured.map((f) => {
            const I = projectIcons[f.id] ?? SquareArrowOutUpRight;
            return (
              <CommandItem
                key={f.id}
                value={`project ${f.name} ${f.kicker}`}
                onSelect={() => run(() => openExternal(f.links[0].href))}
              >
                <I className="mr-2" />
                <span className="font-medium">{f.name}</span>
                <span className="ml-2 truncate text-xs text-muted-foreground">{f.kicker}</span>
              </CommandItem>
            );
          })}
          {otherWork.map((w) => (
            <CommandItem
              key={w.name}
              value={`project ${w.name} ${w.tags.join(' ')}`}
              onSelect={() => run(() => openExternal(w.href))}
            >
              <SquareArrowOutUpRight className="mr-2" />
              <span>{w.name}</span>
              <span className="ml-2 truncate font-mono text-[0.7rem] text-muted-foreground">{w.tags.join(' · ')}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Links">
          {links.map((l) => (
            <CommandItem key={l.label} value={`link ${l.label}`} onSelect={() => run(() => openExternal(l.href))}>
              <l.icon className="mr-2" />
              {l.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem value="action copy email" onSelect={copyEmail}>
            <Copy className="mr-2" />
            Copy email
          </CommandItem>
          <CommandItem
            value="action toggle theme dark light"
            onSelect={() => run(() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'))}
          >
            <SunMoon className="mr-2" />
            Toggle theme
          </CommandItem>
          <CommandItem
            value="action scatter the particles"
            onSelect={() => run(() => window.dispatchEvent(new Event('particles-burst')))}
          >
            <Sparkles className="mr-2" />
            Scatter the particles
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandMenu;
