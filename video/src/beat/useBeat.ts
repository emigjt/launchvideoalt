import {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';
import {BEATMAP, FPS, SectionName, lastIndexAtOrBefore} from './beatmap';

/**
 * Scenes live inside <Sequence>s, where useCurrentFrame() is relative. The beat
 * hooks need the absolute timeline, so the top-level composition provides it.
 */
export const AbsoluteFrame = createContext<number | null>(null);

export const useAbsoluteFrame = () => {
  const rel = useCurrentFrame();
  const abs = useContext(AbsoluteFrame);
  return abs ?? rel;
};

type Band = 'kick' | 'snare' | 'hat';

// Decay constants (s): kicks punch, snares snap, hats tick.
const TAU: Record<Band, number> = {kick: 0.11, snare: 0.075, hat: 0.045};

/** Exponential-decay pulse (0..1) from the most recent onsets of a band. */
const pulse = (band: Band, t: number) => {
  const {t: ts, s} = BEATMAP.onsets[band];
  const i = lastIndexAtOrBefore(ts, t);
  let v = 0;
  for (let j = i; j >= 0 && j > i - 3; j--) {
    const dt = t - ts[j];
    if (dt > 6 * TAU[band]) break;
    v = Math.max(v, (0.35 + 0.65 * s[j]) * Math.exp(-dt / TAU[band]));
  }
  return {value: v, count: i + 1, last: i >= 0 ? ts[i] : -Infinity};
};

const sample = (arr: number[], frame: number) => arr[Math.max(0, Math.min(arr.length - 1, frame))] ?? 0;

export interface BeatState {
  frame: number;
  t: number;
  /** bar index (0-based) and position inside it */
  bar: number;
  barPhase: number;
  /** beat index inside the bar (0..3) and position inside it */
  beat: number;
  beatPhase: number;
  kick: number;
  snare: number;
  hat: number;
  kickCount: number;
  snareCount: number;
  hatCount: number;
  section: SectionName;
  sectionProgress: number;
}

/** Everything rhythmic about the current frame. */
export const useBeat = (): BeatState => {
  const frame = useAbsoluteFrame();
  return beatAt(frame);
};

export const beatAt = (frame: number): BeatState => {
  const t = frame / FPS;
  const d = BEATMAP.downbeats;
  const p = BEATMAP.beatPeriod;
  const bi = Math.max(0, lastIndexAtOrBefore(d, t));
  const intoBar = Math.max(0, t - d[bi]);
  const beatF = intoBar / p;
  const k = pulse('kick', t);
  const s = pulse('snare', t);
  const h = pulse('hat', t);
  const sec = BEATMAP.sections.find((x) => t >= x.start && t < x.end) ?? BEATMAP.sections[BEATMAP.sections.length - 1];
  return {
    frame,
    t,
    bar: bi,
    barPhase: Math.min(1, intoBar / (4 * p)),
    beat: Math.min(3, Math.floor(beatF)),
    beatPhase: beatF - Math.floor(beatF),
    kick: k.value,
    snare: s.value,
    hat: h.value,
    kickCount: k.count,
    snareCount: s.count,
    hatCount: h.count,
    section: sec.name,
    sectionProgress: (t - sec.start) / (sec.end - sec.start),
  };
};

export interface EnergyState {
  /** full-band RMS envelope, 0..1 */
  energy: number;
  low: number;
  high: number;
  /** slower follower (≈0.5s) — good for glow / blur so they don't flicker */
  smooth: number;
}

export const energyAt = (frame: number): EnergyState => {
  let acc = 0;
  let n = 0;
  for (let i = frame - 30; i <= frame; i += 3) {
    acc += sample(BEATMAP.energy, i);
    n++;
  }
  return {
    energy: sample(BEATMAP.energy, frame),
    low: sample(BEATMAP.energyLow, frame),
    high: sample(BEATMAP.energyHigh, frame),
    smooth: acc / n,
  };
};

export const useEnergy = (): EnergyState => energyAt(useAbsoluteFrame());

/** How much the current section lets effects hit (intro restrained, drop max). */
export const SECTION_GAIN: Record<SectionName, number> = {intro: 0.35, build: 0.75, drop: 1.4, outro: 0.55};
