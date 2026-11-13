import React from 'react';
import {BEATMAP} from '../beat/beatmap';
import {beatAt, useAbsoluteFrame} from '../beat/useBeat';
import {C, LABEL} from '../theme';

/**
 * Motif 3 — the rail. The poster's vertical label, turned into a live strip down
 * the left edge: 16 bar ticks (one per bar of the beat), the current one filling
 * with the bar; hats nudge it. Small, quiet, secondary.
 */
export const Rail: React.FC<{invert?: boolean; label?: string}> = ({invert = false, label}) => {
  const f = useAbsoluteFrame();
  const b = beatAt(f);
  const n = BEATMAP.downbeats.length;
  const top = 330;
  const len = 1100;
  const col = invert ? C.shadow : C.ink;
  const dim = invert ? '#4c4a48' : C.shadow;
  const jitter = b.hat * 1.5;
  return (
    <div style={{position: 'absolute', left: 38, top, width: 40, height: len, transform: `translateX(${jitter.toFixed(1)}px)`}}>
      <div style={{position: 'absolute', left: 6, top: 0, width: 1, height: len, background: dim}} />
      {Array.from({length: n}, (_, i) => {
        const y = (i / (n - 1)) * (len - 140) + 140;
        const done = i < b.bar;
        const cur = i === b.bar;
        const w = cur ? 6 + 16 * b.barPhase : done ? 14 : 6;
        return <div key={i} style={{position: 'absolute', left: 0, top: y, width: w, height: 3, background: done || cur ? col : dim}} />;
      })}
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: 880,
          transformOrigin: 'left top',
          transform: 'rotate(90deg) translateY(-22px)',
          fontFamily: LABEL,
          fontSize: 17,
          letterSpacing: '0.32em',
          color: col,
          whiteSpace: 'nowrap',
        }}
      >
        {String(b.bar + 1).padStart(2, '0')}/{n} {label ?? b.section.toUpperCase()}
      </div>
    </div>
  );
};
