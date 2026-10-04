# Freelancer Portfolio 2

A personal portfolio for **Md. Fakhrul Alam Shuvo**, a WordPress and full-stack web developer based in Dhaka, Bangladesh. The main experience, **A signal from Dhaka**, combines a real-time 3D Earth with a scroll-driven camera journey, orbital details, original project artwork, and source-backed work and experience.

## Pages

- `/` — the main orbital portfolio.
- `/earth-3d` — an alternate URL for the orbital portfolio.
- `/home-2` — the original portfolio with a scroll-controlled Earth frame sequence.

## Features

- Chapter-linked Earth flybys, atmosphere, cloud layers, night lights, and a Dhaka marker.
- Responsive project showcases, experience timeline, and contact links.
- Scroll progress, chapter navigation, and an ambient-motion pause control.
- Reduced-motion support and a static Earth fallback when WebGL is unavailable.
- Local fonts, route metadata, sitemap, and nonce-based Content Security Policy.

## Stack

Next.js 16, React 19, TypeScript, Three.js, and CSS Modules.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000).

```sh
npm run lint
npm run type-check
npm run build
npm start
```

The repository includes the source Earth video, generated WebP assets, and supplied resume. Build output, dependencies, environment files, and Vercel account configuration are excluded from Git.
