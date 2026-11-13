import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {beatFrame} from '../beat/beatmap';
import {beatAt, useAbsoluteFrame} from '../beat/useBeat';
import {Backdrop} from '../fx/Backdrop';
import {Printed} from '../fx/Printed';
import {Rail} from '../fx/Rail';
import {EyeMark, VZN} from '../marks/Marks';
import {C, DISPLAY, SAFE} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Line: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: DISPLAY, letterSpacing: '0.02em'}}>{children}</div>
);

/** Motif 2 — the aperture, idling in the background: bleeds off the right edge like the poster. */
export const BackgroundEye: React.FC<{opacity: number; blink: number; spin?: number; size?: number; left?: number; top?: number}> = ({
  opacity,
  blink,
  spin = 1,
  size = 900,
  left = 470,
  top = 1080,
}) => {
  const f = useAbsoluteFrame();
  return (
    <div style={{position: 'absolute', left, top, opacity, color: C.ink}}>
      <EyeMark size={size} rotation={(f / 60) * 6 * spin} blink={blink} bg={C.concrete} />
    </div>
  );
};

/** 1. "every artist has a vision." — builds out of noise and light. */
export const Line1: React.FC<{bar: number}> = ({bar}) => {
  const f = useAbsoluteFrame();
  const t0 = beatFrame(bar, 0);
  // the light comes up over the first beat and a half
  const light = interpolate(f, [0, beatFrame(bar, 1.6)], [0, 1], clamp);
  const r = light * 120;
  const s = 184;
  const x = SAFE.left;
  return (
    <AbsoluteFill>
      <Backdrop seed={1} drift={0.6} />
      <BackgroundEye opacity={0.16 * light} blink={0.9 - 0.3 * light} />
      <Line x={x} y={400}>
        <Printed at={t0} size={s} soft seed={2}>every</Printed>
      </Line>
      <Line x={x + 50} y={400 + s * 1.04}>
        <Printed at={beatFrame(bar, 1)} size={s} seed={3}>artist</Printed>
      </Line>
      <Line x={x + 120} y={400 + s * 2.08}>
        <Printed at={beatFrame(bar, 1.5)} size={s} seed={4}>has a</Printed>
      </Line>
      <Line x={x + 10} y={400 + s * 3.12}>
        <Printed at={beatFrame(bar, 2)} size={s} seed={5}>vision.</Printed>
      </Line>
      {/* darkness + noise opening into light */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 60% at 45% 40%, transparent ${r}%, rgba(26,25,25,0.97) ${r + 45}%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 60% 45% at 45% 40%, rgba(182,179,176,0.9), transparent 70%)',
          mixBlendMode: 'screen',
          opacity: interpolate(f, [0, beatFrame(bar, 0.8), beatFrame(bar, 2.5)], [0, 0.45, 0.06], clamp),
        }}
      />
      <Rail />
    </AbsoluteFill>
  );
};

/** 2. "at Vision Studios, we bring that vision to life." — the VZN mark forms. */
export const Line2: React.FC<{bar: number}> = ({bar}) => {
  const f = useAbsoluteFrame();
  const x = SAFE.left;
  const markBar = bar + 1;
  const part = (k: number) => interpolate(f, [beatFrame(markBar, k), beatFrame(markBar, k) + 9], [0, 1], clamp);
  const reveal = {v: part(0), z: part(1), n: part(2)};
  const b = beatAt(f);
  return (
    <AbsoluteFill>
      <Backdrop seed={2} drift={0.6} />
      <BackgroundEye opacity={0.12} blink={interpolate(f, [beatFrame(bar), beatFrame(bar + 2)], [0.65, 0.35], clamp)} />
      <Line x={x} y={330}>
        <Printed at={beatFrame(bar, 0)} size={72} seed={7}>at Vision Studios,</Printed>
      </Line>
      <Line x={x + 30} y={330 + 96}>
        <Printed at={beatFrame(bar, 1)} size={96} seed={8}>we bring that</Printed>
      </Line>
      <Line x={x} y={330 + 96 + 112}>
        <Printed at={beatFrame(bar, 2)} size={87} seed={9}>vision to life.</Printed>
      </Line>
      <div style={{position: 'absolute', left: x + 30, top: 820}}>
        <Printed at={beatFrame(markBar, 0)} size={200} seed={10} gain={1.3}>
          <VZN width={740} reveal={reveal} />
        </Printed>
      </div>
      {/* a hairline under the mark that charges across the bar it forms in */}
      <div
        style={{
          position: 'absolute',
          left: x + 40,
          top: 1160,
          height: 3,
          width: 740 * (b.bar === markBar ? b.barPhase : b.bar > markBar ? 1 : 0),
          background: C.ink,
          opacity: 0.8,
        }}
      />
      <Rail />
    </AbsoluteFill>
  );
};
