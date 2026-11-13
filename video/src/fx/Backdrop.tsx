import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {SECTION_GAIN, beatAt, energyAt, useAbsoluteFrame} from '../beat/useBeat';
import {C} from '../theme';

/** Concrete (or ink) plate with the poster's ornament layer; drifts very slowly. */
export const Backdrop: React.FC<{mode?: 'concrete' | 'ink'; drift?: number; seed?: number}> = ({
  mode = 'concrete',
  drift = 1,
  seed = 0,
}) => {
  const f = useAbsoluteFrame();
  const ox = -160 + Math.sin(f / 240 + seed) * 30 * drift - (seed % 3) * 40;
  const oy = -240 + Math.cos(f / 300 + seed) * 40 * drift - (seed % 5) * 30;
  return (
    <AbsoluteFill style={{backgroundColor: mode === 'ink' ? C.ink : C.concrete, overflow: 'hidden'}}>
      <Img
        src={staticFile(mode === 'ink' ? 'tex/ink.jpg' : 'tex/concrete.jpg')}
        style={{position: 'absolute', left: ox, top: oy, width: 1400, height: 2400}}
      />
    </AbsoluteFill>
  );
};

/**
 * Top-of-stack film layer: grain (re-rolled on hats), scanlines (jitter on hats),
 * a light vignette, and snare flashes. Intensity follows section + energy.
 */
export const FilmLayer: React.FC<{flashGain?: number}> = ({flashGain = 1}) => {
  const f = useAbsoluteFrame();
  const b = beatAt(f);
  const e = energyAt(f);
  const g = SECTION_GAIN[b.section];
  const tile = b.hatCount % 6;
  const gx = (b.hatCount * 137) % 512;
  const gy = (b.hatCount * 271 + (f % 2) * 64) % 512;
  const scanY = (b.hatCount % 4) + b.hat * 2;
  const flash = b.section === 'intro' ? 0 : Math.min(0.32, b.snare * 0.2 * g * flashGain);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile(`tex/grain${tile}.png`)})`,
          backgroundSize: '512px 512px',
          backgroundPosition: `${gx}px ${gy}px`,
          mixBlendMode: 'overlay',
          opacity: 0.55 + 0.25 * b.hat,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(180deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 4px)',
          transform: `translateY(${scanY.toFixed(1)}px)`,
          opacity: 0.6 + 0.4 * e.high,
        }}
      />
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse 80% 65% at 50% 45%, transparent 55%, rgba(20,19,19,0.38) 100%)'}}
      />
      {flash > 0.01 ? <AbsoluteFill style={{backgroundColor: C.highlight, mixBlendMode: 'screen', opacity: flash}} /> : null}
    </AbsoluteFill>
  );
};
