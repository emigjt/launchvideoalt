import React, {CSSProperties} from 'react';
import {interpolate} from 'remotion';
import {SECTION_GAIN, beatAt, energyAt, useAbsoluteFrame} from '../beat/useBeat';
import {C} from '../theme';

/**
 * The poster's print treatment, applied to any type or mark:
 *  - scanline echo: striped ghost copy offset left/down (arrives first)
 *  - signal tear: vertically stretched copies masked to hairlines (VHS dropout)
 *  - ink: the solid copy, which slams in on its beat
 * Kicks: tiny scale punch. Snares: echo jolt + optional glitch slices.
 * Hats: tear hairlines shift (tracking). Energy: chromatic fringe + glow.
 */

const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const tearMask = (seed: number, density = 22, period = 337) => {
  const stops: string[] = [];
  const xs = Array.from({length: density}, (_, i) => rand(seed * 31 + i) * period).sort((a, b) => a - b);
  let last = 0;
  for (const x of xs) {
    const w = 0.8 + rand(seed + x) * 2.2;
    if (x < last) continue;
    stops.push(`transparent ${last.toFixed(1)}px`, `transparent ${x.toFixed(1)}px`, `#000 ${x.toFixed(1)}px`, `#000 ${(x + w).toFixed(1)}px`);
    last = x + w;
  }
  stops.push(`transparent ${last.toFixed(1)}px`, `transparent ${period}px`);
  return {image: `linear-gradient(90deg, ${stops.join(', ')})`, size: `${period}px 100%`};
};

const STRIPES = 'repeating-linear-gradient(180deg, #000 0px, #000 2px, transparent 2px, transparent 4px)';

export interface PrintedProps {
  children: React.ReactNode;
  /** absolute frame the ink lands on (a beat) */
  at: number;
  /** absolute frame it disappears (exclusive); optional */
  until?: number;
  /** font size in px (echo/tear scale with it) */
  size: number;
  invert?: boolean;
  /** soft = fades up out of the light (intro); default slams */
  soft?: boolean;
  slices?: boolean;
  seed?: number;
  style?: CSSProperties;
  className?: string;
  /** scale multiplier for all reactive motion */
  gain?: number;
}

export const Printed: React.FC<PrintedProps> = ({
  children,
  at,
  until,
  size,
  invert = false,
  soft = false,
  slices = false,
  seed = 1,
  style,
  gain = 1,
}) => {
  const frame = useAbsoluteFrame();
  const since = frame - at;
  if (since < -10) return null;
  if (until !== undefined && frame >= until) return null;

  const b = beatAt(frame);
  const e = energyAt(frame);
  const g = SECTION_GAIN[b.section] * gain;

  const ink = invert ? C.concrete : C.ink;
  const echoCol = invert ? '#4c4a48' : C.shadow;

  // registration: echo first (10f pre-roll), then ink lands on the beat
  const echoIn = interpolate(since, [-10, -2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const echoTravel = interpolate(since, [-10, 0], [2.2, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const inkOp = soft
    ? interpolate(since, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : since >= 0
      ? 1
      : 0;
  const slam = soft ? 0 : Math.exp(-Math.max(0, since) / 3.2) * (since >= 0 ? 1 : 0);
  const inkScale = 1 + 0.07 * slam * Math.min(1.4, g + 0.3);
  const inkBlur = soft ? interpolate(since, [0, 18], [6, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : slam * 3;

  const kickScale = 1 + 0.012 * b.kick * g;
  const ex = (-0.2 - 0.06 * b.snare * g) * size * echoTravel;
  const ey = 0.035 * size;

  const ca = Math.min(invert ? 2.2 : 3, (0.25 + e.smooth * 2.3) * Math.min(1.3, g));
  const glow = e.smooth * (invert ? 12 : 18) * Math.min(1, g);
  const filter = [
    `drop-shadow(${ca.toFixed(2)}px 0 0 rgba(140,62,52,0.42))`,
    `drop-shadow(${(-ca).toFixed(2)}px 0 0 rgba(48,86,104,0.42))`,
    glow > 1 ? `drop-shadow(0 0 ${glow.toFixed(1)}px rgba(182,179,176,${invert ? 0.42 : 0.22}))` : '',
    inkBlur > 0.2 ? `blur(${inkBlur.toFixed(2)}px)` : '',
  ].join(' ');

  const mA = tearMask(seed);
  const mB = tearMask(seed + 7, 14, 263);
  const track = (b.hatCount * 53 + seed * 17) % 337;
  const trackB = (b.hatCount * 29 + seed * 11) % 263;

  const layer: CSSProperties = {position: 'absolute', inset: 0, whiteSpace: 'pre'};

  const sliceOn = slices && b.snare > 0.28 && since > 2;
  const main = sliceOn ? (
    [0, 1, 2, 3].map((i) => {
      const top = i * 25;
      const dx = (rand(b.snareCount * 7 + i) - 0.5) * 0.18 * size * b.snare * g;
      return (
        <div key={i} style={{...layer, position: i === 0 ? 'relative' : 'absolute', clipPath: `inset(${top}% 0 ${100 - top - 25}% 0)`, transform: `translateX(${dx.toFixed(1)}px)`}}>
          {children}
        </div>
      );
    })
  ) : (
    <div style={{position: 'relative', whiteSpace: 'pre'}}>{children}</div>
  );

  return (
    <div style={{position: 'relative', fontSize: size, lineHeight: 1, color: ink, transform: `scale(${kickScale})`, ...style}}>
      {/* scanline echo */}
      <div
        style={{
          ...layer,
          color: echoCol,
          opacity: echoIn,
          transform: `translate(${ex.toFixed(1)}px, ${ey.toFixed(1)}px)`,
          WebkitMaskImage: STRIPES,
          maskImage: STRIPES,
        }}
      >
        {children}
      </div>
      {/* signal tear (two lengths) */}
      {[
        {m: mA, s: 1.12, x: track, o: invert ? 0.7 : 0.95},
        {m: mB, s: 1.2, x: trackB, o: invert ? 0.5 : 0.8},
      ].map(({m, s, x, o}, i) => (
        <div
          key={i}
          style={{
            ...layer,
            opacity: inkOp * o,
            transform: `scale(${inkScale}, ${(inkScale * s).toFixed(3)})`,
            WebkitMaskImage: m.image,
            maskImage: m.image,
            WebkitMaskSize: m.size,
            maskSize: m.size,
            WebkitMaskPosition: `${x}px 0`,
            maskPosition: `${x}px 0`,
          }}
        >
          {children}
        </div>
      ))}
      {/* ink */}
      <div style={{position: 'relative', opacity: inkOp, transform: `scale(${inkScale})`, filter}}>{main}</div>
    </div>
  );
};
