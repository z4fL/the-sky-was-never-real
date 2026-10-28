# Project conventions

Read `PRODUCT.md`, `DESIGN.md`, and `docs/ARCHITECTURE.md` before changing the artwork. Preserve the five-chapter narrative and original procedural identity.

- Use pnpm and TypeScript strict mode. No backend or account infrastructure.
- One persistent React Three Fiber canvas. Native page scroll is the only progression source.
- Keep per-frame state in `src/lib/journey.ts` and mutable Three.js objects. Never set React state in `useFrame`.
- Bottom is progress 0; top is progress 1. Every progress-driven transformation must reverse.
- Seed all procedural distributions. Reuse geometry and materials; dispose manually created GPU resources.
- Respect reduced motion. Keep the narrative and chapter buttons usable when WebGL fails.
- Keep original external asset licenses in `docs/ATTRIBUTION.md`.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- Review desktop and mobile renders, each chapter, reverse traversal, keyboard navigation, reduced motion, and browser errors.
- This project is maintained by the sole implementation agent. Do not delegate to other agents or models.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
