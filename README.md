# Tejas Gowda S · Portfolio

Personal site of **Tejas Gowda S**, Junior AI Engineer at [Kenpath](https://kenpath.io) and maintainer of [RTensorLabs](https://github.com/RTensorLabs).

## What's in it

- **Particle words.** Headlines such as `TEJAS`, `FLAME`, `SANCTUM` and `HELLO` are built from dots that scatter in, flee your cursor, flash cobalt while they travel, and explode when you click. Press the Konami code to detonate every word at once.
- **Live project visuals**: a Transformer attention matrix for FLAME and a safety-number sigil with onion-routing hops for Sanctum.
- **Index-style work list** with a cursor-following preview, and a stack section that dims everything but the tool you point at.
- **Command palette** (`⌘K` / `Ctrl+K` / `/`) and light and dark themes.
- Respects `prefers-reduced-motion`; keyboard accessible.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · next-themes · cmdk

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

All copy (projects, tools, background, links) lives in [`src/data/content.ts`](src/data/content.ts). Design tokens are in [`src/index.css`](src/index.css). The particle effect is [`src/components/ParticleText.tsx`](src/components/ParticleText.tsx).
