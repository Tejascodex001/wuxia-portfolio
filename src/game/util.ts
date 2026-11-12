export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
/** deterministic hash noise in [0,1) */
export const fr = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export const ease = (t: number) => 1 - Math.pow(1 - t, 3);
export type RGB = [number, number, number];
export const mixc = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const css = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

export const RED = '#d62a1e';
export const GOLD = '#e0a82e';
export const FIRE = '#ff8a1f';
export const TEAL = '#3ef2d0';

export type Pal = { paper: RGB; ink: RGB; far: RGB; mid: RGB; ground: RGB; sun: RGB; night: number };
export type C2 = CanvasRenderingContext2D;

/** Ambient clock so flames and glows keep breathing while the scene is paused. */
export const amb = { t: 0 };
/** Render quality: k scales canvas shadow blur (0 on phones, where it is very slow). */
export const q = { k: 1 };

export function flames(c: C2, x: number, y: number, s: number, t0: number, seed: number) {
  const tau = t0 + amb.t;
  for (let k = 0; k < 7; k++) {
    const bx = x + (k - 3) * 7 * s;
    const hgt = (20 + fr(seed + k) * 22 + Math.sin(tau * 11 + k * 1.7) * 9) * s;
    c.fillStyle = k % 2 ? FIRE : RED;
    c.beginPath();
    c.moveTo(bx - 6 * s, y);
    c.quadraticCurveTo(bx - 4 * s, y - hgt * 0.6, bx + Math.sin(tau * 9 + k) * 3 * s, y - hgt);
    c.quadraticCurveTo(bx + 4 * s, y - hgt * 0.6, bx + 6 * s, y);
    c.fill();
  }
}
