import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {beatFrame} from '../beat/beatmap';
import {beatAt, useAbsoluteFrame} from '../beat/useBeat';
import {Backdrop} from '../fx/Backdrop';
import {Printed} from '../fx/Printed';
import {Rail} from '../fx/Rail';
import {EyeMark, VZN} from '../marks/Marks';
import {C, DISPLAY, LABEL, URL_TEXT} from '../theme';
import {BackgroundEye, Line} from './Intro';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 7. "let us help build your vision." — resolve and breathe; the aperture closes. */
export const BuildVision: React.FC<{bar: number}> = ({bar}) => {
  const f = useAbsoluteFrame();
  const s = 124;
  const x = 90;
  return (
    <AbsoluteFill>
      <Backdrop seed={12} drift={0.5} />
      <BackgroundEye
        opacity={0.92}
        size={760}
        left={400}
        top={1110}
        blink={interpolate(f, [beatFrame(bar, 1), beatFrame(bar + 1)], [0, 0.9], {...clamp, easing: (v) => v * v})}
        spin={0.6}
      />
      <Line x={x} y={430}>
        <Printed at={beatFrame(bar, 0)} size={s} seed={70}>let us help</Printed>
      </Line>
      <Line x={x + 50} y={430 + s * 1.08}>
        <Printed at={beatFrame(bar, 1)} size={s} seed={71}>build your</Printed>
      </Line>
      <Line x={x + 20} y={430 + s * 2.16}>
        <Printed at={beatFrame(bar, 1)} size={s} seed={72}>vision.</Printed>
      </Line>
      <Rail />
    </AbsoluteFill>
  );
};

/** 8. End card — lockup + tagline + CTA + URL. Holds to the end of the track. */
export const EndCard: React.FC<{bar: number}> = ({bar}) => {
  const f = useAbsoluteFrame();
  const b = beatAt(f);
  const at = beatFrame(bar, 0);
  const center = (w: number) => 540 - w / 2;
  const ctaW = 560;
  return (
    <AbsoluteFill>
      <Backdrop seed={14} drift={0.4} />
      {/* poster's vertical label, left edge */}
      <div
        style={{
          position: 'absolute',
          left: 66,
          top: 360,
          transformOrigin: 'left top',
          transform: 'rotate(90deg)',
          fontFamily: DISPLAY,
          fontSize: 34,
          letterSpacing: '0.18em',
          color: C.ink,
          opacity: interpolate(f, [at, at + 12], [0, 0.9], clamp),
          whiteSpace: 'nowrap',
        }}
      >
        VISION STUDIOS
      </div>
      <div style={{position: 'absolute', left: center(300), top: 270}}>
        <Printed at={at} size={180} seed={80} gain={1.2}>
          <EyeMark size={300} rotation={(f - at) * 0.35} blink={interpolate(f, [at, at + 14], [1, 0], clamp)} />
        </Printed>
      </div>
      <div style={{position: 'absolute', left: center(540), top: 620}}>
        <Printed at={at} size={180} seed={81} gain={1.2}>
          <VZN width={540} />
        </Printed>
      </div>
      <Line x={center(15 * 0.64 * 78)} y={890}>
        <Printed at={beatFrame(bar, 1)} size={78} seed={82}>Vision Studios:</Printed>
      </Line>
      <Line x={center(24 * 0.64 * 50)} y={990}>
        <Printed at={beatFrame(bar, 1.5)} size={50} seed={83}>your sound. your vision.</Printed>
      </Line>
      <div style={{position: 'absolute', left: center(ctaW), top: 1110}}>
        <Printed at={beatFrame(bar, 2)} size={90} seed={84} gain={0.8}>
          <div
            style={{
              width: ctaW,
              height: 100,
              background: 'currentColor',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 26,
            }}
          >
            <span style={{fontFamily: DISPLAY, fontSize: 44, letterSpacing: '0.03em', color: C.concrete}}>Book a session</span>
            <svg width="40" height="26" viewBox="0 0 40 26" style={{transform: `translateX(${(b.kick * 6).toFixed(1)}px)`}}>
              <path d="M0,10 L28,10 L28,0 L40,13 L28,26 L28,16 L0,16 Z" fill={C.concrete} />
            </svg>
          </div>
        </Printed>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1250,
          width: 1080,
          textAlign: 'center',
          fontFamily: LABEL,
          fontSize: 26,
          letterSpacing: '0.3em',
          color: C.ink,
          opacity: interpolate(f, [beatFrame(bar, 3), beatFrame(bar, 3) + 8], [0, 1], clamp),
        }}
      >
        {URL_TEXT.toUpperCase()}
      </div>
    </AbsoluteFill>
  );
};
