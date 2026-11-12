import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, Check, Copy, Github, Linkedin, Mail, Send, Twitter } from 'lucide-react';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { profile } from '@/data/content';

type Social = { label: string; handle: string; href: string; icon: ReactNode };

const socials: Social[] = [
  { label: 'GitHub', handle: 'Tejascodex001', href: profile.github, icon: <Github aria-hidden className="h-7 w-7" /> },
  { label: 'LinkedIn', handle: 'tejas-gowda-sridhara', href: profile.linkedin, icon: <Linkedin aria-hidden className="h-7 w-7" /> },
  { label: 'X', handle: '@tejas_gowda_001', href: profile.x, icon: <Twitter aria-hidden className="h-7 w-7" /> },
  {
    label: profile.lab.name,
    handle: 'The lab',
    href: profile.lab.url,
    icon: (
      <span aria-hidden className="font-display text-[2rem] leading-7">
        器
      </span>
    ),
  },
];

type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validate = (f: Fields): Errors => {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Tell me what to call you.';
  if (!f.email.trim()) e.email = 'Your email lets me reply.';
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'That does not look like an email address.';
  if (f.message.trim().length < 10) e.message = 'A few more words, please (10 characters or more).';
  return e;
};

const fieldClass =
  'border-border bg-background/70 text-base placeholder:text-muted-foreground/70 focus-visible:ring-wuxia-crimson aria-[invalid=true]:border-wuxia-crimson';

const Contact = () => {
  const [fields, setFields] = useState<Fields>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | undefined>();

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const copyEmail = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(profile.email);
      ok = true;
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = profile.email;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      toast.success('Email copied', { description: profile.email });
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2200);
    } else {
      toast.error('Could not copy automatically', { description: profile.email });
    }
  };

  const update = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    const firstBad = (['name', 'email', 'message'] as const).find((k) => found[k]);
    if (firstBad) {
      document.getElementById(`contact-${firstBad}`)?.focus();
      return;
    }

    const name = fields.name.trim();
    const email = fields.email.trim();
    const subject = `Hello from ${name}`;
    const body = `${fields.message.trim()}\n\n${name}\n${email}`;
    const href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    toast('Opening your mail app…', { description: 'Press send there to deliver your message.' });
    window.location.href = href;
    setFields({ name: '', email: '', message: '' });
    setErrors({});
  };

  const err = (k: keyof Fields) => (errors[k] ? `contact-${k}-error` : undefined);

  return (
    <section id="contact" className="relative overflow-hidden px-4 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <SectionHeading kicker="Join the sect" zh="盟">
          Send a <em>messenger pigeon</em>
        </SectionHeading>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left: email, quote, socials */}
          <div className="lg:col-span-7">
            <Reveal>
              <p className="kicker mb-3">Fastest route</p>
              <button
                type="button"
                onClick={copyEmail}
                aria-label={`Copy email address ${profile.email}`}
                className="group relative block w-full max-w-full break-all rounded-xl text-left font-display text-[clamp(1.5rem,6.6vw,3.6rem)] leading-[1.1] text-foreground transition-colors hover:text-wuxia-crimson"
              >
                <span className="bg-[linear-gradient(hsl(var(--crimson-red)),hsl(var(--crimson-red)))] bg-[length:0%_3px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 ease-out group-hover:bg-[length:100%_3px] group-focus-visible:bg-[length:100%_3px]">
                  {profile.email}
                </span>
                <span
                  aria-hidden
                  className="ml-3 inline-grid h-9 w-9 translate-y-[-0.15em] place-items-center rounded-full border border-[hsl(var(--ancient-gold)/0.7)] align-middle text-gold transition-colors group-hover:border-wuxia-crimson group-hover:text-wuxia-crimson"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </span>
              </button>
              <span className="sr-only" role="status" aria-live="polite">
                {copied ? 'Email copied to clipboard' : ''}
              </span>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="rounded-full bg-wuxia-crimson px-6 text-primary-foreground hover:bg-[hsl(var(--crimson-red)/0.9)]">
                  <a href={`mailto:${profile.email}`}>
                    <Mail aria-hidden /> Write mail
                  </a>
                </Button>
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">or tap the address to copy</span>
              </div>
            </Reveal>

            <Reveal delay={120} className="mt-12">
              <figure className="relative border-l-2 border-[hsl(var(--ancient-gold)/0.7)] pl-5 md:pl-7">
                <blockquote className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  <span className="font-display text-2xl text-wuxia-crimson">門常開。</span> The gate stays open. If you are
                  building something odd, ambitious or just interesting, in AI, systems or somewhere between, I would like to
                  hear about it.
                </blockquote>
                <figcaption className="kicker mt-3">Open to collaboration</figcaption>
              </figure>
            </Reveal>

            <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
              {socials.map((s, i) => (
                <li key={s.label}>
                  <Reveal delay={i * 80} className="h-full">
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass group relative flex h-full min-h-[10.5rem] flex-col justify-between overflow-hidden rounded-2xl p-4 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[hsl(var(--crimson-red)/0.6)] hover:shadow-[0_18px_44px_-16px_hsl(var(--crimson-red)/0.6)] focus-visible:-translate-y-1.5 focus-visible:border-[hsl(var(--crimson-red)/0.6)] motion-reduce:transform-none"
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[hsl(var(--crimson-red)/0)] blur-2xl transition-colors duration-300 group-hover:bg-[hsl(var(--crimson-red)/0.25)]"
                      />
                      <span className="relative flex items-start justify-between text-gold transition-colors group-hover:text-wuxia-crimson">
                        {s.icon}
                        <ArrowUpRight
                          aria-hidden
                          className="h-5 w-5 opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
                        />
                      </span>
                      <span className="relative">
                        <span className="block font-display text-2xl leading-tight text-foreground">{s.label}</span>
                        <span className="mt-0.5 block truncate font-mono text-[0.68rem] tracking-wide text-muted-foreground">
                          {s.handle}
                        </span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </span>
                    </a>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: form */}
          <Reveal delay={150} className="lg:col-span-5">
            <form
              onSubmit={onSubmit}
              noValidate
              aria-labelledby="contact-form-title"
              className="glass relative rounded-3xl p-6 shadow-[0_30px_70px_-40px_hsl(var(--shadow-gray)/0.7)] md:p-8"
            >
              <span
                aria-hidden
                className="seal absolute -right-2 -top-4 grid h-12 w-12 place-items-center rounded-md text-2xl md:-right-3"
              >
                信
              </span>
              <h3 id="contact-form-title" className="font-display text-3xl text-foreground md:text-4xl">
                Leave a note
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">This opens your own mail app with the message ready to send.</p>

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="contact-name" className="kicker mb-2 block">
                    Your name
                  </label>
                  <Input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    maxLength={80}
                    value={fields.name}
                    onChange={update('name')}
                    aria-invalid={!!errors.name}
                    aria-describedby={err('name')}
                    placeholder="Lin Feng"
                    className={fieldClass}
                  />
                  {errors.name && (
                    <p id="contact-name-error" role="alert" className="mt-1.5 text-sm text-wuxia-crimson">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-email" className="kicker mb-2 block">
                    Your email
                  </label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={fields.email}
                    onChange={update('email')}
                    aria-invalid={!!errors.email}
                    aria-describedby={err('email')}
                    placeholder="you@example.com"
                    className={fieldClass}
                  />
                  {errors.email && (
                    <p id="contact-email-error" role="alert" className="mt-1.5 text-sm text-wuxia-crimson">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-message" className="kicker mb-2 block">
                    Message
                  </label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    maxLength={1500}
                    value={fields.message}
                    onChange={update('message')}
                    aria-invalid={!!errors.message}
                    aria-describedby={err('message')}
                    placeholder="What are we building?"
                    className={`${fieldClass} min-h-[130px] resize-y`}
                  />
                  {errors.message && (
                    <p id="contact-message-error" role="alert" className="mt-1.5 text-sm text-wuxia-crimson">
                      {errors.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-7 w-full rounded-full bg-wuxia-crimson text-primary-foreground hover:bg-[hsl(var(--crimson-red)/0.9)]"
              >
                <Send aria-hidden /> Release the pigeon
              </Button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;
