import {
  GY, H, HITS, PLAYER_SX, SCRIPT, W,
  dawnAmt, jumpY, nightAmt, playerSpeed, playerX, sitting, slashAt, toTau,
  type Foe, type Hit,
} from './script';
import { amb, q, clamp, css, ease, flames, fr, lerp, mixc, FIRE, GOLD, RED, type C2, type Pal, type RGB } from './util';
import { drawHumBoss, drawMini, drawOnionKeeper, drawTransformer, foeCenter } from './bosses';
import { drawChapterCard, drawHitExtras, drawLights, drawSpecialBanner, drawSpecials, flashAmt, zoomPunch } from './fx';

/* ---------- palette ---------- */
type RGBt = RGB;
const DAY: Pal = { paper: [239, 232, 214], ink: [15, 13, 11], far: [217, 209, 189], mid: [191, 183, 161], ground: [230, 223, 203], sun: [214, 42, 30], night: 0 };
const NIGHT: Pal = { paper: [19, 16, 24], ink: [239, 232, 214], far: [33, 29, 44], mid: [45, 39, 60], ground: [27, 23, 34], sun: [238, 230, 210], night: 1 };
function palette(n: number): Pal {
  return {
    paper: mixc(DAY.paper, NIGHT.paper, n), ink: mixc(DAY.ink, NIGHT.ink, n), far: mixc(DAY.far, NIGHT.far, n),
    mid: mixc(DAY.mid, NIGHT.mid, n), ground: mixc(DAY.ground, NIGHT.ground, n), sun: mixc(DAY.sun, NIGHT.sun, n), night: n,
  };
}
void (null as unknown as RGBt);

/* ---------- static world geometry (built once) ---------- */
function ridge(seed: number, len: number, base: number, amp: number, step: number) {
  const pts: [number, number][] = [];
  for (let x = -200; x <= len; x += step) {
    pts.push([x, base - (0.25 + fr(x * 0.01 + seed) * 0.75) * amp * (0.55 + 0.45 * Math.abs(Math.sin(x * 0.0017 + seed)))]);
  }
  return pts;
}
const WORLD_LEN = 6200;
const farR = ridge(11, WORLD_LEN, GY - 70, 250, 62);
const midR = ridge(23, WORLD_LEN, GY - 20, 170, 48);
const bamboo: { x: number; h: number; sw: number; w: number }[] = [];
for (let x = 40, i = 0; x < WORLD_LEN; i++) {
  bamboo.push({ x, h: 190 + fr(i * 3.1) * 140, sw: (fr(i * 5.7) - 0.5) * 28, w: 5 + fr(i * 2.3) * 4 });
  x += 70 + fr(i * 9.9) * 100;
}
const tufts: { x: number; h: number; n: number }[] = [];
for (let x = 0, i = 0; x < WORLD_LEN; i++) {
  tufts.push({ x, h: 8 + fr(i * 1.9) * 12, n: 1 + Math.floor(fr(i * 7.7) * 3) });
  x += 30 + fr(i * 4.1) * 40;
}

let dotPat: HTMLCanvasElement | null = null;
let grainPat: HTMLCanvasElement | null = null;
function patterns() {
  if (dotPat && grainPat) return;
  dotPat = document.createElement('canvas');
  dotPat.width = dotPat.height = 7;
  let c = dotPat.getContext('2d')!;
  c.fillStyle = 'rgba(128,128,128,.55)';
  c.beginPath();
  c.arc(3.5, 3.5, 1.5, 0, 6.3);
  c.fill();
  grainPat = document.createElement('canvas');
  grainPat.width = grainPat.height = 160;
  c = grainPat.getContext('2d')!;
  for (let i = 0; i < 260; i++) {
    c.fillStyle = `rgba(90,70,40,${fr(i * 1.3) * 0.08})`;
    c.fillRect(fr(i * 2.1) * 160, fr(i * 3.7) * 160, 1 + fr(i * 5.1) * 2, 1 + fr(i * 6.3) * 2);
  }
}

/* ---------- stick figure ---------- */
type FigOpts = {
  x: number; y: number; face: 1 | -1; ph: number; air: boolean; run: boolean; idle: number;
  atk?: { step: number; p: number } | null; sword?: boolean; zombie?: boolean; windup?: boolean;
  col: string; w: number; head: string; headband?: boolean; sit?: boolean; scale?: number;
};
function fig(c: CanvasRenderingContext2D, o: FigOpts, P: Pal): [number, number] | null {
  c.save();
  c.translate(o.x, o.y);
  const sc = o.scale ?? 1;
  c.scale(o.face * sc, sc);
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.strokeStyle = o.col;
  c.fillStyle = o.col;
  c.lineWidth = o.w;
  const run = o.run;
  const sit = !!o.sit;
  const bob = o.air || sit ? 0 : run ? Math.abs(Math.sin(o.ph)) * 3 : Math.sin(o.idle * 2.2) * 1.3;
  const lean = sit ? 0.05 : run ? 0.16 : 0.04;
  const hy = (sit ? -20 : -38) - bob;
  const nx = Math.sin(lean) * 30;
  const ny = hy - Math.cos(lean) * 30;
  const limb = (x0: number, y0: number, a1: number, l1: number, a2: number, l2: number) => {
    const kx = x0 + Math.sin(a1) * l1;
    const ky = y0 + Math.cos(a1) * l1;
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(kx, ky);
    c.lineTo(kx + Math.sin(a2) * l2, ky + Math.cos(a2) * l2);
    c.stroke();
  };
  for (let i = 0; i < 2; i++) {
    const ph = o.ph + i * Math.PI;
    let a1: number;
    let a2: number;
    if (sit) { a1 = i ? 1.35 : 1.05; a2 = i ? 0.05 : -0.1; }
    else if (o.air) { a1 = i ? 0.9 : -0.35; a2 = a1 - 1; }
    else if (run) { a1 = Math.sin(ph) * 0.8; a2 = a1 - Math.max(0, Math.cos(ph)) * 1.1; }
    else { a1 = i ? 0.3 : -0.25; a2 = a1 * 0.4; }
    limb(0, hy, a1, 19, a2, 19);
  }
  c.beginPath();
  c.moveTo(0, hy);
  c.lineTo(nx, ny);
  c.stroke();
  const hx = nx + Math.sin(lean) * 12;
  const hyy = ny - Math.cos(lean) * 13;
  c.beginPath();
  c.arc(hx, hyy, 11, 0, 6.3);
  c.fillStyle = o.head;
  c.fill();
  c.stroke();
  c.fillStyle = o.col;
  const shx = nx * 0.92;
  const shy = ny + 6;
  const ba = o.zombie ? 0.1 : run ? Math.sin(o.ph + Math.PI) * 0.9 + 0.1 : 0.25;
  c.beginPath();
  c.moveTo(shx, shy);
  if (o.zombie) c.lineTo(shx + Math.cos(ba) * 24, shy + Math.sin(ba) * 24);
  else c.lineTo(shx + Math.sin(ba) * 24, shy + Math.cos(ba) * 24);
  c.stroke();
  let sa: number;
  if (o.zombie) sa = o.windup ? -1.2 : 0.05;
  else if (o.atk) {
    const e = ease(clamp(o.atk.p, 0, 1));
    sa = o.atk.step === 1 ? lerp(-2.4, 0.9, e) : o.atk.step === 2 ? lerp(1.0, -2.2, e) : lerp(-3.3, 3.0, e);
  } else if (sit) sa = -1.5;
  else sa = o.air ? 0.1 : run ? 0.55 : 0.85 + Math.sin(o.idle * 2.2) * 0.04;
  const len = o.zombie ? 26 : 20;
  const hxn = shx + Math.cos(sa) * len;
  const hyn = shy + Math.sin(sa) * len;
  c.beginPath();
  c.moveTo(shx, shy);
  c.lineTo(hxn, hyn);
  c.stroke();
  let tip: [number, number] | null = null;
  if (o.sword) {
    const bx0 = hxn + Math.cos(sa) * 6;
    const by0 = hyn + Math.sin(sa) * 6;
    const tx = hxn + Math.cos(sa) * 62;
    const ty = hyn + Math.sin(sa) * 62;
    c.lineWidth = 7;
    c.strokeStyle = o.col;
    c.beginPath(); c.moveTo(bx0, by0); c.lineTo(tx, ty); c.stroke();
    c.lineWidth = 3;
    c.strokeStyle = css(P.night > 0.5 ? P.paper : [255, 255, 255]);
    c.beginPath(); c.moveTo(bx0 + Math.cos(sa) * 4, by0 + Math.sin(sa) * 4); c.lineTo(tx - Math.cos(sa) * 3, ty - Math.sin(sa) * 3); c.stroke();
    c.lineWidth = 5;
    c.strokeStyle = RED;
    c.beginPath(); c.moveTo(hxn - Math.sin(sa) * 7, hyn + Math.cos(sa) * 7); c.lineTo(hxn + Math.sin(sa) * 7, hyn - Math.cos(sa) * 7); c.stroke();
    c.lineWidth = 3;
    c.beginPath(); c.moveTo(hxn - Math.cos(sa) * 4, hyn - Math.sin(sa) * 4);
    c.quadraticCurveTo(hxn - Math.cos(sa) * 14, hyn - Math.sin(sa) * 14 + 10, hxn - Math.cos(sa) * 18, hyn - Math.sin(sa) * 18 + 20); c.stroke();
    tip = [o.x + o.face * sc * tx, o.y + sc * ty];
  }
  if (o.headband) {
    c.strokeStyle = RED;
    c.lineWidth = 4.5;
    c.beginPath(); c.arc(hx, hyy, 11, Math.PI * 1.12, Math.PI * 1.9); c.stroke();
  }
  c.restore();
  return tip;
}

/** Sword-tip position for a given swing, matching fig()'s geometry for a standing hero. */
function tipOf(step: number, p: number, px: number, py: number): [number, number] {
  const e = ease(clamp(p, 0, 1));
  const sa = step === 1 ? lerp(-2.4, 0.9, e) : step === 2 ? lerp(1.0, -2.2, e) : lerp(-3.3, 3.0, e);
  const lean = 0.04;
  const nx = Math.sin(lean) * 30;
  const ny = -38 - Math.cos(lean) * 30;
  const shx = nx * 0.92;
  const shy = ny + 6;
  const hx = shx + Math.cos(sa) * 20;
  const hy = shy + Math.sin(sa) * 20;
  return [px + hx + Math.cos(sa) * 62, py + hy + Math.sin(sa) * 62];
}

/* ---------- foes ---------- */
function foeKnock(f: Foe, tau: number, eps: number): number {
  let k = 0;
  for (const h of f.hits) {
    if (h.t <= tau) {
      const age = Math.max(0, eps - h.eps);
      k += (h.step === 3 ? 34 : 18) * (1 - Math.exp(-age * 9));
    }
  }
  return k;
}
function foeAlive(f: Foe, tau: number) {
  const last = f.hits[f.hits.length - 1];
  return tau >= f.spawn && (!last || tau < last.t + 0.001);
}
function hitFlash(f: Foe, tau: number, eps: number) {
  for (const h of f.hits) if (h.t <= tau && eps - h.eps < 0.1) return true;
  return false;
}
function label(c: CanvasRenderingContext2D, x: number, y: number, text: string, P: Pal) {
  c.font = '700 11px "JetBrains Mono",monospace';
  const w = c.measureText(text).width + 10;
  c.fillStyle = css(P.ink);
  c.fillRect(x - w / 2, y - 12, w, 16);
  c.fillStyle = css(P.paper);
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(text, x, y - 4);
  c.textAlign = 'left';
}
function drawFoe(c: CanvasRenderingContext2D, f: Foe, tau: number, eps: number, P: Pal, px: number) {
  if (!foeAlive(f, tau)) return;
  const ageSp = tau - f.spawn;
  const alpha = clamp(ageSp / 0.4, 0, 1);
  const x = f.x + foeKnock(f, tau, eps) + (ageSp < 0.4 ? (Math.random() < 0.3 ? fr(tau * 99) * 6 - 3 : 0) : 0);
  const flash = hitFlash(f, tau, eps);
  const face: 1 | -1 = px >= x ? 1 : -1;
  const ink = flash ? '#ffffff' : css(P.ink);
  c.save();
  c.globalAlpha = alpha;
  if (f.kind === 'walk' && f.look) {
    const o: FigOpts = { x, y: GY, face, ph: tau * 5, air: false, run: false, idle: tau + f.x, zombie: true, windup: false, col: ink, w: 6, head: flash ? '#fff' : css(P.paper) };
    const body = () => {
      if (!flash) {
        c.globalCompositeOperation = P.night > 0.5 ? 'lighter' : 'multiply';
        fig(c, { ...o, x: x - 4, col: 'rgba(0,200,230,.85)' }, P);
        fig(c, { ...o, x: x + 4, col: 'rgba(255,42,64,.85)' }, P);
        c.globalCompositeOperation = 'source-over';
      }
      fig(c, o, P);
      c.fillStyle = RED;
      c.fillRect(x + face * 4, GY - 84, 4, 4);
    };
    drawMini(c, f, tau, P, flash, px, body);
    label(c, x, foeCenter(f)[1] - (f.look === 'wall' ? 80 : f.look === 'guard' ? 76 : 70), f.label, P);
  } else if (f.kind === 'walk') {
    const o: FigOpts = { x, y: GY, face, ph: tau * 5, air: false, run: false, idle: tau + f.x, zombie: true, windup: false, col: ink, w: 6, head: flash ? '#fff' : css(P.paper) };
    if (!flash) {
      c.globalCompositeOperation = P.night > 0.5 ? 'lighter' : 'multiply';
      fig(c, { ...o, x: x - 4, col: 'rgba(0,200,230,.85)' }, P);
      fig(c, { ...o, x: x + 4, col: 'rgba(255,42,64,.85)' }, P);
      c.globalCompositeOperation = 'source-over';
    }
    fig(c, o, P);
    c.fillStyle = RED;
    c.fillRect(x + face * 4, GY - 84, 4, 4);
    label(c, x, GY - 100, f.label, P);
  } else if (f.kind === 'fly') {
    const bob = Math.sin(tau * 3 + f.x) * 12;
    const y = GY - f.lift + bob;
    c.translate(x, y);
    c.rotate(tau * 2);
    const r = 16 + Math.sin(tau * 8) * 1.5;
    for (let s = 0; s < 8; s++) {
      c.save();
      c.rotate((s * Math.PI) / 4);
      c.fillStyle = ink;
      c.beginPath(); c.moveTo(r - 2, -5); c.lineTo(r + 14, 0); c.lineTo(r - 2, 5); c.fill();
      c.restore();
    }
    c.fillStyle = ink;
    c.beginPath(); c.arc(0, 0, r, 0, 6.3); c.fill();
    c.rotate(-tau * 2);
    c.fillStyle = RED;
    c.fillRect(-7, -4, 5, 5); c.fillRect(3, -4, 5, 5);
    c.restore();
    c.save();
    label(c, x, y - 36, f.label, P);
    c.restore();
    return;
  } else if (f.kind === 'flame') {
    c.restore();
    drawTransformer(c, f, tau, eps, P, flash);
    return;
  } else if (f.kind === 'sanctum') {
    c.restore();
    drawOnionKeeper(c, f, tau, eps, P, flash);
    return;
  } else if (f.kind === 'hum') {
    c.restore();
    drawHumBoss(c, f, tau, eps, P, flash);
    return;
  }
  c.restore();
}

/* ---------- projectiles ---------- */
function drawProjs(c: CanvasRenderingContext2D, tau: number, P: Pal) {
  for (const p of SCRIPT.projs) {
    if (tau < p.t0 || tau > p.t1 + 0.02) continue;
    const u = clamp((tau - p.t0) / (p.t1 - p.t0), 0, 1);
    const x = lerp(p.x0, p.x1, u);
    if (p.kind === 'wave') {
      const y = GY - 24;
      c.save();
      c.translate(x, y);
      for (let k = 0; k < 3; k++) {
        c.strokeStyle = k === 0 ? FIRE : k === 1 ? RED : css(P.ink);
        c.lineWidth = 14 - k * 4;
        c.lineCap = 'round';
        c.beginPath(); c.arc(30 + k * 6, 0, 36 + k * 4, Math.PI * 0.62, Math.PI * 1.38); c.stroke();
      }
      flames(c, 0, 4, 0.8, tau, 21);
      c.restore();
      // telegraph
      if (tau - p.t0 < 0.4) {
        c.font = '400 54px Bangers,Impact,sans-serif';
        c.textAlign = 'center';
        c.lineWidth = 6;
        c.strokeStyle = css(P.ink);
        c.fillStyle = RED;
        c.strokeText('!', p.x0 + 20, GY - 190);
        c.fillText('!', p.x0 + 20, GY - 190);
        c.textAlign = 'left';
      }
    } else if (p.kind === 'sound') {
      const y = GY - 40;
      c.save();
      c.translate(x, y);
      c.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        c.strokeStyle = k === 0 ? '#ff7aa8' : k === 1 ? '#e0245e' : css(P.ink);
        c.lineWidth = 9 - k * 2.5;
        c.beginPath(); c.arc(30 + k * 6, 0, 22 + k * 14, Math.PI - 0.95, Math.PI + 0.95); c.stroke();
      }
      c.fillStyle = '#e0245e'; c.font = '400 34px sans-serif'; c.fillText('♪', -34, 10);
      c.restore();
      if (tau - p.t0 < 0.4) {
        c.font = '400 54px Bangers,Impact,sans-serif'; c.textAlign = 'center'; c.lineWidth = 6;
        c.strokeStyle = css(P.ink); c.fillStyle = '#e0245e';
        c.strokeText('!', p.x0 + 10, GY - 210); c.fillText('!', p.x0 + 10, GY - 210); c.textAlign = 'left';
      }
    } else {
      const y = GY - 62 - Math.sin(u * Math.PI) * 60;
      const col = '#3ef2d0';
      c.save();
      c.translate(x, y);
      c.strokeStyle = col;
      c.lineWidth = 2;
      c.setLineDash([4, 5]);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(46, 12); c.stroke();
      c.setLineDash([]);
      c.fillStyle = css(P.paper);
      c.strokeStyle = col;
      c.lineWidth = 4;
      c.beginPath(); c.arc(0, 0, 14, 0, 6.3); c.fill(); c.stroke();
      c.rotate(tau * 6);
      c.fillStyle = col;
      c.fillRect(-4, -4, 8, 8);
      c.restore();
    }
  }
}

/* ---------- background ---------- */
function drawBG(c: CanvasRenderingContext2D, camX: number, tau: number, P: Pal) {
  c.fillStyle = css(P.paper);
  c.fillRect(0, 0, W, H);
  patterns();
  c.globalAlpha = P.night > 0.5 ? 0.4 : 1;
  c.fillStyle = c.createPattern(grainPat!, 'repeat')!;
  c.fillRect(0, 0, W, H);
  c.globalAlpha = 1;
  const dawn = dawnAmt(tau);
  const sx = 650 - camX * 0.05;
  const sy = 190 - dawn * 0;
  const R = 128;
  c.fillStyle = css(P.sun);
  c.beginPath(); c.arc(sx, sy, R, 0, 6.3); c.fill();
  c.strokeStyle = css(P.ink);
  c.lineWidth = 5;
  c.stroke();
  c.save();
  c.beginPath(); c.arc(sx, sy, R, 0, 6.3); c.clip();
  c.globalAlpha = 0.5;
  c.fillStyle = c.createPattern(dotPat!, 'repeat')!;
  c.fillRect(sx - R, sy - 18, R * 2, R + 20);
  if (P.night > 0.5) {
    // moon craters
    c.globalAlpha = 0.18;
    c.fillStyle = css(P.paper);
    for (const [cx, cy, r] of [[-40, -30, 22], [34, 20, 30], [-10, 52, 14], [46, -50, 12]]) { c.beginPath(); c.arc(sx + cx, sy + cy, r, 0, 6.3); c.fill(); }
  }
  c.restore();
  c.globalAlpha = 1;
  c.fillStyle = css(P.ink, 0.09);
  c.font = '400 150px "Ma Shan Zheng",cursive';
  c.textBaseline = 'top';
  c.fillText('江', sx - 350, 40);
  c.fillText('湖', sx - 350, 190);
  const drawR = (pts: [number, number][], f: number, fill: RGB, alphaLine: number) => {
    c.beginPath();
    c.moveTo(pts[0][0] - camX * f, H);
    for (const [x, y] of pts) c.lineTo(x - camX * f, y);
    c.lineTo(pts[pts.length - 1][0] - camX * f, H);
    c.closePath();
    c.fillStyle = css(fill);
    c.fill();
    c.strokeStyle = css(P.ink, alphaLine);
    c.lineWidth = 3;
    c.stroke();
  };
  drawR(farR, 0.14, P.far, 0.55);
  const g = c.createLinearGradient(0, GY - 210, 0, GY);
  g.addColorStop(0, css(P.paper, 0));
  g.addColorStop(1, css(P.paper, 0.9));
  c.fillStyle = g;
  c.fillRect(0, GY - 210, W, 210);
  drawR(midR, 0.3, P.mid, 0.7);
  c.globalAlpha = 0.28;
  c.fillStyle = c.createPattern(dotPat!, 'repeat')!;
  c.fillRect(0, GY - 120, W, 120);
  c.globalAlpha = 1;
  c.strokeStyle = css(P.ink, 0.5);
  c.lineCap = 'round';
  for (const b of bamboo) {
    const bx = b.x - camX * 0.62;
    if (bx < -60 || bx > W + 60) continue;
    c.lineWidth = b.w;
    c.beginPath(); c.moveTo(bx, GY + 6); c.quadraticCurveTo(bx + b.sw * 0.4, GY - b.h * 0.5, bx + b.sw, GY - b.h); c.stroke();
    c.lineWidth = 2;
    for (let n = 1; n < 5; n++) {
      const yy = GY - (b.h * n) / 5;
      const xx = bx + b.sw * (n / 5) * (n / 5);
      c.beginPath(); c.moveTo(xx - b.w * 0.8, yy); c.lineTo(xx + b.w * 0.8, yy); c.stroke();
    }
    c.lineWidth = 3;
    for (let l = 0; l < 3; l++) { c.beginPath(); c.moveTo(bx + b.sw, GY - b.h + l * 22); c.lineTo(bx + b.sw + (l % 2 ? -1 : 1) * (34 - l * 6), GY - b.h + l * 22 - 14); c.stroke(); }
  }
  c.fillStyle = css(P.ground);
  c.fillRect(0, GY, W, H - GY);
  c.globalAlpha = 0.3;
  c.fillStyle = c.createPattern(dotPat!, 'repeat')!;
  c.fillRect(0, GY + 8, W, H - GY);
  c.globalAlpha = 1;
  c.strokeStyle = css(P.ink);
  c.lineWidth = 6;
  c.beginPath();
  for (let x = 0; x <= W + 8; x += 8) {
    const wx = Math.floor((x + camX) / 8);
    const yy = GY + ((wx * 37) % 7) * 0.5;
    if (x === 0) c.moveTo(x, yy); else c.lineTo(x, yy);
  }
  c.stroke();
  c.lineWidth = 2;
  for (const t of tufts) {
    const tx = t.x - camX;
    if (tx < -20 || tx > W + 20) continue;
    for (let n = 0; n < t.n; n++) { c.beginPath(); c.moveTo(tx + n * 5, GY + 2); c.lineTo(tx + n * 5 + (n - 1) * 5, GY - t.h); c.stroke(); }
  }
  c.strokeStyle = css(P.ink, 0.45);
  for (let h = 0; h < W; h += 26) {
    const w2 = Math.floor((h + camX) / 26);
    if ((w2 * 13) % 5 < 2) continue;
    c.beginPath(); c.moveTo(h, GY + 14); c.lineTo(h - 12, GY + 40); c.stroke();
  }
}

function brushText(c: CanvasRenderingContext2D, txt: string, x: number, y: number, size: number, P: Pal) {
  c.font = `400 ${size}px "Ma Shan Zheng",cursive`;
  c.textBaseline = 'alphabetic';
  c.fillStyle = RED;
  c.fillText(txt, x + 7, y + 7);
  c.lineWidth = size * 0.06;
  c.strokeStyle = css(P.ink);
  c.lineJoin = 'round';
  c.strokeText(txt, x, y);
  c.fillStyle = css(P.paper);
  c.fillText(txt, x, y);
}

function drawGate(c: CanvasRenderingContext2D, gx: number, name: string, zh: string, glow: number, P: Pal) {
  c.save();
  c.translate(gx, GY);
  c.fillStyle = RED;
  c.strokeStyle = css(P.ink);
  c.lineWidth = 5;
  c.fillRect(-92, -200, 20, 200); c.strokeRect(-92, -200, 20, 200);
  c.fillRect(72, -200, 20, 200); c.strokeRect(72, -200, 20, 200);
  c.fillStyle = css(P.ink);
  c.fillRect(-120, -218, 240, 16);
  c.fillRect(-98, -170, 196, 12);
  c.beginPath();
  c.moveTo(-150, -212); c.quadraticCurveTo(-100, -208, -80, -248); c.lineTo(80, -248); c.quadraticCurveTo(100, -208, 150, -212); c.lineTo(120, -200); c.lineTo(-120, -200);
  c.closePath(); c.fill();
  c.fillStyle = css(P.paper);
  c.fillRect(-72, -166, 144, 44); c.strokeRect(-72, -166, 144, 44);
  c.fillStyle = css(P.ink);
  c.font = '400 32px "Ma Shan Zheng",cursive';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(`${zh} ${name}`, 0, -143);
  c.textAlign = 'left';
  const gg = c.createRadialGradient(0, -80, 10, 0, -80, 90);
  gg.addColorStop(0, `rgba(214,42,30,${0.35 + glow * 0.5})`);
  gg.addColorStop(1, 'rgba(214,42,30,0)');
  c.fillStyle = gg;
  c.fillRect(-90, -160, 180, 160);
  c.restore();
}

function drawCamp(c: CanvasRenderingContext2D, x: number, tau: number, P: Pal) {
  c.save();
  c.translate(x, GY);
  const glow = c.createRadialGradient(0, -20, 6, 0, -20, 170);
  glow.addColorStop(0, 'rgba(255,138,31,.55)');
  glow.addColorStop(1, 'rgba(255,138,31,0)');
  c.fillStyle = glow;
  c.fillRect(-170, -190, 340, 200);
  c.strokeStyle = css(P.ink);
  c.lineWidth = 7;
  c.lineCap = 'round';
  c.beginPath(); c.moveTo(-26, 2); c.lineTo(22, -10); c.moveTo(26, 2); c.lineTo(-22, -10); c.stroke();
  flames(c, 0, -8, 1.5, tau, 5);
  c.restore();
}

function drawShrine(c: CanvasRenderingContext2D, x: number, tau: number, dawn: number, P: Pal) {
  c.save();
  c.translate(x, GY);
  c.strokeStyle = css(P.ink);
  c.lineWidth = 5;
  c.fillStyle = RED;
  c.fillRect(-70, -170, 16, 170); c.strokeRect(-70, -170, 16, 170);
  c.fillRect(54, -170, 16, 170); c.strokeRect(54, -170, 16, 170);
  c.fillStyle = css(P.ink);
  c.beginPath(); c.moveTo(-96, -176); c.quadraticCurveTo(0, -150, 96, -176); c.lineTo(96, -158); c.quadraticCurveTo(0, -132, -96, -158); c.closePath(); c.fill();
  c.fillRect(-86, -138, 172, 10);
  // save crystal
  const bob = Math.sin(tau * 2) * 5;
  c.save();
  c.translate(0, -96 + bob);
  c.rotate(Math.PI / 4);
  c.fillStyle = GOLD;
  c.fillRect(-14, -14, 28, 28);
  c.lineWidth = 4;
  c.strokeRect(-14, -14, 28, 28);
  c.restore();
  c.fillStyle = `rgba(224,168,46,${0.25 + dawn * 0.2})`;
  c.beginPath(); c.arc(0, -96 + bob, 44 + Math.sin(tau * 3) * 4, 0, 6.3); c.fill();
  // lantern
  c.fillStyle = css(P.ink);
  c.fillRect(-150, -40, 20, 40); c.fillRect(-160, -64, 40, 24);
  c.fillStyle = FIRE;
  c.fillRect(-146, -58, 12, 12);
  c.restore();
}

function drawWorld(c: CanvasRenderingContext2D, camX: number, tau: number, P: Pal, narrow = false) {
  const tx = 70 - camX;
  if (tx > -900 && tx < W + 50) {
    const ts = narrow ? 128 : 210;
    brushText(c, 'TEJAS', tx, GY - (narrow ? 176 : 222), ts, P);
    c.save();
    c.translate(tx + 8, GY - (narrow ? 152 : 196));
    c.transform(1, 0, -0.25, 1, 0, 0);
    c.fillStyle = css(P.ink);
    c.fillRect(0, 0, narrow ? 312 : 470, narrow ? 34 : 44);
    c.fillStyle = css(P.paper);
    c.font = `400 ${narrow ? 19 : 29}px Bangers,Impact,sans-serif`;
    c.textBaseline = 'middle';
    c.fillText('GOWDA S  ·  JUNIOR AI ENGINEER', 12, narrow ? 18 : 23);
    c.restore();
    c.fillStyle = css(P.ink);
    c.font = `400 ${narrow ? 24 : 34}px "Ma Shan Zheng",cursive`;
    c.textBaseline = 'alphabetic';
    c.fillText('Wanderer of Code', tx + 10, GY - (narrow ? 90 : 98));
  }
  for (const g of SCRIPT.gates) {
    if (g.x - camX < -220 || g.x - camX > W + 220) continue;
    const near = clamp(1 - Math.abs(playerX(tau) - g.x) / 260, 0, 1);
    drawGate(c, g.x, g.name, g.zh, near, P);
  }
  if (SCRIPT.campX - camX > -250 && SCRIPT.campX - camX < W + 250) drawCamp(c, SCRIPT.campX, tau, P);
  if (SCRIPT.shrineX - camX > -250 && SCRIPT.shrineX - camX < W + 250) drawShrine(c, SCRIPT.shrineX, tau, dawnAmt(tau), P);
}

/* ---------- effects ---------- */
const POPS = ['ZAN!', 'SLASH!', 'KIII!', 'SHING!'];
function popFor(h: Hit): { text: string; size: number; col: string } {
  if (h.fx === 'final') return { text: 'KO!', size: 112, col: RED };
  if (h.fx === 'clang') return { text: 'CLANG!', size: 74, col: GOLD };
  if (h.fx === 'break') return { text: 'CRACK!', size: 88, col: RED };
  if (h.fx === 'impact') return { text: 'ZAAAN!', size: 100, col: RED };
  return { text: POPS[h.id % 4], size: h.step === 3 ? 90 : 66, col: '#ffffff' };
}
function foeOf(h: Hit): Foe | undefined {
  return SCRIPT.foes.find((f) => f.hits.includes(h));
}
function drawHitFx(c: CanvasRenderingContext2D, eps: number, P: Pal) {
  for (const h of HITS) {
    const age = eps - h.eps;
    if (age < 0 || age > 1.0) continue;
    const f = foeOf(h);
    if (!f) continue;
    const [cx0, oy] = foeCenter(f);
    const ox = cx0 + (h.step === 3 ? 20 : 8);
    // speed lines
    if (age < 0.22) {
      const u = age / 0.22;
      c.strokeStyle = css(P.ink);
      for (let n = 0; n < 18; n++) {
        const a = (n / 18) * 6.28 + u * 2;
        const r0 = 30 + u * 180;
        const r1 = r0 + 90 * (1 - u);
        c.lineWidth = 2 + (1 - u) * 3;
        c.beginPath(); c.moveTo(ox + Math.cos(a) * r0, oy + Math.sin(a) * r0); c.lineTo(ox + Math.cos(a) * r1, oy + Math.sin(a) * r1); c.stroke();
      }
    }
    // shards
    const n = h.fx === 'final' ? 34 : h.step === 3 ? 18 : 9;
    for (let i = 0; i < n; i++) {
      const a = fr(h.id * 7.1 + i) * 6.28;
      const sp = 120 + fr(h.id * 3.3 + i * 1.7) * 480;
      const px = ox + Math.cos(a) * sp * age;
      const py = oy + Math.sin(a) * sp * age - 140 * age + 900 * age * age * 0.5;
      const s = 4 + fr(i + h.id) * 8;
      const col = fr(i * 2 + h.id) < 0.3 ? '#00d8ff' : fr(i * 3 + h.id) < 0.5 ? RED : css(P.ink);
      c.save();
      c.translate(px, py);
      c.rotate(i + age * 8);
      c.globalAlpha = clamp(1 - age / 0.9, 0, 1);
      c.fillStyle = col;
      c.fillRect(-s / 2, -s / 2, s, s * 0.6);
      c.restore();
    }
  }
  c.globalAlpha = 1;
}
function drawPops(c: CanvasRenderingContext2D, eps: number, P: Pal) {
  for (const h of HITS) {
    const age = eps - h.eps;
    if (age < 0 || age > 0.7) continue;
    const f = foeOf(h);
    if (!f) continue;
    const { text, size, col } = popFor(h);
    const sx = f.x + 6;
    const sy = foeCenter(f)[1] - 70 * Math.max(1, f.scale * 0.8);
    const sca = age < 0.1 ? 1.5 - age * 5 : 1 + (age - 0.1) * 0.15;
    c.save();
    c.translate(sx, sy - age * 26);
    c.rotate((fr(h.id) - 0.5) * 0.5);
    c.scale(sca, sca);
    c.globalAlpha = age > 0.5 ? (0.7 - age) * 5 : 1;
    c.font = `400 ${size}px Bangers,Impact,sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.lineJoin = 'round';
    c.lineWidth = size * 0.14;
    c.strokeStyle = css(P.ink);
    c.strokeText(text, 0, 0);
    c.fillStyle = col;
    c.fillText(text, 0, 0);
    c.restore();
  }
  // skill pickups
  for (const u of SCRIPT.unlocks) {
    const h = HITS.find((x) => x.t === u.t);
    if (!h) continue;
    const age = eps - h.eps;
    if (age < 0.2 || age > 1.4) continue;
    const f = foeOf(h);
    if (!f) continue;
    const k = age - 0.2;
    c.save();
    c.globalAlpha = k > 0.9 ? (1.2 - k) * 3 : 1;
    c.font = '400 40px Bangers,Impact,sans-serif';
    c.textAlign = 'center';
    c.lineWidth = 6;
    c.strokeStyle = css(P.ink);
    c.fillStyle = GOLD;
    c.strokeText(`+ ${u.skill}`, f.x + 40, foeCenter(f)[1] - 150 - k * 40);
    c.fillText(`+ ${u.skill}`, f.x + 40, foeCenter(f)[1] - 150 - k * 40);
    c.restore();
  }
  c.textAlign = 'left';
}

/* ---------- boss bar (HUD) ---------- */
function drawBossBar(c: CanvasRenderingContext2D, tau: number, P: Pal, vw: number) {
  const boss = SCRIPT.foes.find((f) => (f.kind === 'flame' || f.kind === 'sanctum' || f.kind === 'hum') && tau >= f.spawn && tau <= f.hits[f.hits.length - 1].t + 0.9);
  if (!boss) return;
  const total = boss.hits.length;
  const done = boss.hits.filter((h) => h.t <= tau).length;
  const remainingHits = total - done;
  const w = Math.min(500, vw - 40);
  const x = (vw - w) / 2;
  const y = 16;
  c.save();
  c.globalAlpha = clamp((tau - boss.spawn) / 0.5, 0, 1);
  c.fillStyle = css(P.ink);
  c.fillRect(x - 10, y - 4, w + 20, 62);
  c.font = '400 26px Bangers,Impact,sans-serif';
  c.fillStyle = css(P.paper);
  c.textBaseline = 'top';
  c.fillText(`BOSS · ${boss.label}`, x, y);
  const segs = boss.stack?.length ?? 4;
  const per = total / segs;
  const gap = 5;
  const sw = (w - gap * (segs - 1)) / segs;
  for (let i = 0; i < segs; i++) {
    const sx = x + i * (sw + gap);
    const rem = clamp((remainingHits - i * per) / per, 0, 1);
    c.fillStyle = 'rgba(140,140,140,.35)';
    c.fillRect(sx, y + 32, sw, 18);
    c.fillStyle = RED;
    c.fillRect(sx, y + 32, sw * rem, 18);
    c.font = '700 10px "JetBrains Mono",monospace';
    c.fillStyle = css(P.paper);
    c.fillText(boss.stack ? boss.stack[i] : '', sx + 4, y + 36);
  }
  c.restore();
}

/* ---------- main ---------- */
export type FrameInfo = { glitch: number; tau: number; eps: number };

export type View = { vw: number };
export const LANDSCAPE: View = { vw: W };
export const PORTRAIT: View = { vw: 480 };

export function renderFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, eps: number, scale: number, ambT = 0, view: View = LANDSCAPE): FrameInfo {
  amb.t = ambT;
  const VW = view.vw;
  const narrow = VW < 800;
  const tau = toTau(eps);
  const P = palette(nightAmt(tau));
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  // anime impact frame
  for (const h of HITS) {
    const age = eps - h.eps;
    if ((h.fx === 'final' || h.fx === 'impact') && age >= 0 && age < 0.1) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, VW, H);
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.moveTo(-50, H * 0.72); ctx.lineTo(VW + 50, H * 0.2); ctx.lineTo(VW + 50, H * 0.28); ctx.lineTo(-50, H * 0.82); ctx.fill();
      for (let i = 0; i < 26; i++) {
        const a = fr(i * 3.1 + h.id) * 6.28;
        const l = 300 + fr(i * 7.7) * 600;
        ctx.lineWidth = 1 + fr(i * 1.3) * 4;
        ctx.strokeStyle = '#000';
        ctx.beginPath(); ctx.moveTo(VW / 2 + Math.cos(a) * 180, H / 2 + Math.sin(a) * 120); ctx.lineTo(VW / 2 + Math.cos(a) * l, H / 2 + Math.sin(a) * l); ctx.stroke();
      }
      ctx.save();
      ctx.translate(VW / 2, H / 2);
      ctx.rotate(-0.32);
      ctx.fillStyle = RED;
      ctx.fillRect(-W, -5, W * 2, 10);
      ctx.restore();
      return { glitch: 1, tau, eps };
    }
  }

  const px = playerX(tau);
  const pxLag = playerX(Math.max(0, tau - 0.25));
  // portrait: start with the title in frame, then settle the hero toward the left third
  const heroSx = narrow ? lerp(300, 150, clamp((pxLag - 300) / 320, 0, 1)) : PLAYER_SX;
  const camX = pxLag - heroSx;

  // shake + glitch from recent hits
  let shake = 0;
  let glitch = 0;
  for (const h of HITS) {
    const age = eps - h.eps;
    if (age >= 0 && age < 0.3) {
      const amp = h.fx === 'final' ? 20 : h.step === 3 || h.fx === 'impact' ? 14 : 7;
      shake = Math.max(shake, amp * (1 - age / 0.3));
      if (age < 0.18) glitch = Math.max(glitch, 1 - age / 0.18);
    }
  }
  const frameN = Math.floor(eps * 60);
  const sx = (fr(frameN * 1.1) - 0.5) * 2 * shake;
  const sy = (fr(frameN * 2.3) - 0.5) * 1.2 * shake;

  ctx.save();
  ctx.translate(sx, sy);
  const zoom = zoomPunch(eps);
  if (zoom > 0) {
    ctx.translate(VW / 2, H / 2);
    ctx.scale(1 + zoom, 1 + zoom);
    ctx.translate(-VW / 2, -H / 2);
  }
  drawBG(ctx, camX, tau, P);
  ctx.save();
  ctx.translate(-camX, 0);
  drawWorld(ctx, camX, tau, P, narrow);
  drawProjs(ctx, tau, P);
  for (const f of SCRIPT.foes) drawFoe(ctx, f, tau, eps, P, px);

  // run dust
  const spd = playerSpeed(tau);
  for (let k = 0; k < 5; k++) {
    const ts = Math.floor(tau / 0.11) * 0.11 - k * 0.11;
    if (ts < 0 || Math.abs(playerSpeed(ts)) < 120) continue;
    const age = tau - ts;
    ctx.fillStyle = css(P.ink, (1 - age / 0.55) * 0.3);
    ctx.beginPath();
    ctx.arc(playerX(ts) - 10, GY - age * 18, 3 + age * 9, 0, 6.3);
    ctx.fill();
  }

  // scarf
  const sit = sitting(tau);
  const jy = jumpY(tau);
  const atk = slashAt(tau);
  const running = Math.abs(spd) > 40 && jy === 0 && !sit;
  const py = GY + jy;
  const headX = px - 9;
  const headY = py - (sit ? 44 : jy < 0 ? 82 : 80);
  ctx.strokeStyle = RED;
  ctx.lineCap = 'round';
  let lx = headX;
  let ly = headY;
  for (let j = 1; j < 7; j++) {
    const back = running ? 14 : 8;
    const nxp = lx - back * (0.9 + 0.1 * Math.sin(tau * 9 + j));
    const nyp = ly + 3 + Math.sin(tau * 9 + j * 1.3) * 3.5 + (running ? 0 : j * 1.4);
    ctx.lineWidth = Math.max(1.5, 5 - j * 0.55);
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(nxp, nyp); ctx.stroke();
    lx = nxp; ly = nyp;
  }

  // slash trail (replayed from the sword path)
  const trailPts: [number, number][] = [];
  if (atk) {
    for (let k = 0; k <= 10; k++) {
      const p = clamp(atk.p - (10 - k) * 0.04, 0, 1);
      trailPts.push(tipOf(atk.step, p, px, py));
    }
    for (let pass = 0; pass < 2; pass++) {
      ctx.beginPath();
      trailPts.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])));
      ctx.strokeStyle = pass ? (P.night > 0.5 ? css(P.paper) : '#ffffff') : css(P.ink);
      ctx.lineWidth = pass ? 7 : 13;
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.9;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // dash afterimages: blue and crimson ghosts trail the hero during fast runs
  for (let k = 4; k >= 1; k--) {
    const ts = tau - 0.05 * k;
    if (ts < 0 || playerSpeed(ts) < 420) continue;
    ctx.save();
    ctx.globalAlpha = 0.5 - k * 0.1;
    if (P.night > 0.4) ctx.globalCompositeOperation = 'lighter';
    fig(ctx, { x: playerX(ts), y: GY, face: 1, ph: playerX(ts) / 26, air: false, run: true, idle: ts, sword: true, col: k % 2 ? '#3a8dff' : '#ff3b5c', w: 6.5, head: 'rgba(0,0,0,0)' }, P);
    ctx.restore();
  }
  fig(ctx, {
    x: px, y: py, face: 1, ph: px / 26, air: jy < 0, run: running, idle: tau + amb.t,
    atk, sword: true, headband: true, sit, col: css(P.ink), w: 6.5, head: css(P.paper),
  }, P);
  drawHitFx(ctx, eps, P);
  drawHitExtras(ctx, eps, P);
  drawSpecials(ctx, eps, tau, P, px, py);
  drawLights(ctx, eps, tau, P, trailPts, atk ? (atk.step === 1 ? '#ffc94a' : atk.step === 2 ? '#7fdcff' : '#ff6ab8') : '#ffffff');
  ctx.restore();
  ctx.restore();

  // foreground speed streaks while the hero dashes
  if (Math.abs(spd) > 360) {
    const k = clamp((Math.abs(spd) - 360) / 260, 0, 1);
    ctx.save();
    ctx.strokeStyle = css(P.ink, 0.35 * k);
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const yy = 60 + fr(i * 7.7) * (GY - 80);
      const len = 120 + fr(i * 3.3) * 260;
      const xx = ((fr(i * 1.9) * (W + len) - eps * 1500 * (0.6 + fr(i) * 0.8)) % (W + len) + (W + len)) % (W + len) - len;
      ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + len, yy); ctx.stroke();
    }
    ctx.restore();
  }

  // screentone vignette at the edges
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = ctx.createPattern(dotPat!, 'repeat')!;
  ctx.fillRect(0, 0, 70, H);
  ctx.fillRect(VW - 70, 0, 70, H);
  ctx.restore();

  ctx.save();
  ctx.translate(sx, sy);
  ctx.translate(-camX, 0);
  drawPops(ctx, eps, P);
  ctx.restore();
  drawBossBar(ctx, tau, P, VW);
  drawSpecialBanner(ctx, eps, P, VW);
  drawChapterCard(ctx, eps, P, VW);
  const fl = flashAmt(eps);
  if (fl > 0.01) {
    ctx.fillStyle = `rgba(255,255,255,${fl})`;
    ctx.fillRect(0, 0, VW, H);
  }

  // glitch slices
  if (glitch > 0.05) {
    for (let gi = 0; gi < 5; gi++) {
      const gy = fr(frameN + gi * 3.3) * (H - 40);
      const gh = 8 + fr(frameN * 1.9 + gi) * 28;
      const gdx = (fr(frameN * 2.7 + gi) - 0.5) * 60 * glitch;
      ctx.drawImage(canvas, 0, gy * scale, canvas.width, gh * scale, gdx * scale, gy * scale, canvas.width, gh * scale);
    }
  }
  return { glitch, tau, eps };
}
