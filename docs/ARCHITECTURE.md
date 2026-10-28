# Technical architecture

## One world, one canvas

`src/components/Experience.tsx` owns native scrolling, coarse chapter UI, keyboard controls, the reading dialog and audio. `src/components/world/World.tsx` owns one persistent React Three Fiber canvas, camera, atmosphere, lighting, renderer diagnostics and quality management. `Garden.tsx` and `Heavens.tsx` hold the original environments. `shaders.ts` contains GLSL for the sky, grass, boundary and particles.

The App Router page is static. The canvas loads through a client-only dynamic import. Fonts are bundled locally. There are no external runtime requests, accounts, databases, analytics or model calls.

## Reverse native scroll

The document has a `950svh` spacer. Its bottom is the beginning:

```ts
progress = maxScroll > 0 ? clamp01(1 - scrollTop / maxScroll) : 0;
```

GSAP ScrollTrigger observes the document; a passive native listener keeps the target current. Neither intercepts wheel or touch events. Initial positioning happens before the canvas fades in. Manual history restoration and explicit chapter hashes avoid the browser restoring an unintended starting point. Resizing preserves normalized progress.

`#garden`, `#sanctuary`, `#veil`, `#corruption` and `#beyond` are supported entry points. Chapter buttons scroll to their corresponding native positions. Native Arrow/Page/Home/End behavior remains available; Space ascends and Shift+Space descends when focus is outside an interactive control. The clickable ascent hint is an additional alternative.

## Ordered rendering

`journey` is a small module-level mutable state object. Scroll events update `target`. A `useFrame` callback at priority **-100** computes exponentially damped `progress`, camera position and atmosphere before all environment callbacks. This ordering matters: on-demand reduced-motion frames must update the camera and every environment from the same progress sample.

The camera follows authored Catmull–Rom position and look-at curves. Its height rises continuously from approximately 3.5 to 218 world units. Translation reveals real depth between grass, tree, ruins, boundary and celestial structures. Pointer motion introduces a small lateral offset. The last curve segment covers less distance, slowing the approach to the final core.

React updates only coarse state such as chapter changes and user settings. Uniforms, matrices and camera objects mutate in the render loop. The UI reads progress into CSS properties and a text node without per-frame React renders.

## False sky

A deterministic triangular tessellation forms a physical horizontal shell at world height 112. It spans over 200 world units and is placed across the camera's ascent path. Vertex attributes carry each shard's center, seed and barycentric coordinates. The vertex shader moves and tilts whole shards outward as fracture increases. Screen-space derivatives of barycentric coordinates produce emissive edge seams; no crack image or screen overlay is used.

The shell fades into visibility during the approach, then separates enough for the camera to pass through an actual opening. Its triangles retain depth testing, perspective and silhouette. The star field and upper-world geometry exist behind it. Reversing progress reconstructs the same shell.

## Reality corruption

Two instanced meshes share 420 matching cell transforms: dark structural blocks and thin crimson seam geometry. A deterministic per-cell threshold controls detachment, scale loss, rotation and drift. A warped line grid and broken angular ring hold the larger composition. Progress controls propagation intensity and lighting; ambient time adds slow movement only when full motion is enabled. Corruption subsides before the final chapter.

## Performance and lifetime

- Instanced grass: 26,000 blades on desktop, 11,000 on compact/coarse-pointer devices.
- Tree: 1,800 foliage clusters and 5,400 small leaves; reduced to 1,050 and 3,150 in the compact tier.
- Particles: 1,100 desktop / 480 compact. Debris: 140 / 65.
- Initial DPR cap: 1.5 desktop / 1.15 compact. Slow measured frames can reduce DPR further.
- Desktop bloom uses an emissive threshold and no multisampling. Compact devices omit the composer.
- Reduced motion uses demand rendering and removes wind, drifting particles, pointer parallax and camera damping. Background tabs and the reading dialog also suspend continuous rendering.
- Geometries, distributions, scratch vectors and materials persist between frames. Explicit geometry owners dispose their resources; R3F disposes declarative resources. Event listeners, ScrollTrigger, synthesis nodes and animation callbacks clean up on unmount.
- `canvas.dataset` exposes FPS, draw calls and renderer resource counts for local diagnostics. Demand-rendered idle FPS is not a performance benchmark.

These are quality controls, not guarantees of a particular frame rate on untested hardware.

## Failure and accessibility

A React error boundary, WebGL context-loss handler and loading timeout expose a readable fallback. The semantic five-chapter narrative is server-rendered inside a native dialog, with a no-JavaScript version in `noscript`. Dialog focus trapping and Escape handling use the browser. All chapter controls have names and current-step state. A skip link opens the narrative. A motion toggle can override the system preference. “Skip to stillness” moves directly to the ending without traversing intense visuals.

## Validation

`tests/journey.test.ts` checks scroll direction, zero range, overscroll, inverse chapter mapping, chapter boundaries, continuous scene envelopes, reversible state and deterministic generation. See `docs/VERIFICATION.md` for actual browser evidence and limitations.
