import { useEffect, useRef, useState } from 'react';
import { LANDSCAPE, PORTRAIT, renderFrame, type View } from '@/game/render';
import { sound } from '@/game/audio';
import { q } from '@/game/util';
import { H, SCRIPT, TOTAL_EPS, toEps } from '@/game/script';
import { background, featured, otherWork, profile, toolbox } from '@/data/content';
import { toast } from '@/components/ui/sonner';

const M = SCRIPT.marks;
const SKILLS = ['Rust', 'C++', 'Python', 'Dart', 'PyTorch', 'Candle', 'Flutter', 'Kotlin', 'CUDA'];
const UNLOCK: Record<string, number> = {};
for (const u of SCRIPT.unlocks) UNLOCK[u.skill] = u.t;

/** Checkpoints. These are the only way to skip ahead. */
const CHAPTERS: { label: string; at: number }[] = [
  { label: 'Gate', at: 0 },
  { label: 'Bugs', at: M.run1 + 0.4 },
  { label: 'Flame', at: M.toFlame + 1 },
  { label: 'Sanctum', at: M.toSanctum + 1 },
  { label: 'Hum', at: M.toHum + 1 },
  { label: 'Sparring', at: M.toSpar + 0.6 },
  { label: 'Moves', at: M.kata },
  { label: 'Rest', at: M.rest },
  { label: 'Save', at: M.save },
];

const win = (from: number, to?: number): { 'data-in': number; 'data-out'?: number } => ({ 'data-in': from, ...(to !== undefined ? { 'data-out': to } : {}) });
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const restBeats = SCRIPT.restBeat;
/** Mouse and touch clicks should not leave a button focused, or Enter / Space would press it again. */
const blurAfter = (e: { currentTarget: HTMLElement }) => e.currentTarget.blur();

/** Reading pauses. The film holds here at 1x (it never slows down), long enough to read what is on screen. */
type Hold = { tau: number; sec: number };
const readSec = (chars: number) => clamp(2 + chars * 0.04, 2.4, 16);
const HOLDS: Hold[] = [
  { tau: M.run1 + 1.9, sec: 2.2 },
  { tau: M.run1 + 4.7, sec: 2.2 },
  { tau: M.run1 + 7.6, sec: 2.6 },
  ...featured.map((f): Hold => ({
    tau: (f.id === 'flame' ? M.flameDie : f.id === 'sanctum' ? M.sanctumDie : M.humDie) + 1.6,
    sec: readSec(f.kicker.length + f.blurb.length + f.stack.join(' ').length),
  })),
  { tau: M.sparDie + 1.0, sec: readSec(otherWork.map((w) => w.name + w.tags.join(' ')).join(' ').length) },
  { tau: M.kata + 1.2, sec: readSec(toolbox.flatMap((g) => g.items.map((i) => i.name + i.note)).join(' ').length) },
  ...background.map((b, i): Hold => {
    const len = `${b.title}, ${b.place}. ${b.note}`.length;
    return { tau: restBeats[i] + 0.3 + len / 38 + 0.25, sec: readSec(len) };
  }),
].sort((a, b) => a.tau - b.tau);
const HOLD_EPS = HOLDS.map((h) => toEps(h.tau));

/** When each flagship card is on screen (script seconds). */
const CARD_WINDOW: Record<string, [number, number]> = {
  flame: [M.flameDie + 0.9, M.toSanctum + 1.5],
  sanctum: [M.sanctumDie + 0.9, M.toHum + 1.5],
  hum: [M.humDie + 0.9, M.toSpar + 0.6],
};

type Props = { onRead: () => void };

const ScrollStage = ({ onRead }: Props) => {
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const statusEl = useRef<HTMLButtonElement>(null);
  const wipe = useRef<HTMLDivElement>(null);
  const api = useRef<{ jump: (tau: number) => void; toggle: () => void; cont: () => void }>({ jump: () => undefined, toggle: () => undefined, cont: () => undefined });
  const [snd, setSnd] = useState(false);
  const [auto, setAuto] = useState(false);

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
    const root = stage.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // The film owns the screen: no page scrolling, input only chooses a direction.
    document.documentElement.classList.add('film-lock');

    const wins = Array.from(root.querySelectorAll<HTMLElement>('[data-in]'));
    const typed = Array.from(root.querySelectorAll<HTMLElement>('[data-typed]'));
    const chips = Array.from(root.querySelectorAll<HTMLElement>('[data-skill]'));
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-at]'));
    const chapBtns = Array.from(root.querySelectorAll<HTMLElement>('[data-chap]'));

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    q.k = coarse ? 0 : 1; // canvas shadow blur is very slow on phone GPUs
    let view: View = LANDSCAPE;
    let scale = 1;
    const resize = () => {
      const portrait = window.innerWidth < window.innerHeight * 0.9;
      view = portrait ? PORTRAIT : LANDSCAPE;
      root.style.setProperty('--ar', `${view.vw} / ${H}`);
      const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.75 : 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(((r.width * H) / view.vw) * dpr);
      scale = canvas.width / view.vw;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    /* ================= the playhead: always exactly 1x ================= */
    let cur = 0;
    let prevCur = 0;
    let lastTau = 0;
    let autoPlay = false;
    let timedDir = 0; // wheel / touch intent
    let timedUntil = 0;
    const kb = { down: false, up: false };
    let lastStatus = '';
    let hold = -1; // index of the reading pause we are sitting in, or -1
    let holdStart = 0;
    const released = new Set<number>();

    const chapIndex = () => {
      let idx = 0;
      CHAPTERS.forEach((c, i) => { if (lastTau >= c.at - 0.2) idx = i; });
      return idx;
    };
    const jumpTo = (tau: number) => {
      cur = toEps(tau);
      prevCur = cur;
      autoPlay = false;
      setAuto(false);
      hold = -1;
      released.clear();
      const w = wipe.current;
      if (w) {
        w.classList.remove('go');
        void w.offsetWidth;
        w.classList.add('go');
      }
    };
    const goChapter = (i: number) => jumpTo(CHAPTERS[clamp(i, 0, CHAPTERS.length - 1)].at);
    const toggleAuto = () => {
      if (cur >= TOTAL_EPS - 0.01) jumpTo(0);
      autoPlay = !autoPlay;
      setAuto(autoPlay);
    };
    const releaseHold = () => {
      if (hold === -1) return false;
      released.add(hold);
      hold = -1;
      return true;
    };
    api.current = { jump: jumpTo, toggle: toggleAuto, cont: () => { if (!releaseHold()) toggleAuto(); } };

    const dialogOpen = () => !!document.querySelector('[role="dialog"]');
    const typing = (el: EventTarget | null) => {
      const e = el as HTMLElement | null;
      return !!e && (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA' || e.isContentEditable);
    };
    // a card with more content than fits may scroll on its own
    const inScrollableCard = (el: EventTarget | null) => {
      const card = (el as HTMLElement | null)?.closest?.('.card') as HTMLElement | null;
      return !!card && card.scrollHeight > card.clientHeight + 2;
    };

    const onKey = (e: KeyboardEvent) => {
      if (typing(e.target) || dialogOpen() || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); kb.down = true; }
      else if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); kb.up = true; }
      else if (k === 'ArrowRight') { e.preventDefault(); if (!e.repeat) goChapter(chapIndex() + 1); }
      else if (k === 'ArrowLeft') { e.preventDefault(); if (!e.repeat) goChapter(chapIndex() - 1); }
      else if (k === 'Home') { e.preventDefault(); goChapter(0); }
      else if (k === 'End') { e.preventDefault(); goChapter(CHAPTERS.length - 1); }
      else if (k === 'Enter') {
        if ((e.target as HTMLElement | null)?.closest?.('a,button')) return;
        e.preventDefault();
        releaseHold();
      }
      else if (k === ' ') {
        if ((e.target as HTMLElement | null)?.closest?.('a,button')) return;
        e.preventDefault();
        if (!e.repeat) toggleAuto();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') kb.down = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') kb.up = false;
    };
    const onBlur = () => { kb.down = kb.up = false; timedDir = 0; };

    const onWheel = (e: WheelEvent) => {
      if (dialogOpen() || inScrollableCard(e.target)) return;
      e.preventDefault();
      const d = e.deltaY || e.deltaX;
      if (Math.abs(d) < 3) return; // ignore the tail of trackpad inertia
      timedDir = d > 0 ? 1 : -1;
      timedUntil = performance.now() + 170;
    };

    let touching = false;
    let ty = 0;
    let tDir = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (inScrollableCard(e.target)) { touching = false; return; }
      touching = true;
      ty = e.touches[0].clientY;
      tDir = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touching) return;
      e.preventDefault();
      const y = e.touches[0].clientY;
      const dy = y - ty;
      if (Math.abs(dy) > 4) {
        tDir = dy < 0 ? 1 : -1; // swipe up plays, swipe down rewinds
        ty = y;
      }
      if (tDir !== 0) { timedDir = tDir; timedUntil = Infinity; }
    };
    const onTouchEnd = () => {
      if (!touching) return;
      touching = false;
      if (tDir !== 0) { timedDir = tDir; timedUntil = performance.now() + 300; }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    window.addEventListener('wheel', onWheel, { passive: false });
    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove', onTouchMove, { passive: false });
    root.addEventListener('touchend', onTouchEnd);
    root.addEventListener('touchcancel', onTouchEnd);
    const onCanvasClick = () => toggleAuto();
    canvas.addEventListener('click', onCanvasClick);

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

    let last = performance.now();
    let raf = 0;
    let lastChap = -1;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // direction only, never speed: every frame advances by exactly dt.
      if (timedDir !== 0 && now >= timedUntil) timedDir = 0;
      const kbDir = (kb.down ? 1 : 0) - (kb.up ? 1 : 0);
      const dir = kbDir !== 0 ? kbDir : timedDir !== 0 ? timedDir : autoPlay ? 1 : 0;

      prevCur = cur;
      // reading pauses: forward motion stops at a hold until its reading time is up
      for (const i of Array.from(released)) if (cur < HOLD_EPS[i] - 0.3) released.delete(i);
      let next = dir !== 0 ? clamp(cur + dir * dt, 0, TOTAL_EPS) : cur;
      if (hold === -1 && dir > 0) {
        for (let i = 0; i < HOLDS.length; i++) {
          if (!released.has(i) && cur < HOLD_EPS[i] - 1e-6 && next >= HOLD_EPS[i]) { hold = i; holdStart = now; next = HOLD_EPS[i]; break; }
        }
      }
      let remaining = 0;
      if (hold !== -1) {
        if (dir < 0) { hold = -1; }
        else {
          next = HOLD_EPS[hold];
          remaining = HOLDS[hold].sec - (now - holdStart) / 1000;
          if (remaining <= 0 && dir > 0) { released.add(hold); hold = -1; next = clamp(cur + dt, 0, TOTAL_EPS); }
        }
      }
      cur = next;
      if (cur >= TOTAL_EPS && autoPlay) { autoPlay = false; setAuto(false); }

      const info = renderFrame(ctx, canvas, cur, scale, now / 1000, view);
      sound.update(prevCur, cur, info.tau, dir);
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
      const reading = hold !== -1;
      const status = cur >= TOTAL_EPS
        ? 'THE END'
        : reading
          ? remaining > 0 ? `❚❚ READ · ${Math.ceil(remaining)}s · TAP TO CONTINUE` : '▶ READY · PRESS ↓ OR TAP'
          : dir > 0 ? '▶ PLAYING  1×' : dir < 0 ? '◀ REWIND  1×' : '❚❚ PAUSED';
      if (status !== lastStatus && statusEl.current) {
        lastStatus = status;
        statusEl.current.textContent = status;
        statusEl.current.dataset.state = reading ? 'read' : dir > 0 ? 'play' : dir < 0 ? 'back' : 'pause';
      }
      if (reading !== root.classList.contains('reading')) root.classList.toggle('reading', reading);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.documentElement.classList.remove('film-lock');
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('wheel', onWheel);
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove', onTouchMove);
      root.removeEventListener('touchend', onTouchEnd);
      root.removeEventListener('touchcancel', onTouchEnd);
      canvas.removeEventListener('click', onCanvasClick);
      copy?.removeEventListener('click', onCopy);
    };
  }, []);

  return (
    <section className="film" aria-label="Interactive story. Hold the down arrow, scroll or swipe up to play. It always plays at normal speed.">
      <div ref={stage} className="stage">
        <canvas ref={cv} className="stage-canvas" aria-hidden="true" />
        <div ref={wipe} className="wipe" aria-hidden="true" />

        {/* ---------- HUD ---------- */}
        <div className="hud-top">
          <div className="hud-name">TEJAS</div>
          <button type="button" className="mini" onClick={(e) => { api.current.toggle(); blurAfter(e); }} aria-pressed={auto}>{auto ? 'PAUSE' : 'PLAY'}</button>
          <button type="button" className="mini" onClick={(e) => { blurAfter(e); onRead(); }}>READ MODE</button>
          <button type="button" className="mini" onClick={(e) => { toggleSound(); blurAfter(e); }} aria-pressed={snd}>SOUND: {snd ? 'ON' : 'OFF'}</button>
        </div>
        <nav className="chap" aria-label="Chapters">
          {CHAPTERS.map((c, i) => (
            <button key={c.label} type="button" data-chap={i} onClick={(e) => { api.current.jump(c.at); blurAfter(e); }}>{c.label}</button>
          ))}
        </nav>
        <button type="button" ref={statusEl} className="status" aria-live="off" data-state="pause" onClick={(e) => { api.current.cont(); blurAfter(e); }}>❚❚ PAUSED</button>
        <div className="progress" aria-hidden="true"><div ref={bar} /></div>
        <div className="skills" aria-label="Techniques collected">
          <b>TECHNIQUES</b>
          {SKILLS.map((s) => (
            <span key={s} data-skill={s} className="chip">{s}</span>
          ))}
        </div>

        {/* ---------- scene 0: gate ---------- */}
        <div className="cue" ref={hint} aria-hidden="true">
          <span className="kb-only">HOLD <kbd>↓</kbd> OR SCROLL TO PLAY · ALWAYS 1× · <kbd>↑</kbd> REWIND · <kbd>SPACE</kbd> PLAY / PAUSE · <kbd>ENTER</kbd> CONTINUE · <kbd>←</kbd><kbd>→</kbd> CHAPTERS</span>
          <span className="touch-only">SWIPE UP OR TAP PLAY · SWIPE DOWN TO REWIND · ALWAYS 1× · IT PAUSES SO YOU CAN READ · TAP A CHAPTER TO SKIP</span>
        </div>

        {/* ---------- captions ---------- */}
        <div className="cap" {...win(M.run1 + 1.0, M.run1 + 3.6)} data-slide="1"><span>JUNIOR AI ENGINEER</span> AT KENPATH</div>
        <div className="cap" {...win(M.run1 + 3.8, M.run1 + 6.4)} data-slide="1">MAINTAINER OF <span>RTENSORLABS</span></div>
        <div className="cap" {...win(M.run1 + 6.6, M.run1End + 0.4)} data-slide="1">I BUILD <span>LANGUAGE MODELS</span> FROM SCRATCH.</div>

        {/* ---------- flagship cards ---------- */}
        {featured.map((f, i) => {
          const [from, to] = CARD_WINDOW[f.id];
          return (
            <article key={f.id} className="card side" {...win(from, to)} data-slide="1">
              <div className="k">FLAGSHIP {String(i + 1).padStart(2, '0')} · DEFEATED</div>
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
