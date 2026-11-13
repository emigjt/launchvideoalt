import React from 'react';
import {C} from '../theme';

/** VZN wordmark, redrawn from the poster (see ART_DIRECTION.md). viewBox 642×252. */
export const VZN_PATH =
  'M0,0 L64,0 L117,112 L170,0 L566,0 Q642,0 642,52 L642,252 L581,252 L581,64 Q581,53 570,53 L483,53 L483,252 L203,252 L203,197 L337,53 L210,53 L124,250 L110,250 Z M297,198 L420,198 L420,66 Z';

/** Split into V / Z / N so the mark can "form" stroke by stroke. */
export const VZN_PARTS = {
  v: 'M0,0 L64,0 L117,112 L170,0 L238,0 L210,53 L124,250 L110,250 Z',
  z: 'M232,0 L483,0 L483,252 L203,252 L203,197 L337,53 L210,53 Z M297,198 L420,198 L420,66 Z',
  n: 'M478,0 L566,0 Q642,0 642,52 L642,252 L581,252 L581,64 Q581,53 570,53 L483,53 L483,252 L478,252 Z',
};

export const VZN: React.FC<{width: number; reveal?: {v: number; z: number; n: number}}> = ({width, reveal}) => {
  const h = (width * 252) / 642;
  return (
    <svg width={width} height={h} viewBox="0 0 642 252" style={{display: 'block', overflow: 'visible'}}>
      {reveal ? (
        <>
          <path d={VZN_PARTS.v} fill="currentColor" fillRule="evenodd" style={{clipPath: `inset(0 0 ${100 - reveal.v * 100}% 0)`}} />
          <path d={VZN_PARTS.z} fill="currentColor" fillRule="evenodd" style={{clipPath: `inset(0 ${100 - reveal.z * 100}% 0 0)`}} />
          <path d={VZN_PARTS.n} fill="currentColor" fillRule="evenodd" style={{clipPath: `inset(${100 - reveal.n * 100}% 0 0 0)`}} />
        </>
      ) : (
        <path d={VZN_PATH} fill="currentColor" fillRule="evenodd" />
      )}
    </svg>
  );
};

/** Saw-blade eye (poster + site logo). Geometry generated; unit radius 100. */
const bladePath = (() => {
  const N = 13;
  const R = 100;
  const r = 64;
  const step = (Math.PI * 2) / N;
  const p = (a: number, rad: number) => `${(Math.cos(a) * rad).toFixed(2)},${(Math.sin(a) * rad).toFixed(2)}`;
  let d = `M${p(0, r)}`;
  for (let i = 0; i < N; i++) {
    const a0 = i * step;
    const tip = a0 + step * 0.92;
    const a1 = a0 + step;
    // concave sweep out to a hooked tip, then a short convex return
    d += ` Q${p(a0 + step * 0.62, r * 1.02)} ${p(tip, R)}`;
    d += ` Q${p(a1 - step * 0.02, r * 1.18)} ${p(a1, r)}`;
  }
  return d + ' Z';
})();

export const EyeMark: React.FC<{size: number; rotation?: number; color?: string; bg?: string; blink?: number}> = ({
  size,
  rotation = 0,
  color = 'currentColor',
  bg = C.concrete,
  blink = 0,
}) => {
  const open = 1 - blink;
  return (
    <svg width={size} height={size} viewBox="-104 -104 208 208" style={{display: 'block', overflow: 'visible'}}>
      <g transform={`rotate(${rotation})`}>
        <path d={bladePath} fill={color} />
      </g>
      {/* almond eye */}
      <path d={`M-52,0 Q0,${-46 * open} 52,0 Q0,${46 * open} -52,0 Z`} fill={bg} />
      <ellipse cx="0" cy="0" rx="17" ry={Math.max(0.5, 24 * open)} fill={color} />
      <ellipse cx="0" cy="0" rx="6.5" ry={Math.max(0.2, 12 * open)} fill={bg} />
    </svg>
  );
};
