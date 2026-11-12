# Tejas Gowda S · Wuxia Portfolio

A cinematic, wuxia-themed portfolio for **Tejas Gowda S**, Junior AI Engineer at [Kenpath](https://kenpath.io) and maintainer of [RTensorLabs](https://github.com/RTensorLabs).

## Highlights

- **Ink canvas**: your cursor paints brush ink, clicks bloom, crimson petals drift down.
- **Living sky**: a sun/moon arcs across the page as you scroll; mountains and mist parallax.
- **Skill constellation**: an interactive map of three schools of technique.
- **3D tilt project scrolls** with a spotlight that follows the pointer.
- **Scroll-drawn journey** timeline.
- **Command palette** (`⌘K` / `Ctrl+K` / `/`), light and dark themes, and a hidden Konami easter egg.
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

All copy (projects, skills, journey, links) lives in [`src/data/content.ts`](src/data/content.ts). Design tokens are in [`src/index.css`](src/index.css).
