# THE SKY WAS NEVER REAL

*An ascension through a world that was never meant to be understood.*

A continuous, reversible 3D web artwork in five chapters. Begin in a golden garden. Ascend through suspended ruins, fracture a physical sky boundary, enter a failing computational world, and reach the immense machine beyond it.

## Run locally

Use Node.js 24 LTS and pnpm 12.6.0. From the project directory:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:3000. The experience starts at the bottom of its native scroll range. No environment variables, credentials or external services are required.

For a production run:

```sh
pnpm build
pnpm start
```

The default development and production servers bind to `127.0.0.1:3000`. Stop the development server before starting production on the same port. Use `pnpm start --port 3001` to preview production alongside development.

## Explore

- Scroll **up** to ascend; down to descend.
- On touch screens, **swipe down** to ascend through the native page.
- Arrow Up / Page Up / Home ascend; Arrow Down / Page Down / End descend.
- Space ascends; Shift+Space descends when focus is outside a button or link.
- The five discreet right-edge chapter controls offer direct navigation.
- The bottom ascent hint is also a button.
- Sound starts muted. The sound control enables original ambient synthesis.
- “Read the world” opens the complete keyboard-accessible narrative.
- “Motion reduced” removes ambient movement, pointer parallax and camera easing. The system reduced-motion preference is respected automatically.
- “Skip to stillness” bypasses the intense middle chapters.
- At the ending, “Descend again” returns through the same world.

Direct entries: `/#garden`, `/#sanctuary`, `/#veil`, `/#corruption`, `/#beyond`.

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Tests cover the reverse-scroll mapping and deterministic, continuous, reversible chapter effects. Browser observations and hardware limitations are recorded in [docs/VERIFICATION.md](docs/VERIFICATION.md).

## Source map

- `src/components/Experience.tsx` — native scroll, presentation, accessible reading and controls.
- `src/components/world/World.tsx` — persistent canvas, camera, sky, lighting and quality controls.
- `src/components/world/Garden.tsx` — meadow, original tree and distant ruins.
- `src/components/world/Heavens.tsx` — sanctuary, fractured shell, corruption and cosmic machine.
- `src/components/world/shaders.ts` — original GLSL.
- `src/lib/journey.ts` — timeline math and frame state.
- `src/lib/ambience.ts` — optional Web Audio synthesis.

See [DESIGN.md](DESIGN.md), [PRODUCT.md](PRODUCT.md), [technical architecture](docs/ARCHITECTURE.md), and [asset attribution](docs/ATTRIBUTION.md).

## Technical boundaries

This is a fully procedural, stylized artwork. It uses efficient atmospheric approximations rather than photorealistic assets, ray tracing or volumetric fluid simulation. WebGL2 is required for the 3D view; the narrative remains available without it. Mobile devices use smaller geometry budgets and omit bloom. Frame-rate targets depend on actual hardware.

Dependencies were selected from current registry metadata, checking Next.js/React compatibility and the Fiber/Drei/postprocessing peer ranges. React Three Fiber usage was verified with Context7's current primary documentation. The installed Next.js App Router guides were also inspected.
