import React from 'react';
import {Easing, interpolate} from 'remotion';
import {BEATMAP, beatFrame} from '../beat/beatmap';
import {beatAt, energyAt, useAbsoluteFrame} from '../beat/useBeat';
import {EyeMark} from '../marks/Marks';
import {C, LABEL, SAFE_W, SITE_DISPLAY, SITE_UI, URL_TEXT} from '../theme';

/**
 * Stylized rebuild of the Vision Studios site (from the client's screenshots):
 * the hero, then the "Sound" section with beat cards. Rendered at the site's
 * 2000px desktop width and scaled into a floating browser window.
 */

const SITE_W = 2000;
const VIEW_W = SAFE_W; // 840
const VIEW_H = 640;
const SCALE = VIEW_W / SITE_W;

const BEATS = [
  {name: 'Angel Feathers', bpm: 114, len: '0:34', seed: 3},
  {name: 'Wanderer', bpm: 122, len: '0:32', seed: 7},
  {name: 'Topspin', bpm: 130, len: '0:30', seed: 11},
  {name: 'Two Step', bpm: 128, len: '0:30', seed: 5},
];

const r = (s: number) => {
  const x = Math.sin(s * 91.3 + 7.1) * 1e4;
  return x - Math.floor(x);
};

const Card: React.FC<{i: number; active: boolean; progress: number}> = ({i, active, progress}) => {
  const bt = BEATS[i];
  const bars = 44;
  return (
    <div style={{position: 'absolute', left: 600 + i * 389, top: 0, width: 356}}>
      <div
        style={{
          position: 'relative',
          width: 356,
          height: 356,
          background: 'radial-gradient(circle at 75% 80%, #3a393a, #262526 60%)',
          outline: active ? `3px solid ${C.siteInk}` : 'none',
        }}
      >
        <div style={{position: 'absolute', left: 8, top: 10, fontFamily: SITE_UI, fontSize: 13, color: '#bdbab5'}}>{bt.name.toUpperCase()}</div>
        {Array.from({length: bars}, (_, j) => {
          const h = 20 + r(bt.seed * 100 + j) * (j > bars * 0.45 ? 100 : 50);
          const played = active && j / bars < progress;
          return (
            <div
              key={j}
              style={{
                position: 'absolute',
                left: 50 + j * 5.9,
                top: 178 - h / 2,
                width: 3,
                height: h,
                background: played ? '#ffffff' : active ? '#8a8885' : '#d8d6d1',
              }}
            />
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: 12,
            bottom: 12,
            padding: '8px 15px',
            border: `1.5px solid ${C.siteInk}`,
            borderRadius: 30,
            fontFamily: SITE_UI,
            fontSize: 16,
            color: active ? C.siteBg : C.siteInk,
            background: active ? C.siteInk : 'transparent',
          }}
        >
          {active ? 'PLAYING' : 'PLAY'}
        </div>
      </div>
      <div style={{marginTop: 14, fontFamily: SITE_UI, fontSize: 16, color: '#bdbab5'}}>{`${bt.bpm} BPM · ${bt.len}`}</div>
      <div style={{marginTop: 6, fontFamily: SITE_DISPLAY, fontWeight: 700, fontSize: 26, color: C.siteInk}}>{bt.name}</div>
    </div>
  );
};

const SitePage: React.FC<{active: boolean; progress: number; frame: number}> = ({active, progress, frame}) => (
  <div style={{position: 'relative', width: SITE_W, height: 3000, background: C.siteBg, color: C.siteInk, overflow: 'hidden'}}>
    {/* HERO */}
    <div style={{position: 'absolute', left: 50, top: 50, color: C.siteInk}}>
      <EyeMark size={66} color={C.siteInk} bg={C.siteBg} rotation={frame * 0.3} />
    </div>
    <div style={{position: 'absolute', left: 1000 - 420, top: 140, opacity: 0.32, filter: 'blur(26px)'}}>
      <EyeMark size={840} color="#4a494a" bg={C.siteBg} rotation={frame * 0.15} />
    </div>
    <div
      style={{
        position: 'absolute',
        top: 390,
        width: SITE_W,
        textAlign: 'center',
        fontFamily: SITE_DISPLAY,
        fontWeight: 700,
        fontSize: 196,
        letterSpacing: '-0.035em',
      }}
    >
      Vision Studios
    </div>
    <div style={{position: 'absolute', top: 598, width: SITE_W, textAlign: 'center', fontFamily: SITE_DISPLAY, fontWeight: 700, fontSize: 50, letterSpacing: '-0.02em'}}>
      your sound. your vision.
    </div>
    {[
      ['WORK', 853, 718, 2],
      ['SHOP', 958, 702, -3],
      ['CONTACT', 1060, 716, 2],
    ].map(([t, x, y, rot]) => (
      <div key={t as string} style={{position: 'absolute', left: x as number, top: y as number, transform: `rotate(${rot}deg)`, fontFamily: SITE_UI, fontSize: 19}}>
        {t}
      </div>
    ))}
    {[
      ['AUDIO', 48],
      ['©2026', 966],
      ['VISUAL', 1886],
    ].map(([t, x]) => (
      <div key={t as string} style={{position: 'absolute', left: x as number, top: 1010, fontFamily: SITE_UI, fontSize: 18, color: '#bdbab5'}}>
        {t}
      </div>
    ))}
    {/* SOUND */}
    <div style={{position: 'absolute', top: 1080, left: 0, width: SITE_W, height: 1220}}>
      <div style={{position: 'absolute', left: 48, top: 46}}>
        <EyeMark size={62} color={C.siteInk} bg={C.siteBg} />
      </div>
      {[
        ['Work', 1446],
        ['Shop', 1588],
        ['Contact', 1726],
      ].map(([t, x]) => (
        <div key={t as string} style={{position: 'absolute', left: x as number, top: 50, fontFamily: SITE_DISPLAY, fontWeight: 700, fontSize: 40}}>
          {t}
        </div>
      ))}
      <div style={{position: 'absolute', left: 44, top: 412, fontFamily: SITE_UI, fontSize: 20, color: '#bdbab5'}}>01 / 02</div>
      <div style={{position: 'absolute', left: 38, top: 450, fontFamily: SITE_DISPLAY, fontWeight: 800, fontSize: 150, letterSpacing: '-0.04em'}}>Sound</div>
      <div style={{position: 'absolute', left: 44, top: 660, fontFamily: SITE_UI, fontSize: 22, lineHeight: 1.4, color: '#cfccc7'}}>
        Beats made in the studio.
        <br />
        Press play on any cover.
      </div>
      <div style={{position: 'absolute', left: 515, top: 330, width: 1, height: 420, background: '#5a5958'}} />
      <div style={{position: 'absolute', left: 485, top: 320, fontFamily: SITE_UI, fontSize: 14, transform: 'rotate(-90deg)', color: '#bdbab5'}}>07</div>
      <div style={{position: 'absolute', left: 474, top: 720, fontFamily: SITE_UI, fontSize: 14, transform: 'rotate(-90deg)', color: '#bdbab5'}}>BEAT</div>
      <div style={{position: 'absolute', left: 0, top: 330, width: SITE_W, height: 600}}>
        {BEATS.map((_, i) => (
          <Card key={i} i={i} active={active && i === 1} progress={progress} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 48, top: 1060, fontFamily: SITE_UI, fontSize: 17}}>
        WORK&nbsp;&nbsp;&nbsp;SOUND &nbsp;———————————————————&nbsp; VISUAL
      </div>
    </div>
  </div>
);

/** Floating browser window, restyled into the poster palette; page scrolls on beats. */
export const BrowserFrame: React.FC<{bar: number; bars: number}> = ({bar, bars}) => {
  const f = useAbsoluteFrame();
  const b = beatAt(f);
  const e = energyAt(f);
  // scroll stops, one per beat across the scene (site px)
  const stops = [0, 60, 120, 200, 1080, 1110, 1140, 1170, 1240, 1240, 1240, 1240].slice(0, bars * 4);
  let y = 0;
  for (let n = 0; n < stops.length; n++) {
    const fb = beatFrame(bar + Math.floor(n / 4), n % 4);
    const prev = n === 0 ? 0 : stops[n - 1];
    const k = interpolate(f, [fb, fb + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
    if (f >= fb) y = prev + (stops[n] - prev) * k;
  }
  const activeAt = beatFrame(bar + 2, 0);
  const active = f >= activeAt;
  const progress = b.t / BEATMAP.duration;
  const punch = 1 + 0.012 * b.kick;
  // hero moment: last bar pushes in on the Wanderer card (this very beat), stepping on beats
  const zoomBar = bar + 2;
  let zoom = 1;
  for (let k = 0; k < 4; k++) {
    const fb = beatFrame(zoomBar, k);
    const z = interpolate(f, [fb, fb + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
    zoom += z * [0.55, 0.12, 0.12, 0.12][k];
  }
  // focus point: Wanderer card centre in site px
  const fx = 1167;
  const fy = 1080 + 330 + 200;
  const appear = interpolate(f, [beatFrame(bar, 0) - 8, beatFrame(bar, 0)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'relative', width: VIEW_W, transform: `scale(${punch.toFixed(4)})`, opacity: appear}}>
      {/* poster echo-shadow: striped ghost of the window */}
      <div
        style={{
          position: 'absolute',
          left: -26,
          top: 12,
          width: VIEW_W,
          height: VIEW_H + 46,
          background: C.shadow,
          WebkitMaskImage: 'repeating-linear-gradient(180deg, #000 0 2px, transparent 2px 4px)',
          maskImage: 'repeating-linear-gradient(180deg, #000 0 2px, transparent 2px 4px)',
        }}
      />
      <div style={{position: 'relative', background: '#2a2929', border: '1px solid #3a3938', boxShadow: `0 0 ${(10 + e.smooth * 30).toFixed(0)}px rgba(35,34,34,0.45)`}}>
        <div style={{height: 46, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 9}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{width: 12, height: 12, borderRadius: 6, background: i === 0 ? C.highlight : '#5a5857'}} />
          ))}
          <div
            style={{
              marginLeft: 70,
              flex: 1,
              height: 26,
              borderRadius: 13,
              background: '#1f1e1e',
              color: '#a3a09d',
              fontFamily: LABEL,
              fontSize: 13,
              letterSpacing: '0.12em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {URL_TEXT}
          </div>
          <div style={{width: 120}} />
        </div>
        <div style={{position: 'relative', width: VIEW_W, height: VIEW_H, overflow: 'hidden'}}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transformOrigin: `${(fx * SCALE).toFixed(1)}px ${((fy - y) * SCALE).toFixed(1)}px`,
              // as it zooms, also travel so the card ends centred in the window
              transform: `translate(${((zoom - 1) / 0.91 * (VIEW_W / 2 - fx * SCALE)).toFixed(1)}px, ${((zoom - 1) / 0.91 * (VIEW_H / 2 - (fy - y) * SCALE)).toFixed(1)}px) scale(${zoom.toFixed(4)})`,
              width: VIEW_W,
              height: VIEW_H,
            }}
          >
          <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${SCALE}) translateY(${-y}px)`}}>
            <SitePage active={active} progress={progress} frame={f} />
          </div>
          </div>
          {/* scroll indicator ticks on beats */}
          <div style={{position: 'absolute', right: 6, top: 8 + (y / 1220) * (VIEW_H - 80), width: 4, height: 60, borderRadius: 2, background: '#6b6968'}} />
        </div>
      </div>
    </div>
  );
};
