# Tejas Gowda S · Portfolio

Personal site of **Tejas Gowda S**, Junior AI Engineer at [Kenpath](https://kenpath.io) and maintainer of [RTensorLabs](https://github.com/RTensorLabs).

## The idea

The portfolio is a **wuxia stickman fighting film that plays as you scroll**. Scroll (or use the arrow keys) and Tejas runs through the Jianghu, cuts down glitchy bugs, and fights one boss per project. Nothing is a game you control: the whole scene is a pure function of scroll position, so scrubbing forwards and backwards is exact.

- **Bosses that are the projects.** FLAME is a stacked *Transformer golem* (Rust cog, Candle wax column, attention-matrix chest, Hugging Face head) that loses a part for every stack item you cut. SANCTUM is an *Onion Keeper* wrapped in Tor-style rings, with an identicon sigil, a padlock staff and falling binary. Each sparring-hall foe embodies its project too (GuardLayer's filter panel, SmartGuard's firewall, Vision Engine's lens eye, Anomaly Detector's spiking waveform, Auto-Immunity's antibody cell).
- **Special moves and effects.** Wave Slash, Whirlwind, Sky Dragon Leap, Thunder Strike, Heaven Cut and Decrypt, with light bloom, lens streaks, hit-stop, camera punch, impact frames, glitch tears and chapter title cards.
- **Sound.** A synthesized hum, wind that follows your scroll speed, guqin plucks and per-hit effects. Off by default; toggle in the top bar.
- **Keyboard.** `↓` / `S` run, hold to keep running, `↑` / `W` rewind, `←` `→` jump chapters, `Space` / `PageDown` big steps, `Home` / `End`.
- **Read Mode** shows the whole portfolio as plain HTML, and is the default under `prefers-reduced-motion`. The content is also present for assistive tech while the film plays.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · Canvas 2D · Web Audio (no audio files)

## Develop

```bash
npm install
npm run dev
```

```bash
npm run build   # production build into dist/
npm run lint
```

## Edit the content

All copy lives in [`src/data/content.ts`](src/data/content.ts). The film script (what happens when) is [`src/game/script.ts`](src/game/script.ts); drawing is in `src/game/render.ts`, `bosses.ts` and `fx.ts`; sound is `audio.ts`.
