import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {BEATMAP} from './beat/beatmap';
import {H, W} from './theme';
import {Video} from './Video';
import {KEROLOX_B64} from './fonts/kerolox';

// KeroloxMono — the only display face. Loaded from embedded bytes (no network),
// and every wait is capped so a busy render tab can never stall on fonts.
if (typeof document !== 'undefined') {
  const handle = delayRender('Loading KeroloxMono', {timeoutInMilliseconds: 60000});
  let done = false;
  const finish = () => {
    if (!done) {
      done = true;
      continueRender(handle);
    }
  };
  const bin = atob(KEROLOX_B64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const face = new FontFace('Kerolox', bytes.buffer);
  const cap = (p: Promise<unknown>, ms: number) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
  cap(
    face.load().then(() => {
      document.fonts.add(face);
      return cap(Promise.all([document.fonts.load('700 40px "Inter Display"'), document.fonts.load('40px Inter')]), 3000);
    }),
    10000,
  )
    .catch((err) => console.error(err))
    .finally(finish);
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
