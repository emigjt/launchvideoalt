#!/usr/bin/env python3
"""Beat analysis for the Vision Studios launch video.

Usage: python3 analysis/analyze_beat.py "wanderer master1.wav" video/public/beatmap.json

Exports:
  bpm, beats, downbeats (bar grid), onsets split by band (kick / snare / hat),
  RMS energy per video frame at 60fps (normalized 0..1, plus per-band envelopes),
  and section boundaries (intro / build / drop / outro) snapped to downbeats.
"""
import json
import sys

import librosa
import numpy as np
import scipy.signal as sps

FPS = 60
SR = 44100
HOP = 512

src = sys.argv[1] if len(sys.argv) > 1 else "wanderer master1.wav"
dst = sys.argv[2] if len(sys.argv) > 2 else "beatmap.json"

y, sr = librosa.load(src, sr=SR, mono=True)
duration = len(y) / sr
n_frames = int(round(duration * FPS))

# ---------------------------------------------------------------- tempo / beats
onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=HOP)
tempo, beat_frames = librosa.beat.beat_track(
    onset_envelope=onset_env, sr=sr, hop_length=HOP, start_bpm=122, tightness=200
)
tempo = float(np.atleast_1d(tempo)[0])
beat_times = librosa.frames_to_time(beat_frames, sr=sr, hop_length=HOP)

# Build a clean, evenly spaced grid from a least-squares fit of the tracked beats
# (the track is quantized, so a straight grid is more accurate than raw tracking).
idx = np.arange(len(beat_times))
period, offset = np.polyfit(idx, beat_times, 1)
bpm = 60.0 / period
# extend grid backwards/forwards to cover the whole file
first = offset - period * np.floor(offset / period)
grid = np.arange(first, duration, period)

# ---------------------------------------------------------------- band onsets
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=HOP))
freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
t_spec = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=HOP)


def band_flux(lo, hi):
    m = (freqs >= lo) & (freqs < hi)
    b = np.log1p(S[m] * 10)
    flux = np.maximum(0, np.diff(b, axis=1, prepend=b[:, :1])).sum(0)
    flux = flux / (flux.max() + 1e-9)
    return flux


def pick(flux, thresh, min_gap):
    dist = max(1, int(min_gap * sr / HOP))
    # adaptive threshold: local median + fixed delta
    med = sps.medfilt(flux, 31)
    peaks, props = sps.find_peaks(flux, height=med + thresh, distance=dist)
    return t_spec[peaks], flux[peaks]


kick_flux = band_flux(30, 150)
snare_flux = band_flux(1500, 5000) * 0.6 + band_flux(180, 400) * 0.4
hat_flux = band_flux(7000, 16000)

kick_t, kick_s = pick(kick_flux, 0.18, 0.18)
snare_t, snare_s = pick(snare_flux, 0.16, 0.18)
hat_t, hat_s = pick(hat_flux, 0.10, 0.07)


# snares: keep only transients on/near the off-beats grid positions is too strict for
# all genres; instead drop snare candidates that coincide with a strong kick and
# have weak mid content (kick bleed).
def dedupe(times, strengths, against, tol=0.03, keep_ratio=1.15):
    out_t, out_s = [], []
    for t, s in zip(times, strengths):
        if np.any(np.abs(against - t) < tol) and s < keep_ratio * 0.5:
            continue
        out_t.append(t)
        out_s.append(s)
    return np.array(out_t), np.array(out_s)


snare_t, snare_s = dedupe(snare_t, snare_s, kick_t)


def norm(s):
    return (s / (s.max() + 1e-9)).round(3).tolist() if len(s) else []


# ---------------------------------------------------------------- energy (per video frame)
frame_hop = sr // FPS  # 735 samples = exactly one video frame
rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=frame_hop, center=True)[0]
rms = rms[:n_frames]
if len(rms) < n_frames:
    rms = np.pad(rms, (0, n_frames - len(rms)), mode="edge")
rms_db = librosa.amplitude_to_db(rms, ref=np.max)
energy = np.clip((rms_db + 40) / 40, 0, 1)  # -40dB..0dB -> 0..1
# light smoothing (≈100ms) so it reads as an envelope, not jitter
energy = np.convolve(energy, np.ones(6) / 6, mode="same")


def band_env(lo, hi):
    m = (freqs >= lo) & (freqs < hi)
    e = S[m].mean(0)
    e = np.interp(np.arange(n_frames) / FPS, t_spec, e)
    e = librosa.amplitude_to_db(e + 1e-9, ref=np.max)
    return np.clip((e + 40) / 40, 0, 1)



# ---------------------------------------------------------------- downbeats / bars
# Per-bar features need a bar phase. For each of the 4 possible phases, measure how
# sharply the bar-level low+high energy jumps at its biggest change; the true bar
# phase puts that jump exactly on a bar line, so it scores highest. Override with
# BAR_PHASE=n if needed.
import os

low_band = band_env(30, 120)
hi_band = band_env(2000, 6000)


def bar_series(bounds):
    feats = []
    for i, d in enumerate(bounds):
        end = bounds[i + 1] if i + 1 < len(bounds) else min(duration, d + 4 * period)
        a, b = int(d * FPS), max(int(d * FPS) + 1, int(end * FPS))
        feats.append([
            energy[a:b].mean(),
            low_band[a:b].mean(),
            hi_band[a:b].mean(),
            float(np.mean(low_band[a:b] > 0.55)),
            ((kick_t >= d) & (kick_t < end)).sum(),
            ((snare_t >= d) & (snare_t < end)).sum(),
            ((hat_t >= d) & (hat_t < end)).sum(),
        ])
    return np.array(feats)


notes = []
phase_scores = []
for ph in range(4):
    db = grid[ph::4]
    f = bar_series(db)
    lift = f[:, 1] + f[:, 2]
    phase_scores.append(float(np.max(np.diff(lift))) if len(lift) > 1 else 0.0)
# Primary rule: a mastered, loop-based beat starts on bar 1, so the bar phase is the
# grid beat nearest the first audible onset. The jump score is only a cross-check
# (an 808 pickup a beat before the drop can make a misaligned bar score as high).
# (first audible sample, not onset_env: onset strength cannot see an attack at frame 0)
first_onset = float(np.argmax(np.abs(y) > 0.01) / sr)
start_phase = int(np.argmin(np.abs(grid[:4] - first_onset)))
phase = int(os.environ.get("BAR_PHASE", start_phase))
if int(np.argmax(phase_scores)) != phase:
    notes.append(
        f"bar phase {phase} taken from file start ({first_onset:.2f}s); the jump heuristic "
        f"preferred phase {int(np.argmax(phase_scores))} (scores {[round(x, 3) for x in phase_scores]})"
    )
downbeats = grid[phase::4]
if downbeats[0] > 0.25 * period and downbeats[0] - 4 * period > -0.25 * period:
    downbeats = np.concatenate([[max(0.0, downbeats[0] - 4 * period)], downbeats])
n_bars = len(downbeats)
bf = bar_series(downbeats)
bar_lift = bf[:, 1] + bf[:, 2]          # low-end + presence: what a "drop" adds
bar_energy = bf[:, 0]
fz = (bf[:, :4] - bf[:, :4].mean(0)) / (bf[:, :4].std(0) + 1e-9)
novelty = np.r_[0, np.linalg.norm(np.diff(fz, axis=0), axis=1)]

# ---------------------------------------------------------------- sections
# DROP: biggest bar-to-bar lift (not in the first or last 2 bars)
jump = np.r_[0, np.diff(bar_lift)]
cand = np.arange(2, n_bars - 2)
drop_bar = int(cand[np.argmax(jump[cand])])

# OUTRO: last "break" bar after the drop (sustained low-end falls below the
# post-drop median). Falls back to the last 2 bars.
post = np.arange(drop_bar + 1, n_bars)
post_med = np.median(bf[post, 3]) if len(post) else 0
breaks = [b for b in post if bf[b, 3] < 0.7 * post_med and b <= n_bars - 2]
outro_bar = int(breaks[-1]) if breaks else n_bars - 2
if not breaks:
    notes.append("no post-drop break found: outro = last 2 bars")

# BUILD: first pre-drop bar where energy rises clearly above the intro level.
pre = bar_lift[:drop_bar]
build_bar = None
if len(pre) >= 3 and pre.std() > 0.08:
    base = pre[:2].mean()
    rising = [b for b in range(2, drop_bar) if pre[b] > base + 1.5 * pre.std()]
    build_bar = rising[0] if rising else None
if build_bar is None:
    BUILD_BARS = int(os.environ.get("BUILD_BARS", 5))
    build_bar = max(1, drop_bar - BUILD_BARS)
    notes.append(
        f"pre-drop energy is flat (bar-lift std {pre.std():.3f}): no detectable ramp, so the "
        f"build is placed by phrase = {BUILD_BARS} bars before the drop (BUILD_BARS env)"
    )

sections = [
    {"name": "intro", "start": 0.0, "startBar": 0},
    {"name": "build", "start": float(downbeats[build_bar]), "startBar": int(build_bar)},
    {"name": "drop", "start": float(downbeats[drop_bar]), "startBar": drop_bar},
    {"name": "outro", "start": float(downbeats[outro_bar]), "startBar": outro_bar},
]
for i, s in enumerate(sections):
    s["end"] = sections[i + 1]["start"] if i + 1 < len(sections) else duration
    s["endBar"] = sections[i + 1]["startBar"] if i + 1 < len(sections) else n_bars

out = {
    "fps": FPS,
    "duration": round(duration, 4),
    "durationInFrames": n_frames,
    "bpm": round(bpm, 3),
    "trackedBpm": round(tempo, 3),
    "beatPeriod": round(period, 5),
    "beats": [round(float(t), 4) for t in grid],
    "downbeats": [round(float(t), 4) for t in downbeats],
    "downbeatPhase": phase,
    "notes": notes,
    "onsets": {
        "kick": {"t": kick_t.round(4).tolist(), "s": norm(kick_s)},
        "snare": {"t": snare_t.round(4).tolist(), "s": norm(snare_s)},
        "hat": {"t": hat_t.round(4).tolist(), "s": norm(hat_s)},
    },
    "energy": energy.round(3).tolist(),
    "energyLow": low_band.round(3).tolist(),
    "energyHigh": hi_band.round(3).tolist(),
    "sections": sections,
    "barStats": [
        {"bar": i, "t": round(float(downbeats[i]), 3), "energy": round(float(bar_energy[i]), 3),
         "lift": round(float(bar_lift[i]), 3), "lowSustain": round(float(bf[i, 3]), 3),
         "novelty": round(float(novelty[i]), 3), "isBreak": bool(i in breaks)}
        for i in range(n_bars)
    ],
}
with open(dst, "w") as f:
    json.dump(out, f)

# ---------------------------------------------------------------- summary
print(f"file           : {src}")
print(f"duration       : {duration:.2f}s  ({n_frames} frames @ {FPS}fps)")
print(f"BPM            : {bpm:.2f}  (librosa tracked {tempo:.2f}; file tag says 122)")
print(f"beat period    : {period*1000:.1f} ms   bar = {period*4:.3f}s")
print(f"beats / bars   : {len(grid)} beats, {n_bars} downbeats (phase {phase}), first downbeat {downbeats[0]:.3f}s")
print("sections:")
for s in sections:
    print(f"  {s['name']:<6} {s['start']:6.2f}s -> {s['end']:6.2f}s   (bar {s['startBar']}, {s['end']-s['start']:.2f}s)")
print(f"hits           : kick {len(kick_t)}, snare/clap {len(snare_t)}, hat {len(hat_t)}")
print(f"bar phase      : {phase}  (jump scores per phase {[round(x,3) for x in phase_scores]})")
for n in notes:
    print(f"note           : {n}")
print("per-bar  (E = rms, lift = low+presence, lowSus = sustained-808 coverage)")
for i in range(n_bars):
    tag = next((s["name"].upper() for s in sections if s["startBar"] == i), "")
    if i in breaks: tag = (tag + " (break)").strip()
    k, sn, h = int(bf[i, 4]), int(bf[i, 5]), int(bf[i, 6])
    bar = "#" * int(bar_lift[i] * 40)
    print(f"  bar {i:2d} {downbeats[i]:6.2f}s  E={bar_energy[i]:.2f} lift={bar_lift[i]:.2f} lowSus={bf[i,3]:.2f}  kick{k:2d} snr{sn:2d} hat{h:2d}  {bar:<32} {tag}")
print(f"wrote {dst}")
