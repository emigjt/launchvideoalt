import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {beatFrame} from '../beat/beatmap';
import {beatAt, energyAt, useAbsoluteFrame} from '../beat/useBeat';
import {Backdrop} from '../fx/Backdrop';
import {Printed} from '../fx/Printed';
import {Rail} from '../fx/Rail';
import {EyeMark} from '../marks/Marks';
import {C, SAFE, SAFE_W, fit} from '../theme';
import {Line} from './Intro';
import {BrowserFrame} from './Site';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * 5. "we handle it all." — the drop. The only polarity flip in the piece:
 * concrete type on an ink field, the blade spinning behind, full-frame scale.
 */
export const Handle: React.FC<{bar: number}> = ({bar}) => {
  const f = useAbsoluteFrame();
  const at = beatFrame(bar, 0);
  const since = f - at;
  const b = beatAt(f);
  const e = energyAt(f);
  const hit = Math.exp(-Math.max(0, since) / 7);
  const zoom = 1 + 0.2 * hit + interpolate(f, [at, beatFrame(bar + 2)], [0, 0.02], clamp) + 0.02 * b.kick;
  const spin = 900 * (1 - Math.exp(-since / 40)) + since * 0.6;
  const lines = ['we', 'handle', 'it all.'];
  const sizes = lines.map((l) => fit(l, SAFE_W, 330));
  const tops = sizes.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + sizes[i - 1] * 1.02], []);
  const blockH = tops[2] + sizes[2];
  const y0 = 960 - blockH / 2 - 40;
  return (
    <AbsoluteFill>
      <Backdrop mode="ink" seed={9} drift={2} />
      <AbsoluteFill style={{transform: `scale(${zoom.toFixed(4)})`}}>
        <div style={{position: 'absolute', left: 540 - 950, top: 960 - 950, opacity: 0.55 + 0.3 * e.low, filter: `blur(${(hit * 10).toFixed(1)}px)`}}>
          <EyeMark size={1900} rotation={spin} color="#2f2e2d" bg={C.ink} />
        </div>
        {lines.map((l, i) => (
          <Line key={l} x={SAFE.left} y={y0 + tops[i]}>
            <Printed at={at} size={sizes[i]} invert slices seed={50 + i}>
              {l}
            </Printed>
          </Line>
        ))}
      </AbsoluteFill>
      <Rail invert />
      {/* the hit: a hot flash that burns off over ~8 frames */}
      <AbsoluteFill style={{backgroundColor: C.highlight, opacity: since < 0 ? 0 : 0.85 * Math.exp(-since / 3.5), mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

/** 6. "completely streamlined so you focus on making music." + the site, scrolling on the beat. */
export const Streamlined: React.FC<{bar: number; bars: number}> = ({bar, bars}) => {
  const f = useAbsoluteFrame();
  const float = Math.sin(f / 50) * 6;
  return (
    <AbsoluteFill>
      <Backdrop seed={10} />
      <Line x={SAFE.left} y={290}>
        <Printed at={beatFrame(bar, 0)} size={100} seed={60} slices>completely</Printed>
      </Line>
      <Line x={SAFE.left + 40} y={396}>
        <Printed at={beatFrame(bar, 0)} size={100} seed={61} slices>streamlined</Printed>
      </Line>
      <Line x={SAFE.left} y={530}>
        <Printed at={beatFrame(bar + 1, 0)} size={58} seed={62}>so you focus on</Printed>
      </Line>
      <Line x={SAFE.left} y={598}>
        <Printed at={beatFrame(bar + 1, 0)} size={58} seed={63}>making music.</Printed>
      </Line>
      <div style={{position: 'absolute', left: SAFE.left, top: 720 + float}}>
        <BrowserFrame bar={bar} bars={bars} />
      </div>
      <Rail />
    </AbsoluteFill>
  );
};
