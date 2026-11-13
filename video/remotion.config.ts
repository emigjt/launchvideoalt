import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
// Use the pre-installed headless shell (no download needed in this environment).
const shell = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
// eslint-disable-next-line @typescript-eslint/no-var-requires
if (require('fs').existsSync(shell)) Config.setBrowserExecutable(shell);
