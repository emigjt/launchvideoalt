import React from 'react';
import {Composition} from 'remotion';
import {BEATMAP} from './beat/beatmap';
import {H, W} from './theme';
import {Video} from './Video';
import {KEROLOX_B64} from './fonts/kerolox';

// KeroloxMono — the only display face. Install KeroloxMono-Bold.otf as a system
// font for rendering (Chrome then has it natively, nothing to wait on). As a
// fallback, the embedded bytes are registered here; binary FontFaces are parsed
// immediately, so no delayRender (a blocked render tab can't stall on it).
if (typeof document !== 'undefined') {
  try {
    const bin = atob(KEROLOX_B64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const face = new FontFace('Kerolox', bytes.buffer);
    document.fonts.add(face);
    face.load().catch((err) => console.error(err));
  } catch (err) {
    console.error(err);
  }
}

export const Root: React.FC = () => (
  <Composition
    id="VisionLaunch"
    component={Video}
    durationInFrames={BEATMAP.durationInFrames}
    fps={BEATMAP.fps}
    width={W}
    height={H}
  />
);
