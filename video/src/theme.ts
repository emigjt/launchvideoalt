// Palette sampled from 1.png — see ART_DIRECTION.md
export const C = {
  ink: '#232222',
  inkSoft: '#343333',
  shadow: '#777471',
  concrete: '#928f8b',
  paper: '#a3a09d',
  highlight: '#b6b3b0',
  // the website's own colours (from the screenshots), only used inside the browser mock
  siteBg: '#1c1b1c',
  siteInk: '#e8e6e1',
};

export const W = 1080;
export const H = 1920;

/**
 * Safe zone for IG Reels / TikTok: top 250 (status + header), bottom 420
 * (caption + CTA bar), right 150 (action rail), left 90.
 */
export const SAFE = {top: 250, bottom: H - 420, left: 90, right: W - 150};
export const SAFE_W = SAFE.right - SAFE.left; // 840
export const SAFE_H = SAFE.bottom - SAFE.top; // 1250

export const DISPLAY = 'Kerolox, monospace';
export const LABEL = '"JetBrains Mono", "DejaVu Sans Mono", ui-monospace, monospace';
export const SITE_DISPLAY = '"Inter Display", Inter, sans-serif';
export const SITE_UI = 'Inter, sans-serif';

/** KeroloxMono advance is 0.62em; we track +0.02em. */
export const ADVANCE = 0.64;

/** Largest font size (px) at which `text` fits `width`, capped at `max`. */
export const fit = (text: string, width = SAFE_W, max = 220) =>
  Math.floor(Math.min(max, width / (text.length * ADVANCE)));

// End-card URL: placeholder until the real one is confirmed (one-line swap).
export const URL_TEXT = 'visionstudios.co';
