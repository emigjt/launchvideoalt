import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {BEATMAP} from './beat/beatmap';
import {H, W} from './theme';
import {Video} from './Video';

// KeroloxMono — the only display face.
if (typeof document !== 'undefined') {
  const handle = delayRender('Loading KeroloxMono', {timeoutInMilliseconds: 120000});
  const face = new FontFace('Kerolox', `url(${staticFile('KeroloxMono-Bold.otf')}) format('opentype')`);
  // System fonts (site mock) are best-effort: never let them hold a tab hostage.
  const soft = (p: Promise<unknown>) => Promise.race([p, new Promise((r) => setTimeout(r, 4000))]);
  face
    .load()
    .then(() => {
      document.fonts.add(face);
      return soft(Promise.all([document.fonts.load('700 40px "Inter Display"'), document.fonts.load('40px Inter')]));
    })
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
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
