import { GY, H, HITS, SCRIPT, W, toEps, type Hit } from './script';
import { foeCenter } from './bosses';
import { FIRE, GOLD, RED, TEAL, clamp, css, ease, fr, lerp, type C2, type Pal } from './util';

const SP_EPS = SCRIPT.specials.map((s) => toEps(s.t));
const CH_EPS = SCRIPT.chapters.map((c) => toEps(c.t));

/** Day scenes can't be brightened by additive light, so use saturated ink-style strokes instead. */
function glow(c: C2, P: Pal) {
  c.globalCompositeOperation = P.night > 0.4 ? 'lighter' : 'source-over';
}

/* ---------- special moves (world space) ---------- */
export function drawSpecials(c: C2, eps: number, tau: number, P: Pal, px: number, py: number) {
  SCRIPT.specials.forEach((s, i) => {
    const age = eps - SP_EPS[i];
    if (age < 0) return;
    c.save();
    glow(c, P);
    const gold = P.night > 0.4 ? 'rgba(255,224,150,' : 'rgba(224,168,46,';
    if (s.kind === 'whirl' && age < 0.7) {
      const u = age / 0.7;
      for (let k = 0; k < 4; k++) {
        c.strokeStyle = k === 0 ? `rgba(255,255,255,${1 - u})` : `${gold}${(1 - u) * 0.8})`;
        c.lineWidth = 12 - k * 2.5;
        c.shadowColor = '#ffd27a';
        c.shadowBlur = 24;
        c.beginPath();
        c.arc(px, py - 46, 40 + u * 190 + k * 20, k + u * 8, k + u * 8 + 2.4);
        c.stroke();
      }
      c.shadowBlur = 0;
      c.strokeStyle = css(P.ink, (1 - u) * 0.5);
      c.lineWidth = 4;
      c.beginPath(); c.ellipse(px, GY + 4, 30 + u * 220, 8 + u * 22, 0, 0, 6.3); c.stroke();
    } else if (s.kind === 'wave' && s.t1 !== undefined && s.to !== undefined) {
      const dur = (toEps(s.t1) - SP_EPS[i]);
      const u = age / dur;
      if (u >= 0 && u < 1.15) {
        const x = lerp(s.x, s.to, clamp(u, 0, 1));
        for (let k = 0; k < 7; k++) {
          const xx = x - k * 22;
          c.globalAlpha = (1 - k / 7) * clamp(1.15 - u, 0, 1);
          c.shadowColor = '#fff7c0';
          c.shadowBlur = 26;
          c.fillStyle = k === 0 ? '#ffffff' : k < 3 ? '#ffe88a' : '#ffbf3a';
          c.beginPath();
          c.arc(xx, GY - 64, 84, -1.15, 1.15);
          c.arc(xx - 30, GY - 64, 74, 1.1, -1.1, true);
          c.closePath();
          c.fill();
        }
      }
    } else if (s.kind === 'leap' && age < 0.9) {
      const u = age / 0.9;
      for (let k = 0; k < 16; k++) {
        const yy = py - 20 - u * 150 - k * 14;
        const aa = k * 0.7 + u * 10;
        c.fillStyle = `rgba(255,${(200 + k * 3) | 0},120,${(1 - k / 16) * (1 - u)})`;
        c.shadowColor = '#ffd27a';
        c.shadowBlur = 16;
        c.beginPath(); c.arc(px + Math.cos(aa) * (26 + k * 2), yy, 6 - k * 0.25, 0, 6.3); c.fill();
      }
    } else if (s.kind === 'thunder' && age < 0.55) {
      const tx = s.x;
      const flick = Math.floor(age * 40) % 3 !== 2;
      if (flick) {
        const [, cy] = [0, GY - 130];
        for (let b = 0; b < 3; b++) {
          const pts: [number, number][] = [];
          for (let k = 0; k <= 10; k++) {
            const t01 = k / 10;
            pts.push([tx + (b ? (b - 1.5) * 50 * t01 : 0) + (fr(k * 3.1 + b + Math.floor(age * 30)) - 0.5) * 46 * (1 - t01 * 0.4), lerp(-60, cy + (b ? 40 : 0), t01)]);
          }
          const passes: [number, string, number][] = [[b ? 8 : 18, 'rgba(90,200,255,.45)', 22], [b ? 3 : 7, 'rgba(210,240,255,.95)', 12], [b ? 1.5 : 3, '#ffffff', 0]];
          for (const [lw, col, sb] of passes) {
            c.strokeStyle = col; c.lineWidth = lw; c.shadowColor = '#7fdcff'; c.shadowBlur = sb;
            c.beginPath(); pts.forEach((p, k) => (k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke();
          }
        }
      }
      c.shadowBlur = 0;
      c.strokeStyle = `rgba(160,220,255,${1 - age / 0.55})`;
      c.lineWidth = 5;
      c.beginPath(); c.ellipse(tx, GY, 20 + age * 300, 6 + age * 40, 0, 0, 6.3); c.stroke();
    } else if ((s.kind === 'heaven' || s.kind === 'decrypt') && age < 1.3) {
      const tx = s.x;
      const teal = s.kind === 'decrypt';
      const core = teal ? '#baffee' : '#fff3c4';
      const mid = teal ? TEAL : '#ffc93a';
      const drop = ease(clamp(age / 0.38, 0, 1));
      const bladeY = lerp(-380, GY - 150, drop);
      const beamA = age < 0.38 ? 0.35 + age : clamp(1 - (age - 0.38) / 0.9, 0, 1);
      c.globalAlpha = beamA;
      const gr = c.createLinearGradient(tx - 80, 0, tx + 80, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, core); gr.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = gr;
      c.fillRect(tx - 80, -60, 160, GY + 60);
      c.shadowColor = mid; c.shadowBlur = 60;
      c.fillStyle = core;
      c.fillRect(tx - 14, -60, 28, bladeY + 60);
      c.globalAlpha = 1;
      if (age < 0.5) {
        // the giant blade (or key) falling out of the sky
        c.fillStyle = '#ffffff';
        c.strokeStyle = mid; c.lineWidth = 5;
        if (!teal) {
          c.beginPath(); c.moveTo(tx, bladeY + 190); c.lineTo(tx - 30, bladeY); c.lineTo(tx + 30, bladeY); c.closePath(); c.fill(); c.stroke();
          c.fillStyle = mid; c.fillRect(tx - 54, bladeY - 12, 108, 16);
        } else {
          c.beginPath(); c.arc(tx, bladeY - 20, 34, 0, 6.3); c.fill(); c.stroke();
          c.fillRect(tx - 9, bladeY + 12, 18, 150); c.strokeRect(tx - 9, bladeY + 12, 18, 150);
          c.fillRect(tx + 9, bladeY + 110, 26, 14); c.fillRect(tx + 9, bladeY + 136, 20, 14);
          c.fillStyle = '#0f0d0b'; c.beginPath(); c.arc(tx, bladeY - 20, 12, 0, 6.3); c.fill();
        }
      }
      if (teal) {
        c.shadowBlur = 0;
        c.font = '700 15px "JetBrains Mono",monospace';
        for (let k = 0; k < 40; k++) {
          const dx = (fr(k * 2.3) - 0.5) * 340;
          const yy = (age * 520 + fr(k * 4.7) * 400) % (GY + 40);
          c.fillStyle = `rgba(186,255,238,${clamp(1.1 - age, 0, 1)})`;
          c.fillText(fr(k + Math.floor(age * 14)) > 0.5 ? '1' : '0', tx + dx, yy);
        }
      }
      if (age > 0.36) {
        const u = (age - 0.36) / 0.9;
        c.shadowBlur = 0;
        for (let k = 0; k < 3; k++) {
          c.strokeStyle = k === 0 ? `rgba(255,255,255,${1 - u})` : `${teal ? 'rgba(62,242,208,' : 'rgba(255,200,60,'}${(1 - u) * 0.8})`;
          c.lineWidth = 8 - k * 2;
          c.beginPath(); c.ellipse(tx, GY + 2, 30 + u * (340 + k * 70), 8 + u * (50 + k * 12), 0, 0, 6.3); c.stroke();
        }
      }
    }
    c.restore();
  });
}

/* ---------- light: bloom, flashes, lens streaks, boss auras (world space) ---------- */
export function drawLights(c: C2, eps: number, tau: number, P: Pal, tip: [number, number][], stepCol: string) {
  c.save();
  glow(c, P);
  // sword light trail
  if (tip.length > 2) {
    c.shadowColor = stepCol;
    c.shadowBlur = 30;
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const [lw, col] of [[16, stepCol], [8, '#ffffff']] as [number, string][]) {
      c.strokeStyle = col; c.lineWidth = lw; c.globalAlpha = 0.85;
      c.beginPath(); tip.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke();
    }
    c.globalAlpha = 1;
    const end = tip[tip.length - 1];
    const rg = c.createRadialGradient(end[0], end[1], 0, end[0], end[1], 46);
    rg.addColorStop(0, 'rgba(255,255,255,.95)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = rg; c.shadowBlur = 0;
    c.beginPath(); c.arc(end[0], end[1], 46, 0, 6.3); c.fill();
  }
  // boss auras
  for (const f of SCRIPT.foes) {
    if ((f.kind !== 'flame' && f.kind !== 'sanctum') || tau < f.spawn || tau > f.hits[f.hits.length - 1].t) continue;
    const [bx, by] = foeCenter(f);
    const fire = f.kind === 'flame';
    const r = (fire ? 250 : 270) + Math.sin(eps * 4) * 12;
    const g = c.createRadialGradient(bx, by, 10, bx, by, r);
    g.addColorStop(0, fire ? 'rgba(255,140,30,.42)' : 'rgba(62,242,208,.3)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(bx - r, by - r, r * 2, r * 2);
  }
  // hit flashes + anamorphic lens streaks
  for (const h of HITS) {
    const age = eps - h.eps;
    if (age < 0 || age > 0.32) continue;
    const f = SCRIPT.foes.find((x) => x.hits.includes(h));
    if (!f) continue;
    const [hx, hy] = foeCenter(f);
    const u = age / 0.32;
    const big = h.fx === 'final' || h.fx === 'impact' || h.step === 3;
    const R = (big ? 190 : 110) * (0.4 + u);
    const g = c.createRadialGradient(hx, hy, 0, hx, hy, R);
    g.addColorStop(0, `rgba(255,255,255,${0.95 * (1 - u)})`);
    g.addColorStop(0.4, h.fx === 'clang' ? `rgba(255,215,90,${0.7 * (1 - u)})` : `rgba(255,160,60,${0.6 * (1 - u)})`);
    g.addColorStop(1, 'rgba(255,100,20,0)');
    c.fillStyle = g;
    c.fillRect(hx - R, hy - R, R * 2, R * 2);
    const sw = (big ? 900 : 520) * (0.3 + u);
    const sg = c.createLinearGradient(hx - sw, 0, hx + sw, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, `rgba(255,255,255,${1 - u})`); sg.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = sg;
    c.fillRect(hx - sw, hy - (big ? 5 : 3) * (1 - u) - 1, sw * 2, (big ? 10 : 6) * (1 - u) + 2);
    c.fillRect(hx - 2, hy - R * 0.6, 4, R * 1.2);
  }
  c.restore();
}

/* ---------- extra hit effects (world space): comic starburst, sparks, rings, cracks ---------- */
export function drawHitExtras(c: C2, eps: number, P: Pal) {
  for (const h of HITS) {
    const age = eps - h.eps;
    if (age < 0 || age > 0.8) continue;
    const f = SCRIPT.foes.find((x) => x.hits.includes(h));
    if (!f) continue;
    const [hx, hy] = foeCenter(f);
    c.save();
    // comic starburst behind the pop-up
    if (age < 0.28) {
      const u = age / 0.28;
      const n = 12;
      const R = (h.step === 3 || h.fx === 'final' ? 120 : 78) * (0.5 + u);
      c.fillStyle = h.fx === 'clang' ? '#ffd23f' : h.fx === 'final' ? RED : '#ffffff';
      c.strokeStyle = css(P.ink);
      c.lineWidth = 4;
      c.globalAlpha = 1 - u;
      c.beginPath();
      for (let k = 0; k < n * 2; k++) {
        const a = (k / (n * 2)) * 6.283 + h.id;
        const r = k % 2 ? R * 0.55 : R * (0.9 + fr(k + h.id) * 0.3);
        c.lineTo(hx + Math.cos(a) * r, hy + Math.sin(a) * r);
      }
      c.closePath(); c.fill(); c.stroke();
    }
    // slash scar across the foe
    if (age < 0.4 && h.fx !== 'clang') {
      const a = (fr(h.id) - 0.5) * 1.2 - 0.6;
      const L = (h.step === 3 ? 150 : 100) * Math.min(1, age / 0.08);
      c.globalAlpha = 1 - age / 0.4;
      for (const [lw, col] of [[10, css(P.ink)], [4, '#ffffff']] as [number, string][]) {
        c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round';
        c.beginPath(); c.moveTo(hx - Math.cos(a) * L, hy - Math.sin(a) * L); c.lineTo(hx + Math.cos(a) * L, hy + Math.sin(a) * L); c.stroke();
      }
    }
    // sparks
    const sparkN = h.fx === 'clang' ? 26 : 12;
    c.globalAlpha = 1;
    for (let i = 0; i < sparkN; i++) {
      const a = fr(h.id * 5.1 + i) * 6.283;
      const sp = 260 + fr(h.id * 2.2 + i * 3.3) * 520;
      const x0 = hx + Math.cos(a) * sp * age;
      const y0 = hy + Math.sin(a) * sp * age + 700 * age * age * 0.5;
      const x1 = hx + Math.cos(a) * sp * (age - 0.03);
      const y1 = hy + Math.sin(a) * sp * (age - 0.03) + 700 * (age - 0.03) * (age - 0.03) * 0.5;
      c.strokeStyle = h.fx === 'clang' ? `rgba(255,225,110,${1 - age / 0.8})` : `rgba(255,${(150 + fr(i) * 90) | 0},60,${1 - age / 0.8})`;
      c.lineWidth = 2.5;
      c.shadowColor = FIRE; c.shadowBlur = P.night > 0.4 ? 10 : 0;
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    }
    c.shadowBlur = 0;
    // shockwave rings
    const rings = h.fx === 'final' ? 3 : h.step === 3 || h.fx === 'impact' ? 2 : 1;
    for (let k = 0; k < rings; k++) {
      const ra = age - k * 0.07;
      if (ra < 0 || ra > 0.5) continue;
      c.strokeStyle = h.fx === 'clang' ? `rgba(255,215,90,${1 - ra / 0.5})` : `rgba(255,255,255,${1 - ra / 0.5})`;
      c.lineWidth = 7 - k * 2;
      c.beginPath(); c.arc(hx, hy, 24 + ra * 520, 0, 6.3); c.stroke();
      c.strokeStyle = css(P.ink, (1 - ra / 0.5) * 0.7);
      c.lineWidth = 2;
      c.beginPath(); c.arc(hx, hy, 30 + ra * 520, 0, 6.3); c.stroke();
    }
    // break: radial cracks
    if (h.fx === 'break' && age < 0.7) {
      c.strokeStyle = RED; c.lineWidth = 4;
      c.globalAlpha = 1 - age / 0.7;
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * 6.283 + fr(k) * 0.4;
        const l = 60 + age * 300 + fr(k * 3) * 80;
        c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + Math.cos(a) * l * 0.5, hy + Math.sin(a) * l * 0.5 + fr(k * 7) * 10); c.lineTo(hx + Math.cos(a + 0.2) * l, hy + Math.sin(a + 0.2) * l); c.stroke();
      }
    }
    c.restore();
  }
}

/* ---------- screen-space overlays ---------- */
export function drawSpecialBanner(c: C2, eps: number, P: Pal) {
  SCRIPT.specials.forEach((s, i) => {
    const age = eps - SP_EPS[i];
    if (age < 0 || age > 1.5) return;
    const inU = ease(clamp(age / 0.16, 0, 1));
    const outU = clamp((age - 1.2) / 0.3, 0, 1);
    const x = lerp(-W, 0, inU) + outU * W;
    c.save();
    c.translate(x, 84);
    c.fillStyle = css(P.ink);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(W + 80, -6); c.lineTo(W + 80, 46); c.lineTo(0, 52); c.closePath(); c.fill();
    c.fillStyle = RED; c.fillRect(0, 47, W + 80, 5);
    c.fillStyle = GOLD;
    c.font = '400 42px "Ma Shan Zheng",cursive';
    c.textBaseline = 'middle';
    c.fillText(s.zh, 34, 24);
    c.fillStyle = css(P.paper);
    c.font = '400 32px Bangers,Impact,sans-serif';
    c.fillText(`SECRET ART · ${s.name}`, 34 + s.zh.length * 44 + 18, 26);
    c.restore();
  });
}
export function drawChapterCard(c: C2, eps: number, P: Pal) {
  SCRIPT.chapters.forEach((ch, i) => {
    const age = eps - CH_EPS[i];
    if (age < 0 || age > 2.1) return;
    const inU = ease(clamp(age / 0.3, 0, 1));
    const outU = ease(clamp((age - 1.7) / 0.4, 0, 1));
    c.save();
    c.translate(lerp(W, 0, inU) - outU * W, 0);
    c.fillStyle = css(P.ink, 0.94);
    c.beginPath(); c.moveTo(-40, H * 0.36); c.lineTo(W + 40, H * 0.3); c.lineTo(W + 40, H * 0.56); c.lineTo(-40, H * 0.62); c.closePath(); c.fill();
    c.fillStyle = RED;
    c.beginPath(); c.moveTo(-40, H * 0.355); c.lineTo(W + 40, H * 0.295); c.lineTo(W + 40, H * 0.305); c.lineTo(-40, H * 0.365); c.closePath(); c.fill();
    c.font = '400 170px "Ma Shan Zheng",cursive';
    c.textBaseline = 'middle';
    c.fillStyle = RED;
    c.fillText(ch.zh, 70, H * 0.47);
    c.fillStyle = css(P.paper);
    c.font = '400 70px Bangers,Impact,sans-serif';
    c.fillText(ch.name, 70 + 190, H * 0.46);
    c.font = '700 14px "JetBrains Mono",monospace';
    c.fillStyle = GOLD;
    c.fillText(`CHAPTER ${String(i + 1).padStart(2, '0')}`, 70 + 192, H * 0.55);
    c.restore();
  });
}

/** camera punch on heavy hits */
export function zoomPunch(eps: number): number {
  let z = 0;
  for (const h of HITS) {
    const age = eps - h.eps;
    if (age >= 0 && age < 0.24 && (h.fx === 'final' || h.fx === 'impact' || h.step === 3)) z = Math.max(z, (h.fx === 'final' ? 0.075 : 0.04) * (1 - age / 0.24));
  }
  return z;
}
export function flashAmt(eps: number): number {
  let f = 0;
  for (const h of HITS) {
    const age = eps - h.eps;
    if (age >= 0 && age < 0.3 && (h.fx === 'final' || h.fx === 'break')) f = Math.max(f, (h.fx === 'final' ? 0.55 : 0.3) * (1 - age / 0.3));
  }
  for (let i = 0; i < SCRIPT.specials.length; i++) {
    const s = SCRIPT.specials[i];
    const age = eps - SP_EPS[i];
    if ((s.kind === 'heaven' || s.kind === 'decrypt') && age > 0.34 && age < 0.62) f = Math.max(f, 0.7 * (1 - (age - 0.34) / 0.28));
  }
  return f;
}
export type { Hit };
