import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import ParticleText from './ParticleText';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { profile } from '@/data/content';

const lastSegment = (url: string) => url.replace(/\/+$/, '').split('/').pop() ?? url;

const rows = [
  { name: 'GitHub', handle: lastSegment(profile.github), href: profile.github },
  { name: 'LinkedIn', handle: lastSegment(profile.linkedin), href: profile.linkedin },
  { name: 'X', handle: `@${lastSegment(profile.x)}`, href: profile.x },
  { name: profile.lab.name, handle: lastSegment(profile.lab.url), href: profile.lab.url },
];

type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const validate = ({ name, email, message }: Fields): Errors => {
  const e: Errors = {};
  if (!name.trim()) e.name = 'Tell me what to call you.';
  if (!email.trim()) e.email = 'I need an address to reply to.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = 'That does not look like an email address.';
  if (message.trim().length < 10) e.message = 'A sentence or two, at least 10 characters.';
  return e;
};

const useWide = () => {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setWide(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return wide;
};

const Contact = () => {
  const wide = useWide();
  const [copied, setCopied] = useState(false);
  const [fields, setFields] = useState<Fields>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const emailRef = useRef<HTMLSpanElement>(null);
  const copyTimer = useRef(0);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      toast.success('Email copied', { description: profile.email });
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: select the text so Ctrl/Cmd+C finishes the job.
      const el = emailRef.current;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      toast('Selected for you', { description: 'Press Ctrl/Cmd + C to copy the address.' });
    }
  };

  const onChange = (key: keyof Fields) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = (Object.keys(found) as (keyof Fields)[])[0];
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    const name = fields.name.trim();
    const from = fields.email.trim();
    const subject = `Hello from ${name}`;
    const body = `${fields.message.trim()}\n\n${name}\n${from}`;
    toast('Opening your mail app…', { description: 'Nothing is sent until you press send there.' });
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setFields({ name: '', email: '', message: '' });
    setErrors({});
  };

  const fieldClass = (key: keyof Fields) =>
    `bg-background/60 ${errors[key] ? 'border-destructive focus-visible:ring-destructive' : ''}`;

  const label = 'mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground';
  const err = 'mt-1.5 text-sm text-destructive';

  return (
    <section id="contact" className="relative scroll-mt-16 py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHeading index="05" kicker="Contact">
          Say <em>hello</em>
        </SectionHeading>

        <h3 className="-mx-1 mb-14 md:mb-20">
          <ParticleText
            text="HELLO"
            height={wide ? 220 : 120}
            className="font-display font-normal text-ink"
            align="left"
          />
        </h3>

        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="mb-8 max-w-xl text-lg text-muted-foreground">
                I like working on AI and systems problems that need someone to read the paper, write the kernel and ship
                the thing. If you are building something along those lines, or just want to compare notes, write to me.
              </p>

              <button
                type="button"
                onClick={copyEmail}
                className="group block w-full rounded-md py-2 text-left"
                aria-label={`Copy email address ${profile.email}`}
              >
                <span
                  ref={emailRef}
                  className="block break-all font-display text-[1.6rem] font-semibold leading-[1.05] tracking-tight transition-colors group-hover:text-primary sm:text-4xl lg:text-[2.7rem]"
                >
                  {profile.email}
                </span>
                <span className="mt-3 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  <span aria-live="polite">{copied ? 'Copied to clipboard' : 'Click to copy'}</span>
                </span>
              </button>

              <a
                href={`mailto:${profile.email}`}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Write mail <ArrowUpRight className="h-4 w-4" />
              </a>
            </Reveal>

            <Reveal delay={100} as="ul" className="mt-12 border-t border-border">
              {rows.map((r) => (
                <li key={r.name}>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-between gap-4 border-b border-border py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{r.name}</span>
                    <span className="flex min-w-0 items-center gap-3 font-mono text-xs text-muted-foreground md:text-sm">
                      <span className="truncate">{r.handle}</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </span>
                    <span
                      aria-hidden
                      className="absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </Reveal>
          </div>

          <Reveal delay={150} className="lg:col-span-5">
            <form
              onSubmit={onSubmit}
              noValidate
              className="rounded-xl border border-border bg-card p-6 md:p-8"
              aria-label="Contact form"
            >
              <p className="kicker mb-6">Or write from here</p>

              <div className="mb-5">
                <label htmlFor="contact-name" className={label}>
                  Name
                </label>
                <Input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  value={fields.name}
                  onChange={onChange('name')}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'contact-name-err' : undefined}
                  className={fieldClass('name')}
                />
                {errors.name && (
                  <p id="contact-name-err" role="alert" className={err}>
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="mb-5">
                <label htmlFor="contact-email" className={label}>
                  Email
                </label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={fields.email}
                  onChange={onChange('email')}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'contact-email-err' : undefined}
                  className={fieldClass('email')}
                />
                {errors.email && (
                  <p id="contact-email-err" role="alert" className={err}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="contact-message" className={label}>
                  Message
                </label>
                <Textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  value={fields.message}
                  onChange={onChange('message')}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'contact-message-err' : undefined}
                  className={`resize-y ${fieldClass('message')}`}
                />
                {errors.message && (
                  <p id="contact-message-err" role="alert" className={err}>
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                Compose in my mail app <ArrowUpRight className="h-4 w-4" />
              </button>
              <p className="mt-3 font-mono text-[0.7rem] text-muted-foreground">
                This opens your mail client with a draft. Nothing is sent from this page.
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;
