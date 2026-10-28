export const CHAPTERS = [
  { id: "garden", roman: "I", title: "The Garden Below", at: 0, line: "Even here, the light remembers something else.", description: "Golden grass bends beneath an ancient, luminous tree. Pale ruins stand beyond the haze. Everything is beautiful. Everything is a little too still." },
  { id: "sanctuary", roman: "II", title: "The Forgotten Sanctuary", at: 0.25, line: "No one remembers who built the way up.", description: "Broken colonnades and stone rings hang above the garden. Repetition becomes too exact to be accidental. A few pieces no longer fit." },
  { id: "veil", roman: "III", title: "The Veil", at: 0.5, line: "The heavens have a surface.", description: "The apparent sky is a vast tiled shell. Light escapes its seams. Its pieces draw apart, revealing a second, darker universe. You climb through the opening." },
  { id: "corruption", roman: "IV", title: "The Corruption", at: 0.73, line: "A world cannot forget what it is made of.", description: "Beyond the shell, fragments of architecture break into ordered cells. Crimson seams travel across a deformed grid. Matter follows a force that no longer belongs to the world below." },
  { id: "beyond", roman: "V", title: "Beyond Creation", at: 1, line: "You were never beneath the sky. You were inside it.", description: "Concentric rings turn around an immense, quiet core. The world you knew lies within a much larger construction. You may stay, or descend through the same world again." },
] as const;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

export function ascensionProgress(scrollTop: number, maxScroll: number) {
  return maxScroll > 0 ? clamp01(1 - scrollTop / maxScroll) : 0;
}

export function scrollPosition(progress: number, maxScroll: number) {
  return (1 - clamp01(progress)) * Math.max(0, maxScroll);
}

export function smoothRange(start: number, end: number, value: number) {
  const x = clamp01((value - start) / (end - start));
  return x * x * (3 - 2 * x);
}

export function chapterIndex(progress: number) {
  const p = clamp01(progress);
  if (p < 0.145) return 0;
  if (p < 0.375) return 1;
  if (p < 0.625) return 2;
  if (p < 0.87) return 3;
  return 4;
}

export function sceneState(progress: number) {
  const p = clamp01(progress);
  return {
    fracture: smoothRange(0.39, 0.62, p),
    corruption: smoothRange(0.57, 0.7, p) * (1 - smoothRange(0.8, 0.94, p)),
    night: smoothRange(0.36, 0.55, p),
    quiet: smoothRange(0.83, 1, p),
  };
}

export function seededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let n = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    n = (n + Math.imul(n ^ (n >>> 7), 61 | n)) ^ n;
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shared render-loop state. React reads only coarse chapter changes. */
export const journey = {
  target: 0,
  progress: 0,
  reducedMotion: false,
  pointerX: 0,
  pointerY: 0,
  active: true,
  ready: false,
  lowQuality: false,
  fps: 0,
  drawCalls: 0,
  geometries: 0,
  textures: 0,
  frames: 0,
};
