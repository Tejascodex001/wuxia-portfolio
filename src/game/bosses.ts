import { GY, type Foe } from './script';
import { FIRE, GOLD, RED, TEAL, amb, clamp, css, flames, fr, lerp, type C2, type Pal } from './util';

/** Where a foe's body is (for hit effects and pop-ups). */
export function foeCenter(f: Foe): [number, number] {
  if (f.kind === 'flame') return [f.x, GY - 150];
  if (f.kind === 'sanctum') return [f.x, GY - 130];
  if (f.kind === 'hum') return [f.x, GY - 150];
  if (f.kind === 'fly') return [f.x, GY - f.lift];
  switch (f.look) {
    case 'eye': case 'spike': case 'immune': return [f.x, GY - 95];
    case 'wall': return [f.x, GY - 55];
    case 'guard': return [f.x, GY - 48];
    default: return [f.x, GY - 40];
  }
}
export function foeTop(f: Foe): number {
  if (f.kind === 'flame') return GY - 330;
  if (f.kind === 'sanctum') return GY - 260;
  if (f.kind === 'hum') return GY - 290;
  if (f.kind === 'fly') return GY - f.lift - 30;
  if (f.look === 'eye' || f.look === 'spike' || f.look === 'immune') return GY - 160;
  if (f.look === 'wall') return GY - 120;
  return GY - 110;
}

type Ink = { ink: string; paper: string; flash: boolean; P: Pal };

/* =====================================================================
   FLAME — "The Transformer": a forge-golem stacked from the real parts
   (Rust gear → Candle column → attention block → Hugging Face head)
   ===================================================================== */
const TOKENS = ['the', 'model', 'learns', '<eos>'];
export function drawTransformer(c: C2, f: Foe, tau: number, eps: number, P: Pal, flash: boolean) {
  const t = tau + amb.t;
  const ink = flash ? '#fff' : css(P.ink);
  const paper = flash ? '#fff' : css(P.paper);
  const done = f.hits.filter((h) => h.t <= tau).length;
  const sc = 0.82;
  const REMOVE = { head: 3, attn: 5, candle: 7 };
  const fall = (idx: number) => {
    if (done < idx) return null;
    const h = f.hits[idx - 1];
    return Math.max(0, eps - h.eps);
  };
  const sway = Math.sin(t * 1.4) * 2;
  c.save();
  c.translate(f.x, GY);
  c.scale(sc, sc);
  c.lineJoin = 'round';
  c.lineCap = 'round';

  const part = (cy: number, removeAt: number | null, dir: number, draw: () => void) => {
    const age = removeAt ? fall(removeAt) : null;
    c.save();
    if (age !== null) {
      if (age > 1.0) { c.restore(); return; }
      c.translate(dir * 160 * age, -220 * age + 700 * age * age);
      c.rotate(dir * age * 2.2);
      c.globalAlpha = clamp(1 - age / 1.0, 0, 1);
    } else {
      c.translate(sway * (1 - cy / -380), 0);
    }
    c.translate(0, cy);
    draw();
    c.restore();
  };

  // 1. RUST — the rotating cog base
  part(-62, null, 0, () => {
    c.save();
    c.rotate(t * 0.9);
    c.beginPath();
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      const r = k % 2 ? 54 : 70;
      c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    c.closePath();
    c.fillStyle = flash ? '#fff' : '#b5541f';
    c.fill();
    c.strokeStyle = ink;
    c.lineWidth = 6;
    c.stroke();
    c.beginPath(); c.arc(0, 0, 34, 0, 6.3);
    c.fillStyle = flash ? '#fff' : '#6d2f10';
    c.fill(); c.stroke();
    c.restore();
    c.fillStyle = flash ? '#000' : '#ffcf9a';
    c.font = '700 15px "JetBrains Mono",monospace';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('RUST', 0, 1);
    c.textAlign = 'left';
  });
  // 2. CANDLE — melting wax column with a flame window
  part(-166, REMOVE.candle, -1, () => {
    c.fillStyle = flash ? '#fff' : '#f3e3b5';
    c.strokeStyle = ink;
    c.lineWidth = 6;
    c.beginPath();
    c.rect(-34, -48, 68, 96);
    c.fill(); c.stroke();
    for (let k = 0; k < 4; k++) {
      const dx = -26 + k * 17;
      const dl = 14 + fr(k * 3.1) * 18 + Math.sin(t * 2 + k) * 3;
      c.beginPath();
      c.moveTo(dx - 5, 48); c.lineTo(dx - 5, 48 + dl); c.arc(dx, 48 + dl, 5, Math.PI, 0, true); c.lineTo(dx + 5, 48);
      c.fill(); c.stroke();
    }
    const g = c.createRadialGradient(0, -4, 2, 0, -4, 30);
    g.addColorStop(0, 'rgba(255,200,80,.95)'); g.addColorStop(1, 'rgba(255,100,20,.2)');
    c.fillStyle = flash ? '#fff' : g;
    c.beginPath(); c.arc(0, -4, 24, 0, 6.3); c.fill(); c.stroke();
    flames(c, 0, 10, 0.7, tau, 7);
    c.fillStyle = flash ? '#000' : '#7a4a10';
    c.font = '700 11px "JetBrains Mono",monospace'; c.textAlign = 'center';
    c.fillText('CANDLE', 0, 36); c.textAlign = 'left';
  });
  // 3. TRANSFORMERS — attention matrix chest + orbiting tokens
  part(-262, REMOVE.attn, 1, () => {
    c.fillStyle = flash ? '#fff' : css(P.night > 0.5 ? [38, 32, 50] : [232, 224, 200]);
    c.strokeStyle = ink;
    c.lineWidth = 6;
    c.beginPath(); c.rect(-74, -52, 148, 104); c.fill(); c.stroke();
    const N = 6;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const lit = j <= i ? Math.pow((Math.sin(t * 2.4 + i * 1.3 + j * 0.8) + 1) / 2, 2) : 0;
        c.fillStyle = flash ? '#fff' : `rgba(255,${(110 + lit * 100) | 0},30,${0.12 + lit * 0.88})`;
        c.fillRect(-42 + j * 14, -38 + i * 14, 12, 12);
      }
    }
    c.fillStyle = flash ? '#000' : css(P.ink);
    c.font = '700 10px "JetBrains Mono",monospace';
    c.fillText('ATTENTION', -66, -58);
    for (let k = 0; k < 4; k++) {
      const a = t * 0.9 + k * 1.57;
      const tx = Math.cos(a) * 112;
      const ty = Math.sin(a) * 34;
      c.fillStyle = css(P.paper);
      c.strokeStyle = ink;
      c.lineWidth = 3;
      c.fillRect(tx - 24, ty - 9, 48, 18); c.strokeRect(tx - 24, ty - 9, 48, 18);
      c.fillStyle = css(P.ink);
      c.font = '700 10px "JetBrains Mono",monospace'; c.textAlign = 'center';
      c.fillText(TOKENS[k], tx, ty + 4); c.textAlign = 'left';
    }
  });
  // 4. HUGGING FACE — the smiling head with open hands and a flame crown
  part(-350, REMOVE.head, 1, () => {
    flames(c, 0, -30, 1.3, tau, 3);
    c.fillStyle = flash ? '#fff' : '#ffd23f';
    c.strokeStyle = ink;
    c.lineWidth = 6;
    c.beginPath(); c.arc(0, 0, 42, 0, 6.3); c.fill(); c.stroke();
    for (const sx of [-1, 1]) {
      c.beginPath(); c.arc(sx * 54, 18, 14, 0, 6.3); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(sx * 15, -8, 5, 8, 0, 0, 6.3); c.fillStyle = flash ? '#000' : ink; c.fill();
    }
    c.fillStyle = flash ? '#fff' : '#ffd23f';
    c.strokeStyle = ink;
    c.beginPath(); c.arc(0, 8, 22, 0.15, Math.PI - 0.15); c.stroke();
    c.fillStyle = RED;
    c.beginPath(); c.arc(-26, 10, 5, 0, 6.3); c.arc(26, 10, 5, 0, 6.3); c.globalAlpha *= 0.5; c.fill(); c.globalAlpha /= 0.5;
  });
  c.restore();
}

/* =====================================================================
   SANCTUM — "The Onion Keeper": a cloaked guardian wrapped in Tor-style
   rings, with an identicon sigil, a padlock staff and a keyhole face
   ===================================================================== */
export function drawOnionKeeper(c: C2, f: Foe, tau: number, eps: number, P: Pal, flash: boolean) {
  const t = tau + amb.t;
  const night = P.night > 0.5;
  const body = flash ? '#fff' : night ? '#241d36' : css(P.ink);
  const rim = night ? css(P.ink) : css(P.paper);
  const clangs = f.hits.filter((h) => h.fx === 'clang' && h.t <= tau).length;
  const brk = f.hits.find((h) => h.fx === 'break');
  const opened = !!brk && tau >= brk.t;
  const cx = f.x;
  const cy = GY - 130 + Math.sin(t * 1.6) * 8;
  c.save();
  c.lineJoin = 'round';
  c.lineCap = 'round';

  // falling binary from the hem
  c.font = '700 13px "JetBrains Mono",monospace';
  for (let i = 0; i < 18; i++) {
    const yy = ((t * 54 + fr(i * 3.7) * 150) % 150);
    c.fillStyle = `rgba(62,242,208,${(1 - yy / 150) * 0.8})`;
    c.fillText(fr(i * 9.1 + Math.floor(t * 3)) > 0.5 ? '1' : '0', cx - 58 + fr(i) * 116, cy + 50 + yy);
  }
  // onion rings (one breaks per clang)
  const radii = [156, 128, 100];
  for (let i = 0; i < 3; i++) {
    const broken = clangs > i;
    if (broken) {
      const h = f.hits.filter((x) => x.fx === 'clang')[i];
      const age = h ? eps - h.eps : 9;
      if (age >= 0 && age < 0.6) {
        c.strokeStyle = `rgba(62,242,208,${1 - age / 0.6})`;
        c.lineWidth = 6;
        c.beginPath(); c.arc(cx, cy, radii[i] + age * 160, 0, 6.3); c.stroke();
      }
      continue;
    }
    c.save();
    c.translate(cx, cy);
    c.rotate(t * (0.5 + i * 0.25) * (i % 2 ? -1 : 1));
    c.strokeStyle = flash ? '#fff' : TEAL;
    c.lineWidth = 5;
    c.setLineDash([22, 12]);
    c.beginPath(); c.arc(0, 0, radii[i], 0, 6.3); c.stroke();
    c.setLineDash([]);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * 6.28;
      c.fillStyle = css(P.paper);
      c.strokeStyle = flash ? '#fff' : TEAL;
      c.lineWidth = 4;
      c.beginPath(); c.arc(Math.cos(a) * radii[i], Math.sin(a) * radii[i], 9, 0, 6.3); c.fill(); c.stroke();
      c.fillStyle = TEAL;
      c.fillRect(Math.cos(a) * radii[i] - 3, Math.sin(a) * radii[i] - 2, 6, 5);
    }
    c.restore();
  }
  // circuit between three relay nodes + moving packet
  const nodes = [0, 1, 2].map((k) => {
    const a = t * 0.7 + k * 2.09;
    return [cx + Math.cos(a) * 118, cy + Math.sin(a) * 118] as [number, number];
  });
  c.strokeStyle = 'rgba(62,242,208,.55)';
  c.lineWidth = 2;
  c.setLineDash([5, 6]);
  c.beginPath(); c.moveTo(nodes[0][0], nodes[0][1]); c.lineTo(nodes[1][0], nodes[1][1]); c.lineTo(nodes[2][0], nodes[2][1]); c.stroke();
  c.setLineDash([]);
  const pk = (t * 0.9) % 2;
  const seg = pk < 1 ? [nodes[0], nodes[1], pk] : [nodes[1], nodes[2], pk - 1];
  const a0 = seg[0] as [number, number];
  const a1 = seg[1] as [number, number];
  const u = seg[2] as number;
  c.fillStyle = '#fff';
  c.beginPath(); c.arc(lerp(a0[0], a1[0], u), lerp(a0[1], a1[1], u), 5, 0, 6.3); c.fill();

  // cloak
  c.fillStyle = body;
  c.strokeStyle = rim;
  c.lineWidth = 4;
  c.beginPath();
  c.moveTo(cx - 30, cy - 36);
  c.quadraticCurveTo(cx - 62, cy + 10, cx - 66, cy + 64);
  for (let k = 0; k <= 6; k++) c.lineTo(cx - 66 + k * 22, cy + 64 + (k % 2 ? 16 : -4));
  c.quadraticCurveTo(cx + 62, cy + 10, cx + 30, cy - 36);
  c.closePath();
  c.fill(); c.stroke();
  // hood
  c.beginPath(); c.arc(cx, cy - 58, 30, 0, 6.3); c.fill(); c.stroke();
  if (opened) {
    const g = c.createRadialGradient(cx, cy - 58, 2, cx, cy - 58, 26);
    g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(62,242,208,.4)');
    c.fillStyle = g;
    c.beginPath(); c.arc(cx, cy - 58, 24, 0, 6.3); c.fill();
    c.fillStyle = '#0f0d0b';
    c.font = '700 11px "JetBrains Mono",monospace'; c.textAlign = 'center';
    c.fillText('PLAIN', cx, cy - 58); c.fillText('TEXT', cx, cy - 47); c.textAlign = 'left';
  } else {
    c.fillStyle = flash ? '#000' : TEAL;
    c.beginPath(); c.arc(cx, cy - 62, 8, 0, 6.3); c.fill();
    c.beginPath(); c.moveTo(cx - 5, cy - 58); c.lineTo(cx + 5, cy - 58); c.lineTo(cx + 8, cy - 40); c.lineTo(cx - 8, cy - 40); c.fill();
  }
  // identicon sigil (the safety number) on the chest
  const seed = Math.floor(t * 1.6);
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 3; j++) {
      const on = fr(seed * 13.3 + i * 5 + j * 11) > 0.45;
      if (!on) continue;
      c.fillStyle = flash ? '#fff' : TEAL;
      c.fillRect(cx - 25 + j * 10, cy - 24 + i * 10, 9, 9);
      if (j < 2) c.fillRect(cx + 25 - 9 - j * 10, cy - 24 + i * 10, 9, 9);
    }
  }
  // padlock staff
  c.strokeStyle = rim;
  c.lineWidth = 6;
  c.beginPath(); c.moveTo(cx + 72, cy + 76); c.lineTo(cx + 72, cy - 70); c.stroke();
  c.fillStyle = flash ? '#fff' : GOLD;
  c.strokeStyle = '#0f0d0b';
  c.lineWidth = 4;
  c.fillRect(cx + 58, cy - 92, 28, 24); c.strokeRect(cx + 58, cy - 92, 28, 24);
  c.beginPath(); c.arc(cx + 72, cy - 92, 10, Math.PI, 0); c.stroke();
  c.restore();
}

/* =====================================================================
   SPARRING HALL — one unique foe per project
   ===================================================================== */
export function drawMini(c: C2, f: Foe, tau: number, P: Pal, flash: boolean, px: number, drawBody: () => void) {
  const t = tau + amb.t;
  const ink = flash ? '#fff' : css(P.ink);
  const paper = flash ? '#fff' : css(P.paper);
  const x = f.x;
  c.save();
  c.lineJoin = 'round';
  c.lineCap = 'round';
  switch (f.look) {
    case 'guard': {
      // GuardLayer: stickman behind a scanning filter panel that blocks input
      drawBody();
      const px0 = x - 46;
      c.fillStyle = flash ? '#fff' : 'rgba(62,242,208,.28)';
      c.strokeStyle = ink;
      c.lineWidth = 5;
      c.fillRect(px0 - 14, GY - 112, 30, 104); c.strokeRect(px0 - 14, GY - 112, 30, 104);
      const sy = GY - 106 + ((Math.sin(t * 3) + 1) / 2) * 92;
      c.strokeStyle = RED; c.lineWidth = 3;
      c.beginPath(); c.moveTo(px0 - 14, sy); c.lineTo(px0 + 16, sy); c.stroke();
      c.fillStyle = RED;
      c.font = '400 14px Bangers,Impact'; c.textAlign = 'center';
      c.fillText('BLOCKED', px0 + 1, GY - 120); c.textAlign = 'left';
      break;
    }
    case 'wall': {
      // SmartGuard: a firewall brick-wall with a classifier confidence bar
      const w = 78, h = 104;
      c.fillStyle = flash ? '#fff' : '#b5541f';
      c.strokeStyle = ink; c.lineWidth = 5;
      c.fillRect(x - w / 2, GY - h, w, h); c.strokeRect(x - w / 2, GY - h, w, h);
      c.lineWidth = 3;
      for (let r = 1; r < 5; r++) {
        const yy = GY - h + (r * h) / 5;
        c.beginPath(); c.moveTo(x - w / 2, yy); c.lineTo(x + w / 2, yy); c.stroke();
        for (let k = 0; k < 3; k++) { const xx = x - w / 2 + ((k + (r % 2) * 0.5) * w) / 3; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx, yy - h / 5); c.stroke(); }
      }
      flames(c, x, GY - h, 1.2, tau, 17);
      c.fillStyle = RED; c.fillRect(x - 12, GY - 70, 8, 8); c.fillRect(x + 6, GY - 70, 8, 8);
      c.fillStyle = css(P.ink); c.fillRect(x - w / 2, GY - h - 36, w, 10);
      c.fillStyle = RED; c.fillRect(x - w / 2, GY - h - 36, w * (0.6 + 0.39 * ((Math.sin(t * 2) + 1) / 2)), 10);
      break;
    }
    case 'eye': {
      // Vision Engine: a camera-lens eye with a 3x3 convolution kernel scanning its iris
      const y = GY - 95 + Math.sin(t * 2.2) * 8;
      c.fillStyle = paper; c.strokeStyle = ink; c.lineWidth = 5;
      c.beginPath(); c.ellipse(x, y, 52, 34, 0, 0, 6.3); c.fill(); c.stroke();
      const look = clamp((px - x) / 300, -1, 1) * 14;
      c.fillStyle = flash ? '#fff' : '#2850ff';
      c.beginPath(); c.arc(x + look, y, 24, 0, 6.3); c.fill(); c.stroke();
      c.fillStyle = ink; c.beginPath(); c.arc(x + look, y, 10, 0, 6.3); c.fill();
      const kx = x + look - 15 + ((t * 1.2) % 1) * 4;
      c.strokeStyle = '#fff'; c.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(kx + i * 10 - 8, y - 15); c.lineTo(kx + i * 10 - 8, y + 15); c.stroke(); c.beginPath(); c.moveTo(kx - 8, y - 15 + i * 10); c.lineTo(kx + 22, y - 15 + i * 10); c.stroke(); }
      c.strokeStyle = ink; c.lineWidth = 4;
      for (let k = 0; k < 6; k++) { const a = k * 1.047 + t; c.beginPath(); c.moveTo(x + Math.cos(a) * 60, y + Math.sin(a) * 40); c.lineTo(x + Math.cos(a) * 72, y + Math.sin(a) * 50); c.stroke(); }
      break;
    }
    case 'spike': {
      // Anomaly Detector: a live telemetry waveform that spikes past a z-score threshold
      const y = GY - 95;
      c.strokeStyle = 'rgba(214,42,30,.7)'; c.lineWidth = 2; c.setLineDash([6, 5]);
      c.beginPath(); c.moveTo(x - 64, y - 30); c.lineTo(x + 64, y - 30); c.stroke(); c.setLineDash([]);
      c.strokeStyle = flash ? '#fff' : ink; c.lineWidth = 5;
      c.beginPath();
      for (let k = -64; k <= 64; k += 4) {
        const spike = Math.exp(-Math.pow((k - Math.sin(t * 1.3) * 30) / 8, 2)) * (fr(Math.floor(t * 12) + k) > 0.5 ? 70 : 52);
        const yy = y + Math.sin(k * 0.22 + t * 6) * 6 - spike;
        if (k === -64) c.moveTo(x + k, yy); else c.lineTo(x + k, yy);
      }
      c.stroke();
      c.fillStyle = RED;
      c.beginPath(); c.moveTo(x, y - 128); c.lineTo(x - 12, y - 104); c.lineTo(x + 12, y - 104); c.closePath(); c.fill();
      c.fillStyle = '#fff'; c.font = '400 16px Bangers'; c.textAlign = 'center'; c.fillText('!', x, y - 106); c.textAlign = 'left';
      c.fillStyle = RED; c.fillRect(x + 36, y - 6, 8, 8); c.fillRect(x + 50, y - 6, 8, 8);
      break;
    }
    case 'immune': {
      // Auto-Immunity: an antibody-armed immune cell with a pulsing nucleus
      const y = GY - 90 + Math.sin(t * 2) * 8;
      const r = 36 + Math.sin(t * 5) * 2;
      c.strokeStyle = ink; c.lineWidth = 5;
      for (let k = 0; k < 6; k++) {
        const a = k * 1.047 + t * 0.6;
        const bx = x + Math.cos(a) * r, by = y + Math.sin(a) * r;
        const ex = x + Math.cos(a) * (r + 24), ey = y + Math.sin(a) * (r + 24);
        c.beginPath(); c.moveTo(bx, by); c.lineTo(ex, ey);
        c.lineTo(ex + Math.cos(a + 0.7) * 14, ey + Math.sin(a + 0.7) * 14); c.moveTo(ex, ey);
        c.lineTo(ex + Math.cos(a - 0.7) * 14, ey + Math.sin(a - 0.7) * 14); c.stroke();
      }
      c.fillStyle = flash ? '#fff' : '#f4f0e6';
      c.beginPath(); c.arc(x, y, r, 0, 6.3); c.fill(); c.stroke();
      c.fillStyle = flash ? '#fff' : '#9b5de5';
      c.beginPath(); c.arc(x + 6, y - 4, 14 + Math.sin(t * 6) * 2, 0, 6.3); c.fill(); c.stroke();
      c.fillStyle = RED; c.fillRect(x - 14, y + 8, 6, 6); c.fillRect(x - 2, y + 8, 6, 6);
      break;
    }
    default:
      drawBody();
  }
  c.restore();
}
void FIRE;


/* =====================================================================
   HUM — "The Downmix Phantom": a vinyl-record head in berry-pink headphones,
   an equalizer for legs, and six orbiting surround speakers that your
   slashes "downmix" one pair at a time until only stereo is left.
   ===================================================================== */
const BERRY = '#e0245e';
const CH6 = ['L', 'C', 'R', 'Ls', 'Rs', 'LFE'];
export function drawHumBoss(c: C2, f: Foe, tau: number, eps: number, P: Pal, flash: boolean) {
  const t = tau + amb.t;
  const night = P.night > 0.5;
  const done = f.hits.filter((h) => h.t <= tau).length;
  const cones = Math.max(2, 6 - Math.floor(done / 2));
  const cx = f.x;
  const cy = GY - 150 + Math.sin(t * 1.8) * 6;
  const rim = night ? css(P.ink) : '#0f0d0b';
  const beat = (t * 2) % 1;
  c.save();
  c.lineJoin = 'round';
  c.lineCap = 'round';

  // equalizer legs
  for (let k = 0; k < 11; k++) {
    const h = 16 + (0.5 + 0.5 * Math.sin(t * 5 + k * 0.9)) * 44 + (k % 3 === 0 ? beat * 10 : 0);
    const g = c.createLinearGradient(0, GY - h, 0, GY);
    g.addColorStop(0, flash ? '#fff' : '#ff7aa8'); g.addColorStop(1, flash ? '#fff' : BERRY);
    c.fillStyle = g;
    c.strokeStyle = rim; c.lineWidth = 3;
    c.fillRect(cx - 82 + k * 15, GY - h, 12, h); c.strokeRect(cx - 82 + k * 15, GY - h, 12, h);
  }

  // surround speakers (back ones first)
  const names = cones === 6 ? CH6 : cones === 2 ? ['L', 'R'] : CH6.slice(0, cones);
  const order: { k: number; a: number; s: number }[] = [];
  for (let k = 0; k < cones; k++) {
    const a = t * 0.8 + (k * Math.PI * 2) / cones;
    order.push({ k, a, s: Math.sin(a) });
  }
  order.sort((p, q) => p.s - q.s);
  const drawCones = (front: boolean) => {
    for (const o of order) {
      if ((o.s >= 0) !== front) continue;
      const px = cx + Math.cos(o.a) * 150;
      const py = cy + 34 + o.s * 42;
      const dep = 0.85 + 0.25 * o.s;
      const r = 27 * dep;
      // sound pulse ring
      const pr = ((t * 1.6 + o.k * 0.3) % 1);
      c.strokeStyle = `rgba(224,36,94,${(1 - pr) * 0.6})`;
      c.lineWidth = 3;
      c.beginPath(); c.arc(px, py, r + pr * 26, 0, 6.3); c.stroke();
      c.fillStyle = flash ? '#fff' : night ? '#241d36' : '#2b2b33';
      c.strokeStyle = night ? css(P.ink) : '#0f0d0b'; c.lineWidth = 5 * dep;
      c.beginPath(); c.arc(px, py, r, 0, 6.3); c.fill(); c.stroke();
      c.strokeStyle = flash ? '#fff' : BERRY; c.lineWidth = 3;
      c.beginPath(); c.arc(px, py, r * 0.66, 0, 6.3); c.stroke();
      c.fillStyle = flash ? '#fff' : BERRY;
      c.beginPath(); c.arc(px, py, r * (0.28 + beat * 0.08), 0, 6.3); c.fill();
      c.fillStyle = css(P.paper); c.font = `700 ${11 * dep}px "JetBrains Mono",monospace`; c.textAlign = 'center';
      c.fillText(names[o.k] ?? '', px, py - r - 6); c.textAlign = 'left';
    }
  };
  drawCones(false);

  // headphones band
  c.strokeStyle = flash ? '#fff' : BERRY; c.lineWidth = 14;
  c.beginPath(); c.arc(cx, cy, 98, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
  c.strokeStyle = rim; c.lineWidth = 3;
  c.beginPath(); c.arc(cx, cy, 106, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
  c.beginPath(); c.arc(cx, cy, 91, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
  for (const sx of [-1, 1]) {
    c.fillStyle = flash ? '#fff' : BERRY;
    c.strokeStyle = rim; c.lineWidth = 5;
    c.beginPath(); c.roundRect(cx + sx * 96 - 14, cy - 28, 28, 56, 10); c.fill(); c.stroke();
  }

  // vinyl record
  const R = 76;
  c.fillStyle = flash ? '#fff' : '#0b0b10';
  c.strokeStyle = night ? css(P.ink) : '#0f0d0b'; c.lineWidth = 6;
  c.beginPath(); c.arc(cx, cy, R, 0, 6.3); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 1.5;
  for (let g = 0; g < 6; g++) { c.beginPath(); c.arc(cx, cy, 30 + g * 7.5, 0, 6.3); c.stroke(); }
  c.save();
  c.translate(cx, cy); c.rotate(t * 2.2);
  const sh = c.createLinearGradient(-R, 0, R, 0);
  sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,.22)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = sh;
  c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R - 3, -0.35, 0.35); c.closePath(); c.fill();
  c.restore();
  c.fillStyle = flash ? '#fff' : BERRY;
  c.beginPath(); c.arc(cx, cy, 27, 0, 6.3); c.fill();
  c.fillStyle = flash ? '#000' : '#fff';
  c.font = '400 20px Bangers,Impact,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('HUM', cx, cy - 2);
  c.fillStyle = '#0b0b10'; c.beginPath(); c.arc(cx, cy + 14, 3, 0, 6.3); c.fill();
  c.textAlign = 'left';
  // red glitch eyes on the grooves
  c.fillStyle = RED; c.fillRect(cx - 46, cy - 6, 8, 8); c.fillRect(cx + 38, cy - 6, 8, 8);

  drawCones(true);

  // DMR readout
  const label = cones > 2 ? `DMR  ${cones - 1}.1 → 2.0` : 'DMR  STEREO';
  c.font = '700 12px "JetBrains Mono",monospace';
  const w = c.measureText(label).width + 14;
  c.fillStyle = css(P.ink); c.fillRect(cx - w / 2, cy - 142, w, 20);
  c.fillStyle = cones > 2 ? '#ff7aa8' : TEAL; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(label, cx, cy - 131); c.textAlign = 'left';
  void eps;
  c.restore();
}
