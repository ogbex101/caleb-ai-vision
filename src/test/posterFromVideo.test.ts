import { describe, it, expect } from "vitest";
import { posterDimensions, posterTimestamp } from "@/lib/posterFromVideo";

describe("posterTimestamp", () => {
  it("samples a quarter in, past the black or logo frames an edit opens on", () => {
    expect(posterTimestamp(40)).toBe(10);
    expect(posterTimestamp(8)).toBe(2);
  });

  it("caps how far in it reaches, so a long film is not slow to seek", () => {
    expect(posterTimestamp(600)).toBe(10);
  });

  it("samples the middle of a very short clip, staying inside the file", () => {
    expect(posterTimestamp(2)).toBe(1);
    expect(posterTimestamp(1)).toBe(0.5);
  });

  it("returns 0 rather than NaN when the duration is unknown", () => {
    expect(posterTimestamp(NaN)).toBe(0);
    expect(posterTimestamp(Infinity)).toBe(0);
    expect(posterTimestamp(0)).toBe(0);
    expect(posterTimestamp(-5)).toBe(0);
  });
});

describe("posterDimensions", () => {
  it("leaves anything already small enough alone", () => {
    expect(posterDimensions(1280, 720)).toEqual({ width: 1280, height: 720 });
  });

  it("fits a 4K frame inside the cap without distorting it", () => {
    expect(posterDimensions(3840, 2160)).toEqual({ width: 1600, height: 900 });
  });

  it("caps the long edge of a vertical frame, not the width", () => {
    expect(posterDimensions(2160, 3840)).toEqual({ width: 900, height: 1600 });
  });

  it("returns zeroes for a file with no video track", () => {
    expect(posterDimensions(0, 0)).toEqual({ width: 0, height: 0 });
  });
});
