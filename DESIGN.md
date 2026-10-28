---
name: THE SKY WAS NEVER REAL
description: An ascension through a world that was never meant to be understood.
colors:
  primary: "#d6b777"
  parchment: "#f2e8ce"
  soft-parchment: "#d5ccb2"
  garden-olive: "#69633b"
  ancient-stone: "#a7a89b"
  fracture-crimson: "#982339"
  night: "#111712"
  reader-ground: "#17201b"
typography:
  display:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(64px, 7.1vw, 96px)"
    fontWeight: 400
    lineHeight: 0.91
    letterSpacing: "0.015em"
  headline:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(40px, 4.6vw, 64px)"
    fontWeight: 400
    lineHeight: 0.96
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "10px"
    fontWeight: 400
    letterSpacing: "0.17em"
spacing:
  close: "8px"
  control: "12px"
  group: "17px"
  separate: "30px"
components:
  button-ghost:
    textColor: "{colors.parchment}"
    backgroundColor: "transparent"
    height: "38px"
  chapter-step:
    textColor: "{colors.soft-parchment}"
    height: "46px"
    width: "44px"
---

# Design System: THE SKY WAS NEVER REAL

## Overview

**Creative North Star: "The Porcelain Firmament"**

The closer we get to the heavens, the less real the world becomes. A warm, inhabited-looking garden gives way to suspended ceremonial stone, a manufactured sky, a failing geometric world, and a quiet celestial mechanism. The artwork leads; the interface occupies its margins.

This is an Experience surface for a visitor exploring an unfamiliar world in a browser. Its light and darkness come from the narrative's changing environment. Original dimensional geometry carries the imagery. Typography offers a human, fragile counterpoint to monumental structures. The user rejected dashboard, portfolio, card-grid and marketing-page conventions.

**Key Characteristics:**

- A continuous ascent through actual perspective and depth.
- Gold and parchment against olive, stone, crimson and cosmic darkness.
- Restrained serif inscriptions and small, precise sans-serif controls.
- A physical sky fracture as the primary authored motion.
- Quiet controls, reversible transformation and a contemplative ending.

## Colors

Chapter colors occupy the world itself. Interface text stays warm and readable across the changing environments.

### Primary

- **Weathered Gold:** navigation, fine illuminated geometry, the tree's halo and focus accents.
- **Parchment Light:** primary text, restrained luminous details and the final quotation.

### Secondary

- **Garden Olive:** ground, vegetation roots and the warmth beneath the luminous foliage. The garden also uses peach, amber and ivory in procedural foliage colors.
- **Ancient Stone:** sanctuary columns, broken rings and suspended platform surfaces. Muted celestial green haze separates their depth layers.
- **Fracture Crimson:** corruption seams and spatial grids. It appears in the unstable layer, then recedes before the ending.

### Neutral

- **Soft Parchment:** supporting text.
- **Night:** the base browser surface before the world appears.
- **Reader Ground:** the accessible narrative, loading and error surfaces.

**The Earned Light Rule.** Emission belongs to seams, cores and celestial details. Bloom must preserve the silhouettes around them.

## Typography

**Display Font:** Bodoni Moda, with Georgia and serif fallbacks. Regular and genuine italic files are self-hosted.

**Body Font:** Manrope, with a sans-serif fallback.

**Character:** Delicate high-contrast display strokes make the title feel like an inscription held against impossible scale. The italic line softens its formal capitals. Interface text stays plain, compact and legible.

### Hierarchy

- **Display:** three lines, regular/italic/regular, using the frontmatter scale. The opening has a distinct lowercase italic middle line.
- **Headline:** chapter names use the headline scale, with balanced wrapping.
- **Title:** reader chapter headings use a regular serif (34px desktop, 30px compact).
- **Body:** the narrative uses the body scale and a measure capped at 65ch. Supporting in-world text uses a shorter measure.
- **Label:** chapter navigation and tools use small sans-serif text. Chapter labels use tracked uppercase; full prose never uses that treatment.

**The One Inscription Rule.** A focal title or quotation may accompany the environment. Avoid adding competing paragraphs, badges or explanatory overlays.

## Layout

One fixed canvas fills the viewport. Presentation and navigation sit in separate fixed layers. The opening title sits at the left (9.2vw), near vertical center, while the tree occupies the right. Top and bottom control rails use generous viewport-relative insets (4.2vw). Local shaded edge bands protect the small controls' contrast. The five-step vertical navigation represents real journey order, with the destination at the top.

At 900px, tools become icon controls. At 600px, the title moves lower, camera field of view expands, type uses a compact ramp, and the ascent instruction sits above the footer. The right-edge navigation retains all five stops. Touch input changes the gesture instruction to “Swipe down to ascend.” Safe-area insets protect the controls.

The narrative is a separate full-viewport reading surface. Its main column is capped at 700px. Native dialog behavior protects keyboard focus. No cards, tiled panels or ornamental containers interrupt the reading.

## Elevation & Depth

Depth comes from camera translation, foreground grass, architecture at multiple distances, atmospheric perspective and restrained emissive geometry. The interface uses no raised cards or decorative shadows. The active chapter marker's small surrounding ring indicates state rather than elevation.

The sky boundary consists of triangular prisms, not a picture placed over the viewport. Fracture separates, tilts and lifts the fragments in world space. Corruption preserves readable large shapes while individual cells detach. The final ring silhouette remains visible around a restrained illuminated core.

## Shapes

The world moves from irregular botanical growth to ceremonial circles, triangular shell fragments and discrete corrupted cells. Original rings and the central vertical sigil connect the chapters without reproducing a game's symbols. Interface shapes remain fine, simple strokes. Round markers indicate the chapter position; buttons stay unboxed.

## Components

### Buttons

Ghost controls use a consistent authored SVG stroke. Hover shifts toward warm gold. Keyboard focus uses a clearly offset gold outline. Sound starts muted and exposes pressed state. Motion exposes its current mode. Controls have accessible names even when visible labels disappear on compact screens.

### Navigation

Five stops ascend from I at the bottom to V at the top. The active stop has a filled marker and ring. Names appear on hover and focus. Each button has a full chapter name for assistive technology. Chapter selection scrolls the actual document.

### Ascent instruction

A narrow upward arrow and tracked gesture instruction sit near the lower center. The instruction is a working button. It disappears at the ending. Space is an additional keyboard path, never the only path.

### Narrative and recovery

The reader has the same palette, fonts and chapter sequence as the world. A full narrative is also available without JavaScript. WebGL failures show a recovery message and an obvious reading action. The quiet reading surface remains usable when 3D rendering cannot begin.

### Motion

Camera easing uses frame-rate-independent exponential damping. Grass wind, pollen, drift and slow ring motion stay secondary. There are no flashes or jitter cuts. The shell fracture is the primary motion event. Reduced motion removes ambient movement, pointer parallax and camera damping, and renders on demand. The middle chapters offer a direct “Skip to stillness” action.

## Do's and Don'ts

### Do:

- **Do** let geometry, composition and distance carry the narrative.
- **Do** keep every progression effect reversible.
- **Do** give the eye a focal point and quiet space in every chapter.
- **Do** preserve readable controls and the narrative alternative.
- **Do** inspect actual renders on desktop and compact viewports.

### Don't:

- **Don't** add dashboard panels, card grids or marketing sections.
- **Don't** obscure the world with excessive bloom or particles.
- **Don't** replace the spatial sky fracture with a screen overlay.
- **Don't** introduce rapid flashing, violent camera motion or mandatory audio.
- **Don't** use extracted game assets or recognizable proprietary symbols.
