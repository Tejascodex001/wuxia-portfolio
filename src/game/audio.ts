import { HITS, SCRIPT, nightAmt, playerSpeed, playerX, toEps } from './script';

type Kind = 'slash' | 'hit' | 'clang' | 'break' | 'boom' | 'pickup' | 'special' | 'spawn' | 'gong' | 'orb';
type Ev = { eps: number; kind: Kind; n: number };

const EVENTS: Ev[] = [];
for (const s of SCRIPT.slashes) EVENTS.push({ eps: toEps(s.t), kind: 'slash', n: s.step });
for (const h of HITS) {
  EVENTS.push({ eps: h.eps, kind: h.fx === 'clang' ? 'clang' : h.fx === 'break' ? 'break' : h.fx === 'final' || h.fx === 'impact' ? 'boom' : 'hit', n: h.step });
}
SCRIPT.unlocks.forEach((u, i) => EVENTS.push({ eps: toEps(u.t) + 0.28, kind: 'pickup', n: i }));
for (const s of SCRIPT.specials) EVENTS.push({ eps: toEps(s.t), kind: 'special', n: 0 });
for (const f of SCRIPT.foes) EVENTS.push({ eps: toEps(f.spawn), kind: 'spawn', n: 0 });
for (const c of SCRIPT.chapters) EVENTS.push({ eps: toEps(c.t), kind: 'gong', n: 0 });
for (const p of SCRIPT.projs) if (p.parry) EVENTS.push({ eps: toEps(p.t1) - 0.05, kind: 'orb', n: p.n });
EVENTS.sort((a, b) => a.eps - b.eps);

// D pentatonic, in Hz
const PENTA = [146.83, 164.81, 196.0, 220.0, 246.94, 293.66, 329.63, 392.0, 440.0];

class Sound {
  private ac: AudioContext | null = null;
  private master: GainNode | null = null;
  private humGain: GainNode | null = null;
  private humFilter: BiquadFilterNode | null = null;
  private lfoGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private echo: DelayNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private lastStep = 0;
  private lastPluck = -1;
  enabled = false;

  /** Must be called from a user gesture (click / key). */
  setEnabled(on: boolean) {
    this.enabled = on;
    try { localStorage.setItem('wuxia-sound', on ? '1' : '0'); } catch { /* storage unavailable */ }
    if (on) this.start();
    if (this.master && this.ac) this.master.gain.setTargetAtTime(on ? 0.9 : 0, this.ac.currentTime, 0.08);
  }
  wasEnabled(): boolean {
    try { return localStorage.getItem('wuxia-sound') === '1'; } catch { return false; }
  }
  resume() {
    if (this.enabled) this.start();
  }

  private start() {
    if (!this.ac) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ac = new Ctor();
      this.ac = ac;
      const comp = ac.createDynamicsCompressor();
      comp.connect(ac.destination);
      this.master = ac.createGain();
      this.master.gain.value = 0;
      this.master.connect(comp);

      // noise buffer
      const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;

      // echo send for plucks
      this.echo = ac.createDelay(1);
      this.echo.delayTime.value = 0.31;
      const fb = ac.createGain();
      fb.gain.value = 0.34;
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1800;
      this.echo.connect(lp); lp.connect(fb); fb.connect(this.echo);
      lp.connect(this.master);

      // the hum: three drones through a slow low-pass, breathing with an LFO
      this.humGain = ac.createGain();
      this.humGain.gain.value = 0.09;
      this.humFilter = ac.createBiquadFilter();
      this.humFilter.type = 'lowpass';
      this.humFilter.frequency.value = 420;
      this.humFilter.connect(this.humGain);
      this.humGain.connect(this.master);
      for (const [freq, type, det] of [[55, 'sine', 0], [82.4, 'triangle', 4], [110.2, 'sine', -5]] as [number, OscillatorType, number][]) {
        const o = ac.createOscillator();
        o.type = type; o.frequency.value = freq; o.detune.value = det;
        o.connect(this.humFilter); o.start();
      }
      const lfo = ac.createOscillator();
      lfo.frequency.value = 0.18;
      this.lfoGain = ac.createGain();
      this.lfoGain.gain.value = 0.035;
      lfo.connect(this.lfoGain); this.lfoGain.connect(this.humGain.gain); lfo.start();

      // wind that follows how fast you scroll
      const wind = ac.createBufferSource();
      wind.buffer = buf; wind.loop = true;
      this.windFilter = ac.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.frequency.value = 500;
      this.windFilter.Q.value = 0.7;
      this.windGain = ac.createGain();
      this.windGain.gain.value = 0;
      wind.connect(this.windFilter); this.windFilter.connect(this.windGain); this.windGain.connect(this.master);
      wind.start();
    }
    void this.ac.resume();
  }

  /* ---------- synth voices ---------- */
  private env(g: GainNode, t0: number, peak: number, dur: number) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  }
  private noise(dur: number, peak: number, type: BiquadFilterType, f0: number, f1: number) {
    if (!this.ac || !this.master || !this.noiseBuf) return;
    const t = this.ac.currentTime;
    const src = this.ac.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = this.ac.createBiquadFilter();
    f.type = type; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = this.ac.createGain();
    this.env(g, t, peak, dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t, Math.random() * 1.5, dur + 0.05);
  }
  private tone(f0: number, f1: number, dur: number, peak: number, type: OscillatorType = 'sine', delay = 0, toEcho = false) {
    if (!this.ac || !this.master) return;
    const t = this.ac.currentTime + delay;
    const o = this.ac.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = this.ac.createGain();
    this.env(g, t, peak, dur);
    o.connect(g); g.connect(this.master);
    if (toEcho && this.echo) g.connect(this.echo);
    o.start(t); o.stop(t + dur + 0.05);
  }
  private pluck(freq: number, peak = 0.12) {
    this.tone(freq, freq * 0.995, 1.4, peak, 'triangle', 0, true);
    this.tone(freq * 2.01, freq * 2.0, 0.5, peak * 0.4, 'sine', 0, true);
    this.noise(0.05, peak * 0.5, 'bandpass', freq * 3, freq * 2);
  }

  private play(e: Ev) {
    switch (e.kind) {
      case 'slash': this.noise(0.16, 0.3, 'highpass', 1500, 7000); this.tone(520 + e.n * 90, 180, 0.12, 0.05, 'sawtooth'); break;
      case 'hit': this.tone(170, 45, 0.16, 0.4); this.noise(0.1, 0.35, 'lowpass', 1400, 250); break;
      case 'clang':
        [880, 1318.5, 2120, 2790].forEach((f, i) => this.tone(f, f * 0.998, 0.7 - i * 0.1, 0.11 / (i + 1), 'sine'));
        this.noise(0.04, 0.4, 'highpass', 3000, 6000);
        break;
      case 'break': this.noise(0.5, 0.45, 'bandpass', 4000, 300); this.tone(700, 70, 0.5, 0.25, 'sawtooth'); break;
      case 'boom':
        this.tone(110, 28, 1.0, 0.7);
        this.noise(0.7, 0.5, 'lowpass', 2400, 120);
        this.tone(1200, 3600, 0.4, 0.05, 'sine', 0.02);
        break;
      case 'pickup': [660, 880, 1320].forEach((f, i) => this.tone(f, f, 0.22, 0.12, 'triangle', i * 0.06, true)); break;
      case 'special':
        this.tone(260, 1500, 0.55, 0.14, 'sine');
        this.tone(390, 2250, 0.55, 0.07, 'triangle');
        this.noise(0.5, 0.18, 'bandpass', 800, 5000);
        break;
      case 'spawn': for (let i = 0; i < 3; i++) this.tone(900 - i * 220, 200, 0.07, 0.07, 'square', i * 0.05); break;
      case 'gong':
        [110, 164.8, 221, 330].forEach((f, i) => this.tone(f, f * 0.99, 2.2 - i * 0.3, 0.2 / (i + 1), 'sine', 0, true));
        this.noise(0.12, 0.25, 'lowpass', 900, 200);
        break;
      case 'orb': this.tone(1500, 600, 0.12, 0.1, 'square'); this.tone(2400, 1000, 0.18, 0.06, 'triangle', 0.02); break;
    }
  }

  /** Call once per frame with the previous and current effects clock. */
  update(prev: number, cur: number, tau: number, scrollV: number) {
    if (!this.enabled || !this.ac || !this.master) return;
    const now = this.ac.currentTime;
    const forward = cur > prev && cur - prev < 0.9;
    const night = nightAmt(tau);
    const spd = Math.abs(playerSpeed(tau));
    const boss = SCRIPT.foes.some((f) => (f.kind === 'flame' || f.kind === 'sanctum') && tau >= f.spawn && tau <= f.hits[f.hits.length - 1].t);

    // hum breathes with the scene: darker at night, throbbing in boss fights
    this.humFilter?.frequency.setTargetAtTime(520 - night * 260 + (boss ? 160 : 0), now, 0.4);
    this.humGain?.gain.setTargetAtTime(boss ? 0.14 : 0.09, now, 0.5);
    this.lfoGain?.gain.setTargetAtTime(boss ? 0.07 : 0.035, now, 0.5);
    const v = Math.min(1, Math.abs(scrollV) / 5);
    this.windGain?.gain.setTargetAtTime(v * 0.16, now, 0.12);
    this.windFilter?.frequency.setTargetAtTime(380 + v * 1900, now, 0.15);

    if (forward) {
      for (const e of EVENTS) {
        if (e.eps > prev && e.eps <= cur) this.play(e);
        else if (e.eps > cur) break;
      }
      // footsteps
      if (spd > 120) {
        const step = Math.floor(playerX(tau) / 46);
        if (step !== this.lastStep) { this.lastStep = step; this.noise(0.07, 0.2, 'lowpass', 700, 180); }
      }
      // slow guqin melody while the story moves
      const slot = Math.floor(tau / 2.6);
      if (slot !== this.lastPluck) {
        this.lastPluck = slot;
        const idx = Math.floor((Math.sin(slot * 12.9898) * 43758.5453 % 1 + 1) % 1 * PENTA.length);
        this.pluck(PENTA[idx] * (night > 0.5 ? 0.5 : 1), 0.1);
        if (slot % 3 === 0) this.pluck(PENTA[(idx + 4) % PENTA.length], 0.07);
      }
    } else {
      this.lastStep = Math.floor(playerX(tau) / 46);
      this.lastPluck = Math.floor(tau / 2.6);
    }
  }
}

export const sound = new Sound();
