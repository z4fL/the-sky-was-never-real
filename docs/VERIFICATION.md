# Verification — 2026-10-28

## Automated checks

All commands passed against the finished source:

| Command | Result |
| --- | --- |
| `pnpm lint` | No errors or warnings |
| `pnpm typecheck` | Passed |
| `pnpm test` | 6 tests passed |
| `pnpm build` | Optimized production build passed; `/` prerendered |
| Production HTTP request | `200` at `http://127.0.0.1:3000` |

The tests cover reverse-scroll direction, overscroll clamping, zero range, chapter-position inversion, chapter identity, continuous bounded effect envelopes, reversible scene state and seeded generation.

## Rendered browser review

The application was run in the available Chromium in-app browser. Final production captures were reviewed at **1280 × 720** and **390 × 844** CSS pixels. Both full and reduced motion were exercised. The system preference in this environment defaults to reduced motion.

| Behavior | Observed evidence |
| --- | --- |
| Initial native position | Desktop `scrollY=6120`, `maxScroll=6120`, progress `0`; mobile `7174 / 7174`, progress `0` |
| Upward progression | A native upward scroll on mobile-sized layout moved `7174` to `6330`; progress became `0.117647...` |
| Reverse progression | Downward scroll returned to native bottom and progress `0` |
| Direct chapter controls | All five stops produced the expected chapter and progress: `0`, `.25`, `.5`, approximately `.73`, `1` |
| Keyboard | Home reached progress `1`; End returned to the garden. Space handling is implemented alongside native arrow/page navigation |
| Continuous movement | Full-motion ascent and descent traversed the same world; the camera and environments remained present between chapters |
| Depth | Grass, tree, near architecture, distant rings and particles occupy distinct world distances; pointer parallax is disabled in reduced motion |
| Physical sky | World-space triangular prisms separated, tilted and exposed the upper world; their edges and thickness remained visible |
| Corruption | Ordered cells detached and drifted; crimson seams and the grid intensified, then disappeared before the ending |
| Ending | The concentric structure and final text were legible on desktop and mobile-sized layouts |
| Resize | Resizing from the mobile viewport to desktop at progress `.5` preserved progress `.5`; no horizontal overflow |
| Direct URL | Reloading `/#veil` began at progress `.5` without a fallback |
| Intensity bypass | “Skip to stillness” moved directly from the Veil to progress `1` |
| Reader | All five narrative chapters were present; keyboard focus stayed within the native dialog, Escape closed it and restored the triggering control |
| Audio controls | Initially muted. Enabling sound set pressed state to true; muting returned it to false. No audio error appeared |
| WebGL failure | Deliberately losing the actual WebGL context opened the fallback. Its reader still exposed all five chapters. Reload recovered the 3D garden |

Review images and observations are local development evidence in `.impeccable/review/`, not production assets. Captures include `desktop.png`, `mobile.png`, each desktop chapter, compact Veil/ending, the failure state and a chapter contact sheet.

## Performance observations

Full-motion renderer readouts sampled **55 and 60 FPS** on this host. These are short observations, not a cross-device benchmark.

After warming all chapters, two additional repeated chapter traversals reported **225 geometries and 18 textures** each. Sampled render calls were approximately **106** in the garden and **77** in the final environment, including postprocessing. No continuing GPU resource growth was observed in this short exercise. This does not replace a long-duration JS heap or GPU memory profile.

Demand-rendered idle FPS can read `0`; that is expected when reduced motion stops continuous rendering. Compact layouts use smaller instancing budgets, a lower DPR cap and no bloom composer. Slow full-motion frames can lower DPR for the session.

## Console and limitations

No shader compilation errors or application runtime errors appeared in the final production review before the deliberate context-loss test. The installed Fiber/Three combination emits the upstream `THREE.Clock` deprecation warning. It was left visible rather than suppressed.

Physical mobile GPUs, actual touch swipes, Safari, Firefox and audio output quality were not tested. The browser harness supports touch emulation and responsive controls, but not synthetic touch-scroll gestures. Native upward/downward scrolling and the mobile chapter controls were tested through its supported input tools. No 30 FPS mobile guarantee is claimed.

The environment is deliberately stylized and procedural. Haze, clouds and lighting are efficient approximations. There are no photorealistic external models or recorded audio assets.

The user required a sole implementation agent. Impeccable review and design documentation were therefore completed in this agent, with no delegated review or other-model work.
