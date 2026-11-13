# Vision Studios — Art Direction

Source of truth: `1.png` (1080×1920 poster, "EVERY ARTIST HAS A VZN").
Every frame of the launch video should look like it was cut out of this poster.

## Palette (sampled from the poster)

The poster is **monochrome**: mean chroma ≈ 5/255, so there's effectively zero saturation.
It's warm-grey concrete and printer's ink. **No accent colour.** Contrast and texture do the
work colour normally would.

| Token        | Hex       | Share | Use |
|--------------|-----------|-------|-----|
| `ink`        | `#232222` | 21%   | All type, VZN mark, eye/sun mark. Never pure black. |
| `ink-soft`   | `#343333` | 4%    | Ink highlights / grain speckle inside solid shapes |
| `shadow`     | `#777471` | 20%   | Scanline echo-shadows, background ornament, stars |
| `concrete`   | `#928f8b` | 40%   | Base paper / background field |
| `paper`      | `#a3a09d` | 15%   | Lighter mottling in the concrete |
| `highlight`  | `#b6b3b0` | <1%   | Rare hot-spots: flash frames, glow cores |

Rules:
- Background is never flat: concrete (`#928f8b`) mottled toward `#777471` / `#a3a09d`.
- Ink on concrete is the default polarity. **Inversion** (concrete type on an ink field) is
  saved for the drop, so the polarity flip itself becomes the big move.
- Glow, when the energy envelope pushes it, is a grey bloom (`#b6b3b0`), not a colour.
  Chromatic aberration is the one place a trace of RGB fringe is allowed, and it stays
  ≤ 3px and desaturated so it reads as a print-registration error, not neon.

## Texture / grain

- **Concrete grain**: heavy, fine-grained noise across the whole frame (σ ≈ 40 on 0–255 in
  flat areas). It also sits *on top of* the ink: the black shapes are speckled with
  `#343333` flecks, as if screen-printed.
- **Ornament underlayer**: faint baroque filigree / tattoo-flash scrollwork and soft
  **4-point stars** printed in `shadow` at ~25–35% opacity behind everything. It's never
  in focus and never competes with type.
- **Signal tear**: the edges of the ink shapes have *vertical hairline tears*. Thin
  1–3px vertical streaks stick out above and below horizontal edges, like VHS dropout
  or a scanner dragging. This is the poster's signature detail.
- **Scanline echo**: every glyph has a ghost copy offset ~30px left (and a few px down),
  filled with *horizontal stripes* (≈3px period) in `shadow`. It's a misregistered,
  interlaced drop-shadow.

## Composition habits

- **Stacked, oversized type**: one or two words per line, set nearly full-width, tight
  leading (~1.05). Lines are left-aligned but *staggered*: each line starts at a
  different x, so the block steps diagonally ("EVERY" far left, "ARTIST" indented,
  "HAS A" further right, "VZN" pushed right).
- **Type is image**: the type block takes up the top ~45% of the frame. There's no
  separate "headline + body"; the type *is* the composition.
- **Vertical label**: "VISION STUDIOS" runs rotated 90° clockwise along the left edge,
  small (~6% width), wide-tracked. It's the poster's quiet secondary register.
- **Big emblem bleeding off-frame**: the saw-blade eye mark sits lower right, cropped by
  the right edge. Things are allowed to bleed off-canvas.
- **Negative space is concrete**, not emptiness: large areas carry only grain and ornament.

## Type treatment

- **KeroloxMono Bold** is the only display face: geometric, squared, monospaced, with
  flat terminals.
- Poster uses caps plus a custom **crossbar-less "Λ" A** and the **VZN** ligature mark (Z and N
  fused, with a triangular counter). Both are redrawn as SVG for the video; the font's own
  A is used elsewhere.
- Copy in the video is **lowercase as specified** (the font has full lowercase). Caps are
  reserved for service names (MUSIC PRODUCTION etc.), which echo the poster's all-caps
  headline.
- All display type gets the poster's **signal-tear + scanline-echo** treatment.
- Small secondary labels (URL, bar counters, meter labels) use a system mono
  (`ui-monospace`/`DejaVu Sans Mono`) at small size, wide-tracked, in `shadow` or `ink`.

## Mood

Underground, tactile, analogue-digital. It feels like a flyer wheat-pasted to a concrete
wall, then scanned on a broken scanner. Confident and quiet. It doesn't shout with
colour; it hits with **scale and contrast**. Premium because it's restrained.
Think "independent label merch drop" rather than "tech startup".

## Translating the poster into motion

1. **Motion is printing, not floating.** Things don't fade or slide gently. They
   *register in*: the scanline echo arrives first, then the ink slams into place on top.
   Exits are tears and cuts.
2. **The grain is alive.** Grain re-rolls on hats; tear streaks flicker on hats; the
   scanline echo's offset nudges on snares.
3. **One big polarity flip.** Concrete-on-ink inversion happens only at the drop.
4. **Rhythm of emptiness.** Between hits, the frame drops back to concrete and ornament.
   The negative space between hits is what makes them land.
