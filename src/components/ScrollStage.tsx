import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { renderFrame } from '@/game/render';
import { sound } from '@/game/audio';
import { H, SCRIPT, TOTAL_EPS, W, toEps } from '@/game/script';
import { background, featured, otherWork, profile, toolbox } from '@/data/content';
import { toast } from '@/components/ui/sonner';

const M = SCRIPT.marks;
const SKILLS = ['Rust', 'C++', 'Python', 'Dart', 'PyTorch', 'Candle', 'CUDA', 'Flutter'];
const UNLOCK: Record<string, number> = {};
for (const u of SCRIPT.unlocks) UNLOCK[u.skill] = u.t;

const CHAPTERS: { label: string; at: number }[] = [
  { label: 'Gate', at: 0 },
  { label: 'Bugs', at: M.run1 + 0.4 },
  { label: 'Flame', at: M.toFlame + 1 },
  { label: 'Sanctum', at: M.toSanctum + 1 },
  { label: 'Sparring', at: M.toSpar + 0.6 },
  { label: 'Moves', at: M.kata },
  { label: 'Rest', at: M.rest },
  { label: 'Save', at: M.save },
];

/** Window style: the element fades in at `from` and out at `to` (script seconds). */
const win = (from: number, to?: number): { 'data-in': number; 'data-out'?: number } => ({ 'data-in': from, ...(to !== undefined ? { 'data-out': to } : {}) });
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const restBeats = SCRIPT.restBeat;

type Props = { onRead: () => void };

const ScrollStage = ({ onRead }: Props) => {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const [snd, setSnd] = useState(false);

  const toggleSound = () => {
    const next = !sound.enabled;
    sound.setEnabled(next);
    setSnd(next);
  };

  useEffect(() => {
    // a previous visit enabled sound: wake it on the first gesture (browsers require one)
    if (!sound.wasEnabled()) return;
    const wake = () => { sound.setEnabled(true); setSnd(true); window.removeEventListener('pointerdown', wake); window.removeEventListener('keydown', wake); };
    window.addEventListener('pointerdown', wake);
    window.addEventListener('keydown', wake);
    return () => { window.removeEventListener('pointerdown', wake); window.removeEventListener('keydown', wake); };
  }, []);

  useEffect(() => {
    const canvas = cv.current;
    const sec = section.current;
    const root = stage.current;
    if (!canvas || !sec || !root) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    const wins = Array.from(root.querySelectorAll<HTMLElement>('[data-in]'));
    const typed = Array.from(root.querySelectorAll<HTMLElement>('[data-typed]'));
    const chips = Array.from(root.querySelectorAll<HTMLElement>('[data-skill]'));
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-at]'));
    const chapBtns = Array.from(root.querySelectorAll<HTMLElement>('[data-chap]'));

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let scale = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round((r.width * H) / W * dpr);
      scale = canvas.width / W;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const maxScroll = () => Math.max(1, sec.offsetHeight - window.innerHeight);
    const scrollTop = () => clamp(-sec.getBoundingClientRect().top, 0, maxScroll());
    const epsToY = (eps: number) => sec.offsetTop + (eps / TOTAL_EPS) * maxScroll();

    let cur = (scrollTop() / maxScroll()) * TOTAL_EPS;
    let prevCur = cur;
    let last = performance.now();
    let raf = 0;
    let lastChap = -1;
    const held = { down: false, up: false, t: 0 };

    /* ----- keyboard: arrows run the film ----- */
    const typing = (el: EventTarget | null) => {
      const e = el as HTMLElement | null;
      return !!e && (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA' || e.isContentEditable);
    };
    const dialogOpen = () => !!document.querySelector('[role="dialog"]');
    const chapIndex = () => {
      const tauNow = lastTau;
      let idx = 0;
      CHAPTERS.forEach((c, i) => { if (tauNow >= c.at - 0.2) idx = i; });
      return idx;
    };
    const goChapter = (i: number) => {
      const c = CHAPTERS[clamp(i, 0, CHAPTERS.length - 1)];
      window.scrollTo({ top: epsToY(toEps(c.at)), behavior: 'smooth' });
    };
    let lastTau = 0;
    const onKey = (e: KeyboardEvent) => {
      if (typing(e.target) || dialogOpen() || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === 'ArrowDown' || k === 's' || k === 'S') {
        e.preventDefault();
        if (!held.down) { held.down = true; held.t = performance.now(); window.scrollBy(0, 70); }
      } else if (k === 'ArrowUp' || k === 'w' || k === 'W') {
        e.preventDefault();
        if (!held.up) { held.up = true; held.t = performance.now(); window.scrollBy(0, -70); }
      } else if (k === 'ArrowRight') {
        e.preventDefault();
        if (!e.repeat) goChapter(chapIndex() + 1);
      } else if (k === 'ArrowLeft') {
        e.preventDefault();
        if (!e.repeat) goChapter(chapIndex() - 1);
      } else if (k === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (k === 'End') {
        e.preventDefault();
        window.scrollTo({ top: sec.offsetTop + maxScroll(), behavior: 'smooth' });
      } else if (k === ' ' || k === 'PageDown') {
        e.preventDefault();
        window.scrollBy({ top: window.innerHeight * 0.7 * (e.shiftKey ? -1 : 1), behavior: 'smooth' });
      } else if (k === 'PageUp') {
        e.preventDefault();
        window.scrollBy({ top: -window.innerHeight * 0.7, behavior: 'smooth' });
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') held.down = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') held.up = false;
    };
    const onBlur = () => { held.down = held.up = false; };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    const copy = root.querySelector<HTMLElement>('[data-copy]');
    const onCopy = async () => {
      try {
        await navigator.clipboard.writeText(profile.email);
        toast('Email copied', { description: profile.email });
      } catch {
        toast(profile.email, { description: 'Copy it from here.' });
      }
    };
    copy?.addEventListener('click', onCopy);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // held arrow keys keep the hero running (accelerates the longer you hold)
      const dir = (held.down ? 1 : 0) - (held.up ? 1 : 0);
      if (dir !== 0) {
        const heldFor = (now - held.t) / 1000;
        const speed = 260 + Math.min(1, heldFor / 0.9) * 700;
        window.scrollBy(0, dir * speed * dt);
      }

      const tgt = (scrollTop() / maxScroll()) * TOTAL_EPS;
      cur += (tgt - cur) * (1 - Math.exp(-dt * 11));
      if (Math.abs(tgt - cur) < 1e-4) cur = tgt;

      const info = renderFrame(ctx, canvas, cur, scale, now / 1000);
      sound.update(prevCur, cur, info.tau, (cur - prevCur) / Math.max(dt, 0.001) * 0.2);
      prevCur = cur;
      lastTau = info.tau;
      const g = info.glitch;
      canvas.style.filter = g > 0.05 ? `drop-shadow(${(5 * g).toFixed(1)}px 0 0 rgba(255,42,64,.75)) drop-shadow(${(-5 * g).toFixed(1)}px 0 0 rgba(0,216,255,.75))` : '';

      const tau = info.tau;
      for (const el of wins) {
        const a = Number(el.dataset.in);
        const b = el.dataset.out === undefined ? Infinity : Number(el.dataset.out);
        const o = clamp((tau - a) / 0.45, 0, 1) * clamp((b - tau) / 0.45, 0, 1);
        el.style.opacity = String(o);
        el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
        el.style.pointerEvents = o > 0.6 ? 'auto' : 'none';
        el.style.transform = el.dataset.slide ? `translateY(${(1 - o) * 26}px)` : '';
      }
      for (const el of typed) {
        const a = Number(el.dataset.in);
        const text = el.dataset.text ?? '';
        const n = clamp(Math.floor((tau - a - 0.3) * 38), 0, text.length);
        if (el.textContent !== text.slice(0, n)) el.textContent = text.slice(0, n);
      }
      for (const el of chips) el.classList.toggle('on', tau >= (UNLOCK[el.dataset.skill ?? ''] ?? Infinity));
      for (const el of rows) el.classList.toggle('on', tau >= Number(el.dataset.at));
      const ci = chapIndex();
      if (ci !== lastChap) {
        lastChap = ci;
        chapBtns.forEach((b, i) => b.classList.toggle('on', i === ci));
      }
      if (bar.current) bar.current.style.transform = `scaleX(${clamp(cur / TOTAL_EPS, 0, 1)})`;
      if (hint.current) hint.current.style.opacity = tau < M.run1 + 0.6 ? '1' : '0';
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      copy?.removeEventListener('click', onCopy);
      html.style.scrollBehavior = prevBehavior;
    };
  }, []);

  const go = (at: number) => {
    const sec = section.current;
    if (!sec) return;
    const max = sec.offsetHeight - window.innerHeight;
    window.scrollTo({ top: sec.offsetTop + (toEps(at) / TOTAL_EPS) * max, behavior: 'smooth' });
  };

  const filmHeight: CSSProperties = { height: `${Math.round(TOTAL_EPS * 13)}vh` };
  const F = featured;

  return (
    <section ref={section} className="film" style={filmHeight} aria-label="Interactive scroll story">
      <div ref={stage} className="stage">
        <canvas ref={cv} className="stage-canvas" aria-hidden="true" />

        {/* ---------- HUD ---------- */}
        <div className="hud-top">
          <div className="hud-name">TEJAS</div>
          <button type="button" className="mini" onClick={onRead}>READ MODE</button>
          <button type="button" className="mini" onClick={toggleSound} aria-pressed={snd}>SOUND: {snd ? 'ON' : 'OFF'}</button>
        </div>
        <nav className="chap" aria-label="Chapters">
          {CHAPTERS.map((c, i) => (
            <button key={c.label} type="button" data-chap={i} onClick={() => go(c.at)}>{c.label}</button>
          ))}
        </nav>
        <div className="progress" aria-hidden="true"><div ref={bar} /></div>
        <div className="skills" aria-label="Techniques collected">
          <b>TECHNIQUES</b>
          {SKILLS.map((s) => (
            <span key={s} data-skill={s} className="chip">{s}</span>
          ))}
        </div>

        {/* ---------- scene 0: gate ---------- */}
        <div className="cue" ref={hint} aria-hidden="true">
          <span>SCROLL OR PRESS</span>
          <kbd>↓</kbd>
          <span>TO RUN · HOLD TO KEEP RUNNING · <kbd>↑</kbd> REWIND · <kbd>←</kbd><kbd>→</kbd> CHAPTERS</span>
        </div>

        {/* ---------- captions ---------- */}
        <div className="cap" {...win(M.run1 + 1.0, M.run1 + 3.6)} data-slide="1"><span>JUNIOR AI ENGINEER</span> AT KENPATH</div>
        <div className="cap" {...win(M.run1 + 3.8, M.run1 + 6.4)} data-slide="1">MAINTAINER OF <span>RTENSORLABS</span></div>
        <div className="cap" {...win(M.run1 + 6.6, M.run1End + 0.4)} data-slide="1">I BUILD <span>LANGUAGE MODELS</span> FROM SCRATCH.</div>

        {/* ---------- boss cards ---------- */}
        {F.map((f, i) => {
          const from = i === 0 ? M.flameDie + 0.9 : M.sanctumDie + 0.9;
          const to = i === 0 ? M.toSanctum + 1.5 : M.toSpar + 0.6;
          return (
            <article key={f.id} className="card side" {...win(from, to)} data-slide="1">
              <div className="k">BOSS {String(i + 1).padStart(2, '0')} · DEFEATED</div>
              <h2>{f.name}</h2>
              <p className="kk">{f.kicker}</p>
              <p>{f.blurb}</p>
              <div className="chips">{f.stack.map((s) => <span key={s}>{s}</span>)}</div>
              <div className="links">
                {f.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
                ))}
              </div>
            </article>
          );
        })}

        {/* ---------- sparring hall ---------- */}
        <article className="card side list left" {...win(M.spar - 0.2, M.toKata + 0.5)} data-slide="1">
          <div className="k">SPARRING HALL</div>
          <h2>More work</h2>
          <ul>
            {otherWork.map((w, i) => (
              <li key={w.name} data-at={M['spar' + i]}>
                <a href={w.href} target="_blank" rel="noopener noreferrer">
                  <b>{w.name}</b>
                  <small>{w.tags.join(' · ')}</small>
                </a>
              </li>
            ))}
          </ul>
        </article>

        {/* ---------- move list ---------- */}
        <article className="card side wide" {...win(M.kata + 0.2, M.kataEnd + 0.6)} data-slide="1">
          <div className="k">MOVE LIST</div>
          <h2>Techniques</h2>
          <div className="moves">
            {toolbox.map((g) => (
              <div key={g.id}>
                <h3>{g.name}</h3>
                <ul>
                  {g.items.map((it) => (
                    <li key={it.name}><b>{it.name}</b><small>{it.note}</small></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>

        {/* ---------- rest stop: visual-novel dialogue ---------- */}
        {background.map((b, i) => {
          const a = restBeats[i];
          const z = i < restBeats.length - 1 ? restBeats[i + 1] - 0.1 : M.restEnd;
          const text = `${b.title}, ${b.place}. ${b.note}`;
          return (
            <div key={b.id} className="vn" {...win(a, z)}>
              <div className="who">{b.label.toUpperCase()} · {b.when}</div>
              <p data-typed="1" data-in={a} data-text={text} aria-label={text} />
            </div>
          );
        })}

        {/* ---------- save point: contact ---------- */}
        <article className="card side save" {...win(M.save + 0.3)} data-slide="1">
          <div className="k">SAVE POINT</div>
          <h2>Say hello</h2>
          <p>Open to collaborating on AI and systems work. The fastest route is email.</p>
          <button type="button" className="mail" data-copy="1">{profile.email}<small>CLICK TO COPY</small></button>
          <div className="links">
            <a href={`mailto:${profile.email}`}>WRITE MAIL</a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">GITHUB</a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LINKEDIN</a>
            <a href={profile.x} target="_blank" rel="noopener noreferrer">X</a>
            <a href={profile.lab.url} target="_blank" rel="noopener noreferrer">RTENSORLABS</a>
          </div>
          <div className="end">THE END ... FOR NOW.</div>
        </article>
      </div>
    </section>
  );
};

export default ScrollStage;
