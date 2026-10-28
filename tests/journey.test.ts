import { describe, expect, it } from "vitest";
import { ascensionProgress, chapterIndex, CHAPTERS, sceneState, scrollPosition, seededRandom } from "../src/lib/journey";

describe("native reverse scroll", () => {
  it("starts at the bottom and ends at the top", () => {
    expect(ascensionProgress(8000, 8000)).toBe(0);
    expect(ascensionProgress(0, 8000)).toBe(1);
    expect(ascensionProgress(6000, 8000)).toBe(0.25);
  });
  it("clamps rubber-band overscroll and handles no scroll range", () => {
    expect(ascensionProgress(-300, 8000)).toBe(1);
    expect(ascensionProgress(9000, 8000)).toBe(0);
    expect(ascensionProgress(0, 0)).toBe(0);
    expect(ascensionProgress(0, -1)).toBe(0);
    expect(ascensionProgress(NaN, 100)).toBe(0);
  });
  it("maps every chapter to the same native position in both directions", () => {
    for (const chapter of CHAPTERS) {
      expect(ascensionProgress(scrollPosition(chapter.at, 9000), 9000)).toBeCloseTo(chapter.at);
    }
    expect(scrollPosition(-1, 100)).toBe(100);
    expect(scrollPosition(2, 100)).toBe(0);
  });
});

describe("reversible scene timeline", () => {
  it("identifies the five chapter stops", () => {
    CHAPTERS.forEach((chapter, i) => expect(chapterIndex(chapter.at)).toBe(i));
  });
  it("has continuous, bounded transforms and a quiet ending", () => {
    let previous = sceneState(0);
    for (let i = 1; i <= 1000; i++) {
      const current = sceneState(i / 1000);
      for (const key of Object.keys(current) as (keyof typeof current)[]) {
        expect(current[key]).toBeGreaterThanOrEqual(0);
        expect(current[key]).toBeLessThanOrEqual(1);
        expect(Math.abs(current[key] - previous[key])).toBeLessThan(0.03);
      }
      previous = current;
    }
    expect(sceneState(0).fracture).toBe(0);
    expect(sceneState(1).fracture).toBe(1);
    expect(sceneState(0.73).corruption).toBe(1);
    expect(sceneState(1).corruption).toBe(0);
    expect(sceneState(1).quiet).toBe(1);
  });
  it("returns identical geometry and effects on descent", () => {
    const ascent = Array.from({ length: 101 }, (_, i) => sceneState(i / 100));
    for (let i = 100; i >= 0; i--) expect(sceneState(i / 100)).toEqual(ascent[i]);
    const a = seededRandom(123);
    const b = seededRandom(123);
    expect(Array.from({length: 30}, a)).toEqual(Array.from({length: 30}, b));
  });
});
