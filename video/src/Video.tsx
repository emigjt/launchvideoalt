import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BEATMAP, SectionName, beatFrame, section, sectionBar} from './beat/beatmap';
import {AbsoluteFrame, SECTION_GAIN, beatAt} from './beat/useBeat';
import {FilmLayer} from './fx/Backdrop';
import {Handle, Streamlined} from './scenes/Drop';
import {Line1, Line2} from './scenes/Intro';
import {Service, Whatever} from './scenes/Build';
import {BuildVision, EndCard} from './scenes/Outro';

/**
 * The story, mapped onto the detected sections. Each entry starts on a downbeat
 * (`offset` bars into its section) and runs until the next entry → every cut
 * lands on a downbeat, and nothing here is a timestamp.
 */
type Entry = {id: string; sec: SectionName; offset: number; render: (bar: number, bars: number) => React.ReactNode};

const STORY: Entry[] = [
  {id: '1 every artist', sec: 'intro', offset: 0, render: (bar) => <Line1 bar={bar} />},
  {id: '2 at Vision Studios', sec: 'intro', offset: 1, render: (bar) => <Line2 bar={bar} />},
  {id: '3 whatever you need', sec: 'build', offset: 0, render: (bar) => <Whatever bar={bar} />},
  ...[0, 1, 2, 3].map((i) => ({
    id: `4.${i + 1} service`,
    sec: 'build' as const,
    offset: 1 + i,
    render: (bar: number) => <Service bar={bar} index={i} last={i === 3} />,
  })),
  {id: '5 we handle it all', sec: 'drop', offset: 0, render: (bar) => <Handle bar={bar} />},
  {id: '6 streamlined + site', sec: 'drop', offset: 2, render: (bar, bars) => <Streamlined bar={bar} bars={bars} />},
  {id: '7 let us help', sec: 'outro', offset: 0, render: (bar) => <BuildVision bar={bar} />},
  {id: '8 end card', sec: 'outro', offset: 1, render: (bar) => <EndCard bar={bar} />},
];

const TIMELINE = STORY.map((e, i) => {
  const bar = sectionBar(e.sec, e.offset);
  const next = STORY[i + 1];
  const nextBar = next ? sectionBar(next.sec, next.offset) : BEATMAP.downbeats.length;
  if (e.offset >= section(e.sec).endBar - section(e.sec).startBar) {
    throw new Error(`Story entry "${e.id}" doesn't fit in section ${e.sec} — check beatmap.json sections`);
  }
  const from = i === 0 ? 0 : beatFrame(bar);
  const to = next ? beatFrame(nextBar) : BEATMAP.durationInFrames;
  return {...e, bar, bars: nextBar - bar, from, to};
});

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const b = beatAt(frame);
  // global kick bump on the whole camera (small, eased-out by the decay)
  const cam = 1 + 0.008 * b.kick * SECTION_GAIN[b.section];
  return (
    <AbsoluteFrame.Provider value={frame}>
      <AbsoluteFill style={{backgroundColor: '#232222', overflow: 'hidden'}}>
        <AbsoluteFill style={{transform: `scale(${cam.toFixed(4)})`}}>
          {TIMELINE.map((e) => (
            <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.to - e.from}>
              {e.render(e.bar, e.bars)}
            </Sequence>
          ))}
        </AbsoluteFill>
        <FilmLayer />
        <Audio src={staticFile('wanderer.wav')} />
      </AbsoluteFill>
    </AbsoluteFrame.Provider>
  );
};
