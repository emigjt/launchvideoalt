// Typed access to public/beatmap.json (produced by analysis/analyze_beat.py).
// Nothing in the video hardcodes a timestamp: everything is derived from here.
import raw from '../../public/beatmap.json';

export type SectionName = 'intro' | 'build' | 'drop' | 'outro';

export interface Section {
  name: SectionName;
  start: number;
  end: number;
  startBar: number;
  endBar: number;
}

interface OnsetBand {
  t: number[];
  s: number[];
}

export interface BeatMap {
  fps: number;
  duration: number;
  durationInFrames: number;
  bpm: number;
  beatPeriod: number;
  beats: number[];
  downbeats: number[];
  onsets: {kick: OnsetBand; snare: OnsetBand; hat: OnsetBand};
  energy: number[];
  energyLow: number[];
  energyHigh: number[];
  sections: Section[];
}

export const BEATMAP = raw as unknown as BeatMap;
export const FPS = BEATMAP.fps;

export const toFrame = (t: number) => Math.round(t * FPS);

/** Time (s) of beat `k` (0-based, may be fractional) inside bar `bar`. */
export const beatTime = (bar: number, k = 0) => {
  const d = BEATMAP.downbeats;
  const base = bar < d.length ? d[bar] : d[d.length - 1] + (bar - d.length + 1) * 4 * BEATMAP.beatPeriod;
  return base + k * BEATMAP.beatPeriod;
};

export const beatFrame = (bar: number, k = 0) => toFrame(beatTime(bar, k));

export const section = (name: SectionName): Section => {
  const s = BEATMAP.sections.find((x) => x.name === name);
  if (!s) throw new Error(`No section ${name} in beatmap.json`);
  return s;
};

/** Absolute bar index of `offset` bars into a section. */
export const sectionBar = (name: SectionName, offset = 0) => section(name).startBar + offset;

/** Largest index i with arr[i] <= t, or -1. */
export const lastIndexAtOrBefore = (arr: number[], t: number) => {
  let lo = 0;
  let hi = arr.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= t) {
      ans = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return ans;
};
