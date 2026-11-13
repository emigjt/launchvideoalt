// Renders key-moment stills, computed from beatmap.json (no hardcoded times).
// Usage: node scripts/stills.mjs [outDir]
import {execFileSync} from 'node:child_process';
import {readFileSync, mkdirSync} from 'node:fs';

const bm = JSON.parse(readFileSync(new URL('../public/beatmap.json', import.meta.url)));
const out = process.argv[2] ?? 'out/stills';
mkdirSync(out, {recursive: true});
const sec = (n) => bm.sections.find((s) => s.name === n);
const bt = (bar, k = 0) => Math.round((bm.downbeats[bar] + k * bm.beatPeriod) * bm.fps);
const keys = {
  '01-intro-line1': bt(0, 3.2),
  '02-intro-vzn-forms': bt(2, 3),
  '03-build-whatever': bt(sec('build').startBar, 2.5),
  '04-build-service-mixing': bt(sec('build').startBar + 2, 2.2),
  '05-build-service-cover': bt(sec('build').startBar + 3, 2.2),
  '06-drop-hit': bt(sec('drop').startBar, 0) + 6,
  '07-drop-handle-hold': bt(sec('drop').startBar, 2.5),
  '08-drop-site': bt(sec('drop').startBar + 4, 1.5),
  '09-outro-let-us-help': bt(sec('outro').startBar, 3),
  '10-end-card': bt(sec('outro').startBar + 2, 2),
};
const only = process.env.ONLY?.split(',');
for (const [name, frame] of Object.entries(keys)) {
  if (only && !only.some((o) => name.startsWith(o))) continue;
  console.log(name, frame, (frame / bm.fps).toFixed(2) + 's');
  execFileSync('npx', ['remotion', 'still', 'VisionLaunch', `${out}/${name}.png`, `--frame=${frame}`, '--log=error'], {stdio: 'inherit'});
}
