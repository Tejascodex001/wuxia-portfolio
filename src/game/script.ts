/**
 * The film script.
 *
 * Everything that happens in the scroll-driven scene is authored here as a
 * timeline in "script seconds" (τ). The renderer is a pure function of time,
 * so scrubbing forwards or backwards with the scroll bar always shows the
 * exact right frame.
 */

import { background } from '../data/content';

export const W = 1000;
export const H = 560;
export const GY = 452; // ground line
export const PLAYER_SX = 380; // where the hero sits on screen

export type Step = 1 | 2 | 3;
export type HitFx = 'n' | 'clang' | 'break' | 'impact' | 'final';
export type Hit = { t: number; step: Step; fx: HitFx; eps: number; id: number };
export type FoeKind = 'walk' | 'fly' | 'flame' | 'sanctum' | 'hum';
export type Look = 'guard' | 'wall' | 'eye' | 'spike' | 'immune';
export type SpecialKind = 'whirl' | 'wave' | 'thunder' | 'heaven' | 'leap' | 'decrypt' | 'sonic';
export type Special = { t: number; kind: SpecialKind; name: string; zh: string; x: number; to?: number; t1?: number };
export type Chapter = { t: number; name: string; zh: string };
export type Foe = {
  id: string;
  kind: FoeKind;
  label: string;
  x: number;
  lift: number;
  spawn: number;
  hp: number;
  hits: Hit[];
  skill?: string;
  scale: number;
  stack?: string[];
  look?: Look;
};
export type Slash = { t: number; step: Step };
export type Jump = { t: number; dur: number; h: number };
export type Proj = { t0: number; t1: number; x0: number; x1: number; kind: 'wave' | 'orb' | 'sound'; parry: boolean; n: number };

export const DUR: Record<Step, number> = { 1: 0.26, 2: 0.26, 3: 0.42 };
const HITAT: Record<Step, number> = { 1: 0.09, 2: 0.09, 3: 0.17 };

type Mark = Record<string, number>;

function build() {
  const keys: [number, number][] = [];
  const slashes: Slash[] = [];
  const jumps: Jump[] = [];
  const foes: Foe[] = [];
  const projs: Proj[] = [];
  const marks: Mark = {};
  const unlocks: { skill: string; t: number }[] = [];
  const gates: { x: number; name: string; zh: string; id: 'flame' | 'sanctum' | 'hum' }[] = [];
  const sits: { from: number; to: number }[] = [];
  const specials: Special[] = [];
  const chapters: Chapter[] = [];
  let t = 0;
  let x = 300;
  let hitId = 0;
  keys.push([0, x]);

  const key = () => keys.push([t, x]);
  const run = (to: number, speed = 300) => {
    key();
    t += Math.abs(to - x) / speed;
    x = to;
    key();
  };
  const idle = (d: number) => {
    key();
    t += d;
    key();
  };
  const mark = (name: string) => {
    marks[name] = t;
  };
  const foe = (f: Omit<Foe, 'hits' | 'scale'> & { scale?: number }): Foe => {
    const e: Foe = { ...f, scale: f.scale ?? 1, hits: [] };
    foes.push(e);
    return e;
  };
  const slash = (step: Step, targets: Foe[], fx: HitFx = 'n') => {
    slashes.push({ t, step });
    for (const e of targets) e.hits.push({ t: t + HITAT[step], step, fx, eps: 0, id: hitId++ });
    t += DUR[step] + 0.05;
  };
  const jump = (dur = 0.72, h = 96) => {
    jumps.push({ t, dur, h });
    return t;
  };
  const special = (sp: Special) => specials.push(sp);
  const chapter = (name: string, zh: string, at = t) => chapters.push({ t: at, name, zh });
  const kill = (e: Foe) => {
    if (e.skill) unlocks.push({ skill: e.skill, t: e.hits[e.hits.length - 1].t });
  };

  /* ---------- 0. The Gate ---------- */
  mark('gate');
  idle(3.4);

  /* ---------- 1. Run + first fights ---------- */
  mark('run1');
  chapter('BUGS', '虫', t + 0.2);
  run(820, 280);

  const A = foe({ id: 'a', kind: 'walk', label: 'NullPointer', x: x + 340, lift: 0, spawn: t, hp: 1, skill: 'Rust' });
  run(A.x - 66);
  slash(1, [A]);
  kill(A);
  idle(0.3);

  const B = foe({ id: 'b', kind: 'walk', label: 'Segfault', x: x + 340, lift: 0, spawn: t, hp: 2, skill: 'C++' });
  run(B.x - 66);
  slash(1, [B]);
  slash(2, [B]);
  kill(B);
  idle(0.3);

  const C = foe({ id: 'c', kind: 'fly', label: 'Memory Leak', x: x + 330, lift: 120, spawn: t, hp: 1, skill: 'Python' });
  run(C.x - 70);
  const jc = jump();
  special({ t: jc + 0.1, kind: 'leap', name: 'SKY DRAGON LEAP', zh: '升龙斩', x: x });
  t = jc + 0.22;
  slash(1, [C]);
  t = jc + 0.8;
  kill(C);
  idle(0.2);

  // wave slash: a crescent of sword light cuts both bugs from across the clearing
  const D1 = foe({ id: 'd1', kind: 'walk', label: 'Race Condition', x: x + 500, lift: 0, spawn: t, hp: 1, skill: 'Dart' });
  const D2 = foe({ id: 'd2', kind: 'walk', label: 'Heisenbug', x: x + 590, lift: 0, spawn: t, hp: 1, skill: 'PyTorch' });
  idle(0.9);
  const ws = t;
  slashes.push({ t: ws, step: 2 });
  special({ t: ws + 0.1, kind: 'wave', name: 'WAVE SLASH', zh: '剑气', x: x + 70, to: D2.x, t1: ws + 0.55 });
  D1.hits.push({ t: ws + 0.38, step: 3, fx: 'impact', eps: 0, id: hitId++ });
  D2.hits.push({ t: ws + 0.5, step: 3, fx: 'impact', eps: 0, id: hitId++ });
  kill(D1);
  kill(D2);
  t = ws + 1.1;
  idle(0.4);
  mark('run1End');

  /* ---------- 2. FLAME ---------- */
  mark('toFlame');
  const gF = x + 620;
  gates.push({ x: gF, name: 'FLAME', zh: '焰', id: 'flame' });
  run(gF + 90, 300);
  mark('flameGate');
  chapter('BOSS 01 · FLAME', '焰', t + 0.6);
  const FB = foe({
    id: 'flame', kind: 'flame', label: 'FLAME', x: gF + 560, lift: 0, spawn: t, hp: 9, scale: 1.7,
    skill: 'Candle', stack: ['Rust', 'Candle', 'Transformers', 'Hugging Face'],
  });
  run(FB.x - 230, 300);
  const waveAt = (arrive: number) => {
    // a fire wave leaves the boss and reaches the hero at `arrive`
    const t0 = arrive - 1.0;
    projs.push({ t0, t1: arrive, x0: FB.x - 60, x1: x - 10, kind: 'wave', parry: false, n: projs.length });
    return t0;
  };
  // wave 1: dodge by jumping
  const w1 = t + 0.5;
  waveAt(w1 + 0.5);
  t = w1 + 0.5 - 0.72 / 2;
  jump();
  t += 0.72;
  idle(0.1);
  run(FB.x - 108, 520);
  slash(1, [FB]);
  slash(2, [FB]);
  slash(3, [FB]);
  idle(0.5);
  // wave 2
  const w2 = t + 0.3;
  waveAt(w2 + 0.5);
  t = w2 + 0.5 - 0.72 / 2;
  jump();
  t += 0.72;
  idle(0.1);
  slash(1, [FB]);
  slash(2, [FB]);
  slash(3, [FB]);
  idle(0.35);
  // finish
  slash(1, [FB]);
  slash(2, [FB]);
  slash(3, [FB], 'final');
  FB.hits.forEach((h, i) => (h.fx = i === FB.hits.length - 1 ? 'final' : 'n'));
  kill(FB);
  special({ t: FB.hits[2].t - 0.12, kind: 'whirl', name: 'WHIRLWIND SLASH', zh: '旋风斩', x });
  special({ t: FB.hits[5].t - 0.2, kind: 'thunder', name: 'THUNDER STRIKE', zh: '雷击', x: FB.x });
  special({ t: FB.hits[8].t - 0.25, kind: 'heaven', name: 'HEAVEN CUT', zh: '天剑', x: FB.x });
  mark('flameDie');
  idle(2.2);

  /* ---------- 3. SANCTUM (night) ---------- */
  mark('toSanctum');
  const gS = x + 600;
  gates.push({ x: gS, name: 'SANCTUM', zh: '盾', id: 'sanctum' });
  run(gS + 90, 300);
  mark('sanctumGate');
  chapter('BOSS 02 · SANCTUM', '盾', t + 0.6);
  const SB = foe({
    id: 'sanctum', kind: 'sanctum', label: 'SANCTUM', x: gS + 560, lift: 0, spawn: t, hp: 9, scale: 1.6,
    skill: 'Flutter', stack: ['Rust', 'Flutter', 'Dart', 'E2E', 'Tor'],
  });
  run(SB.x - 330, 300);
  // three relay orbs, parried one by one
  const orbAt = (arrive: number, n: number) => {
    projs.push({ t0: arrive - 0.9, t1: arrive, x0: SB.x - 40, x1: x + 30, kind: 'orb', parry: true, n });
  };
  const o0 = t + 0.9;
  orbAt(o0, 0);
  orbAt(o0 + 0.5, 1);
  orbAt(o0 + 1.0, 2);
  t = o0 - 0.1;
  slashes.push({ t, step: 1 });
  t = o0 + 0.4;
  slashes.push({ t, step: 2 });
  t = o0 + 0.9;
  slashes.push({ t, step: 1 });
  t = o0 + 1.35;
  idle(0.1);
  run(SB.x - 124, 520);
  // shield absorbs three hits, the fourth breaks it
  slash(1, [SB], 'clang');
  slash(2, [SB], 'clang');
  slash(3, [SB], 'clang');
  idle(0.3);
  slash(1, [SB], 'break');
  idle(0.35);
  slash(1, [SB]);
  slash(2, [SB]);
  idle(0.25);
  slash(1, [SB]);
  slash(2, [SB]);
  slash(3, [SB], 'final');
  kill(SB);
  special({ t: SB.hits[2].t - 0.12, kind: 'whirl', name: 'WHIRLWIND SLASH', zh: '旋风斩', x });
  special({ t: SB.hits[8].t - 0.25, kind: 'decrypt', name: 'DECRYPT', zh: '破译', x: SB.x });
  mark('sanctumDie');
  idle(2.2);

  /* ---------- 3b. HUM (night) ---------- */
  mark('toHum');
  const gH = x + 600;
  gates.push({ x: gH, name: 'HUM', zh: '音', id: 'hum' });
  run(gH + 90, 300);
  mark('humGate');
  chapter('BOSS 03 · HUM', '音', t + 0.6);
  const HB = foe({
    id: 'hum', kind: 'hum', label: 'HUM', x: gH + 560, lift: 0, spawn: t, hp: 9, scale: 1.5,
    skill: 'Kotlin', stack: ['Kotlin', 'Android', 'DMR', 'YT Music · Spotify'],
  });
  run(HB.x - 300, 300);
  const soundAt = (arrive: number) => {
    projs.push({ t0: arrive - 1.0, t1: arrive, x0: HB.x - 90, x1: x - 10, kind: 'sound', parry: false, n: projs.length });
  };
  const h1 = t + 0.5;
  soundAt(h1 + 0.5);
  t = h1 + 0.5 - 0.72 / 2;
  jump();
  t += 0.72;
  idle(0.1);
  run(HB.x - 150, 520);
  slash(1, [HB]);
  slash(2, [HB]);
  slash(3, [HB]);
  idle(0.5);
  const h2 = t + 0.3;
  soundAt(h2 + 0.5);
  t = h2 + 0.5 - 0.72 / 2;
  jump();
  t += 0.72;
  idle(0.1);
  slash(1, [HB]);
  slash(2, [HB]);
  slash(3, [HB]);
  idle(0.35);
  slash(1, [HB]);
  slash(2, [HB]);
  slash(3, [HB], 'final');
  HB.hits.forEach((h, i) => (h.fx = i === HB.hits.length - 1 ? 'final' : 'n'));
  kill(HB);
  special({ t: HB.hits[2].t - 0.12, kind: 'whirl', name: 'WHIRLWIND SLASH', zh: '旋风斩', x });
  special({ t: HB.hits[5].t - 0.2, kind: 'sonic', name: 'SONIC BOOM', zh: '音波', x });
  special({ t: HB.hits[8].t - 0.25, kind: 'heaven', name: 'HEAVEN CUT', zh: '天剑', x: HB.x });
  mark('humDie');
  idle(2.2);

  /* ---------- 4. Sparring hall ---------- */
  mark('toSpar');
  const sp: [string, string, Look][] = [
    ['GuardLayer', '', 'guard'],
    ['SmartGuard', '', 'wall'],
    ['Vision Engine', 'CUDA', 'eye'],
    ['Anomaly Detector', '', 'spike'],
    ['Auto-Immunity', '', 'immune'],
  ];
  run(x + 300, 300);
  mark('spar');
  chapter('SPARRING HALL', '武', t + 0.1);
  const base = x + 360;
  const minis = sp.map(([label, skill, look], i) =>
    foe({ id: 'm' + i, kind: 'walk', look, label, x: base + i * 120, lift: 0, spawn: t, hp: 1, skill: skill || undefined }),
  );
  minis.forEach((m, i) => {
    run(m.x - 66, 560);
    slash(((i % 2) + 1) as Step, [m], i === minis.length - 1 ? 'final' : 'n');
    kill(m);
    mark('spar' + i);
    if (i < minis.length - 1) idle(0.08);
  });
  special({ t: minis[4].hits[0].t - 0.2, kind: 'thunder', name: 'THUNDER STRIKE', zh: '雷击', x: minis[4].x });
  mark('sparDie');
  idle(1.8);

  /* ---------- 5. Training: the move list ---------- */
  mark('toKata');
  run(x + 380, 320);
  mark('kata');
  chapter('MOVE LIST', '技', t);
  idle(0.6);
  for (let i = 0; i < 3; i++) {
    const j = jump(0.9, 110);
    special({ t: j + 0.1, kind: i === 1 ? 'leap' : 'whirl', name: i === 1 ? 'SKY DRAGON LEAP' : 'WHIRLWIND SLASH', zh: i === 1 ? '升龙斩' : '旋风斩', x });
    t = j + 0.16;
    slashes.push({ t, step: 3 });
    t = j + 1.1;
    idle(0.25);
  }
  idle(1.0);
  mark('kataEnd');

  /* ---------- 6. Rest stop: about ---------- */
  mark('toRest');
  const campX = x + 520;
  run(campX - 70, 300);
  idle(0.3);
  mark('rest');
  chapter('REST STOP', '息', t);
  const sitFrom = t;
  // each dialogue line gets time to type out (38 chars/s) plus a cushion after the reading pause
  const restBeat: number[] = [];
  let off = 0.8;
  for (const b of background) {
    restBeat.push(sitFrom + off);
    off += 0.5 + `${b.title}, ${b.place}. ${b.note}`.length / 38 + 1.4;
  }
  idle(off + 0.2);
  sits.push({ from: sitFrom, to: t });
  mark('restEnd');

  /* ---------- 7. Save point: contact ---------- */
  mark('toSave');
  const shrineX = x + 520;
  run(shrineX - 60, 300);
  mark('save');
  chapter('SAVE POINT', '存', t);
  idle(9);
  mark('end');

  const total = t;
  return { keys, slashes, jumps, foes, projs, marks, unlocks, gates, sits, specials, chapters, total, campX, shrineX, restBeat };
}

export const SCRIPT = build();

/* ---------- hit-stop: effects run on a real clock (ε); animation on script time (τ) ---------- */
const allHits: Hit[] = SCRIPT.foes.flatMap((f) => f.hits).sort((a, b) => a.t - b.t);
const freezeOf = (h: Hit) => (h.fx === 'final' ? 0.16 : h.fx === 'impact' ? 0.13 : h.fx === 'clang' ? 0.08 : h.step === 3 ? 0.1 : 0.06);
(function assignEps() {
  let acc = 0;
  for (const h of allHits) {
    h.eps = h.t + acc;
    acc += freezeOf(h);
  }
})();
export const HITS = allHits;
export const FREEZE_TOTAL = allHits.reduce((a, h) => a + freezeOf(h), 0);
export const TOTAL_EPS = SCRIPT.total + FREEZE_TOTAL;

/** Effects clock (ε) → animation time (τ). Time stalls briefly after every landed hit. */
export function toTau(eps: number): number {
  let tau = eps;
  for (const h of allHits) {
    const f = freezeOf(h);
    tau -= Math.min(Math.max(eps - h.eps, 0), f);
  }
  return Math.max(0, Math.min(SCRIPT.total, tau));
}

/* ---------- queries ---------- */
export function playerX(tau: number): number {
  const k = SCRIPT.keys;
  if (tau <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (tau <= k[i][0]) {
      const [t0, x0] = k[i - 1];
      const [t1, x1] = k[i];
      if (t1 === t0) return x1;
      return x0 + ((x1 - x0) * (tau - t0)) / (t1 - t0);
    }
  }
  return k[k.length - 1][1];
}
export function playerSpeed(tau: number): number {
  return (playerX(tau + 0.03) - playerX(tau - 0.03)) / 0.06;
}
export function jumpY(tau: number): number {
  for (const j of SCRIPT.jumps) {
    const u = (tau - j.t) / j.dur;
    if (u >= 0 && u <= 1) return -j.h * 4 * u * (1 - u);
  }
  return 0;
}
export function slashAt(tau: number): { step: Step; p: number } | null {
  for (const s of SCRIPT.slashes) {
    const p = (tau - s.t) / DUR[s.step];
    if (p >= 0 && p <= 1) return { step: s.step, p };
  }
  return null;
}
export function sitting(tau: number): boolean {
  return SCRIPT.sits.some((s) => tau >= s.from && tau <= s.to);
}
const ramp = (tau: number, a: number, b: number) => Math.max(0, Math.min(1, (tau - a) / (b - a)));
/** 0 = day, 1 = night */
export function nightAmt(tau: number): number {
  const m = SCRIPT.marks;
  return ramp(tau, m.toSanctum + 1.4, m.toSanctum + 4.2) - ramp(tau, m.toSave + 0.2, m.save + 4);
}
/** how far the sun has risen at the end (dawn) */
export function dawnAmt(tau: number): number {
  const m = SCRIPT.marks;
  return ramp(tau, m.toSave, m.save + 4);
}

/** Script time (τ) → effects clock (ε): the inverse of toTau, used for jumping to chapters. */
export function toEps(tau: number): number {
  let e = tau;
  for (const h of allHits) if (h.t < tau) e += freezeOf(h);
  return e;
}
