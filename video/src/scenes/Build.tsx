import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {BEATMAP, FPS, beatFrame} from '../beat/beatmap';
import {beatAt, energyAt, useAbsoluteFrame} from '../beat/useBeat';
import {Backdrop} from '../fx/Backdrop';
import {Printed} from '../fx/Printed';
import {Rail} from '../fx/Rail';
import {EyeMark, VZN} from '../marks/Marks';
import {C, DISPLAY, LABEL, SAFE, SAFE_W, fit} from '../theme';
import {BackgroundEye, Line} from './Intro';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 3. "whatever you need." — one beat of empty concrete first, so it lands like a question. */
export const Whatever: React.FC<{bar: number}> = ({bar}) => {
  const s = 136;
  const at = beatFrame(bar, 1);
  return (
    <AbsoluteFill>
      <Backdrop seed={3} />
      <BackgroundEye opacity={0.14} blink={0.3} spin={1.5} />
      <Line x={SAFE.left} y={700}>
        <Printed at={at} size={s} seed={11}>whatever</Printed>
      </Line>
      <Line x={SAFE.left + 40} y={700 + s * 1.08}>
        <Printed at={at} size={s} seed={12}>you need.</Printed>
      </Line>
      <Rail />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- motifs

type Layer = 'graphic' | 'labels';

const Label: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{fontFamily: LABEL, fontSize: 20, letterSpacing: '0.28em', color: C.ink, whiteSpace: 'nowrap', visibility: 'visible', ...style}}>{children}</div>
);

/** MUSIC PRODUCTION — the beat's own waveform scrolling under a playhead. */
const Waveform: React.FC<{layer: Layer}> = ({layer}) => {
  const f = useAbsoluteFrame();
  const N = 56;
  const w = SAFE_W;
  const bw = w / N;
  return (
    <div style={{position: 'relative', width: w, height: 420}}>
      {Array.from({length: N}, (_, j) => {
        const fr = f + Math.round((j - N / 2) * 0.07 * FPS);
        const e = BEATMAP.energy[Math.max(0, Math.min(BEATMAP.energy.length - 1, fr))] ?? 0;
        const h = 8 + e * e * 380;
        const played = j <= N / 2;
        return (
          <div
            key={j}
            style={{
              position: 'absolute',
              left: j * bw + bw * 0.22,
              top: 210 - h / 2,
              width: bw * 0.56,
              height: h,
              background: played ? C.ink : C.shadow,
            }}
          />
        );
      })}
      <div style={{position: 'absolute', left: w / 2 + bw * 0.5, top: -20, width: 2, height: 460, background: C.ink}} />
      {layer === 'labels' && <Label style={{position: 'absolute', left: 0, top: 452}}>{`${Math.round(BEATMAP.bpm)} BPM`}</Label>}
      {layer === 'labels' && <Label style={{position: 'absolute', right: 0, top: 452}}>WANDERER</Label>}
    </div>
  );
};

/** MIXING & MASTERING — segmented meters riding the energy envelope. */
const Meters: React.FC<{layer: Layer}> = ({layer}) => {
  const f = useAbsoluteFrame();
  const e = energyAt(f);
  const peak = (k: number) => {
    let m = 0;
    for (let i = f - 40; i <= f; i += 2) m = Math.max(m, k === 0 ? energyAt(i).low : k === 1 ? energyAt(i).energy : energyAt(i).high);
    return m;
  };
  const vals = [e.low, e.energy, Math.min(1, e.energy * 0.92 + 0.03), e.high];
  const names = ['LOW', 'L', 'R', 'AIR'];
  const SEG = 26;
  const colW = 130;
  const gap = (SAFE_W - colW * 4) / 3;
  return (
    <div style={{position: 'relative', width: SAFE_W, height: 470}}>
      {vals.map((v, c) => {
        const lit = Math.round(v * SEG);
        const pk = Math.round(peak(c === 2 ? 1 : c === 3 ? 2 : c) * SEG);
        return (
          <div key={c} style={{position: 'absolute', left: c * (colW + gap), top: 0, width: colW, height: 420}}>
            {Array.from({length: SEG}, (_, s) => (
              <div
                key={s}
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: s * (420 / SEG),
                  width: colW,
                  height: 420 / SEG - 5,
                  background: s < lit || s === pk - 1 ? C.ink : 'rgba(119,116,113,0.45)',
                }}
              />
            ))}
            {layer === 'labels' && <Label style={{position: 'absolute', left: 0, top: 482}}>{names[c]}</Label>}
          </div>
        );
      })}
    </div>
  );
};

/** COVER ART — a cover frame with crop marks; the artwork swaps on snares. */
const CoverFrame: React.FC<{layer: Layer}> = ({layer}) => {
  const f = useAbsoluteFrame();
  const b = beatAt(f);
  const S = 500;
  const variant = b.snareCount % 3;
  const mark = (x: number, y: number, r: number) => (
    <div style={{position: 'absolute', left: x, top: y, width: 44, height: 44, transform: `rotate(${r}deg)`}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 44, height: 2, background: C.ink}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 2, height: 44, background: C.ink}} />
    </div>
  );
  return (
    <div style={{position: 'relative', width: SAFE_W, height: 560}}>
      <div style={{position: 'absolute', left: (SAFE_W - S) / 2, top: 10, width: S, height: S, background: C.ink, overflow: 'hidden'}}>
        {variant === 0 ? (
          <div style={{position: 'absolute', left: 40, top: 40}}>
            <EyeMark size={420} rotation={f * 0.4} color={C.concrete} bg={C.ink} />
          </div>
        ) : variant === 1 ? (
          <div style={{position: 'absolute', left: 50, top: 170, color: C.concrete}}>
            <VZN width={400} />
          </div>
        ) : (
          <div style={{position: 'absolute', inset: 0, color: C.concrete, fontFamily: DISPLAY, fontSize: 120, lineHeight: 0.95, padding: 34}}>
            <div>EVERY</div>
            <div>ARTIST</div>
          </div>
        )}
        <div style={{position: 'absolute', left: 22, bottom: 18, fontFamily: LABEL, fontSize: 16, letterSpacing: '0.3em', color: C.shadow}}>
          {`VZN-00${variant + 1}`}
        </div>
      </div>
      {mark((SAFE_W - S) / 2 - 30, -20, 0)}
      {mark((SAFE_W + S) / 2 + 30 - 44, -20, 90)}
      {mark((SAFE_W - S) / 2 - 30, S + 40 - 44, -90)}
      {mark((SAFE_W + S) / 2 + 30 - 44, S + 40 - 44, 180)}
      {layer === 'labels' && <Label style={{position: 'absolute', left: (SAFE_W - S) / 2, top: S + 50}}>3000 × 3000</Label>}
      {layer === 'labels' && <Label style={{position: 'absolute', right: (SAFE_W - S) / 2, top: S + 50}}>{`0${variant + 1} / 03`}</Label>}
    </div>
  );
};

const TEE =
  'M150,0 L230,0 Q260,40 300,40 Q340,40 370,0 L450,0 L600,110 L540,210 L470,170 L470,520 L130,520 L130,170 L60,210 L0,110 Z';

/** MERCHANDISING — tee silhouette, VZN printed on the chest; sways on hats. */
const Tee: React.FC<{layer: Layer}> = ({layer}) => {
  const f = useAbsoluteFrame();
  const b = beatAt(f);
  const sway = Math.sin(f / 22) * 1.2 + b.hat * 0.8;
  const print = b.snareCount % 2;
  return (
    <div style={{position: 'relative', width: SAFE_W, height: 560}}>
      <div style={{position: 'absolute', left: (SAFE_W - 600) / 2, top: 10, transform: `rotate(${sway.toFixed(2)}deg)`, transformOrigin: '50% 0%'}}>
        <svg width={600} height={520} viewBox="0 0 600 520">
          <path d={TEE} fill={C.ink} />
        </svg>
        <div style={{position: 'absolute', left: 300 - 130, top: 120, color: C.concrete}}>
          {print === 0 ? <VZN width={260} /> : <div style={{marginLeft: 50}}><EyeMark size={160} color={C.concrete} bg={C.ink} rotation={f * 0.5} /></div>}
        </div>
      </div>
      {layer === 'labels' && <Label style={{position: 'absolute', left: 0, top: 540}}>VZN — TEE / 001</Label>}
      {layer === 'labels' && <Label style={{position: 'absolute', right: 0, top: 540}}>BLACK · XL</Label>}
    </div>
  );
};

export const SERVICES = [
  {lines: ['MUSIC', 'PRODUCTION'], motif: Waveform},
  {lines: ['MIXING &', 'MASTERING'], motif: Meters},
  {lines: ['COVER', 'ART'], motif: CoverFrame},
  {lines: ['MERCH-', 'ANDISING'], motif: Tee},
] as const;

/** 4. Service reveals — one per bar. Kinetic caps + its own motif. */
export const Service: React.FC<{bar: number; index: number; last: boolean}> = ({bar, index, last}) => {
  const f = useAbsoluteFrame();
  const svc = SERVICES[index];
  const at = beatFrame(bar, 0);
  const size = Math.min(150, ...svc.lines.map((l) => fit(l, SAFE_W - 40, 170)));
  const Motif = svc.motif;
  // build tightening: motif arrives on beat 2, earlier as the build goes on
  const motifAt = beatFrame(bar, index < 2 ? 1 : 0.5);
  const motifIn = interpolate(f, [motifAt - 6, motifAt], [0, 1], clamp);
  // last service: the aperture rushes the frame on the final beat → drop
  const irisStart = beatFrame(bar, 3);
  const irisEnd = beatFrame(bar + 1, 0);
  const iris = last ? interpolate(f, [irisStart, irisEnd], [0, 1], clamp) : 0;
  const irisSize = 120 + Math.pow(iris, 3.2) * 5200;
  return (
    <AbsoluteFill>
      <Backdrop seed={4 + index} drift={1.4} />
      <Label style={{position: 'absolute', left: SAFE.left, top: 300}}>{`0${index + 1} / 04 — WHAT WE DO`}</Label>
      {svc.lines.map((l, i) => (
        <Line key={l} x={SAFE.left + i * 40} y={350 + i * size * 1.06}>
          <Printed at={at} size={size} seed={20 + index * 3 + i} slices gain={1 + index * 0.15}>
            {l}
          </Printed>
        </Line>
      ))}
      <div style={{position: 'absolute', left: SAFE.left, top: 880, opacity: motifIn, transform: `translateY(${(1 - motifIn) * 30}px)`}}>
        <Printed at={motifAt} size={130} seed={40 + index} gain={0.8}>
          <Motif layer="graphic" />
        </Printed>
        {/* labels pass: graphic hidden, labels (visibility: visible) stay crisp */}
        <div style={{position: 'absolute', left: 0, top: 0, visibility: 'hidden'}}>
          <Motif layer="labels" />
        </div>
      </div>
      <Rail />
      {iris > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 540 - irisSize / 2,
            top: 960 - irisSize / 2,
            color: C.ink,
          }}
        >
          <EyeMark size={irisSize} rotation={iris * 220} bg={C.ink} blink={1} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
