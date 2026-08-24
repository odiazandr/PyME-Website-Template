---
owner: docs/spec/media.md
authority: canonical
status: active
answers: ["Where do images and fonts belong?", "What media quality is required?"]
---
# Media

Astro-processed imagery belongs under `src/assets/images/`; byte-for-byte passthrough belongs in `public/` only when required. Fonts belong under `src/assets/fonts/` when licensing permits self-hosting.

Every meaningful image has a purpose, appropriate alt text, known dimensions, responsive behavior, and an optimized production format. Original oversized camera files do not ship directly. Decorative images use empty alternative text.
