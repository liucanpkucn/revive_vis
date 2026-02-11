# Image2D3 Design Action Space

This document defines the rules for reconstructing a visualization from an image into **D3 + SVG** with **pixel-level alignment**.

## Target

- Input: `public/reference.png`
- Output: SVG rendered by `src/components/Visualization.tsx` (D3.js)
- Goal: the rendered SVG should match the reference image as closely as possible.

## Hard requirements

1) **No hallucinated data**
- Do not invent values.
- If the chart encodes numbers (axes, ticks, labels), recover data from those cues.
- If exact values cannot be determined, represent only what can be verified (and say what is unknown).

2) **Pixel-aligned layout**
- Use the same coordinate system as the reference: `viewBox="0 0 width height"`.
- Prefer explicit numeric positions and sizes.
- Align plot area, margins, title position, axis baselines, tick positions, legend placement.

3) **Style consistency**
- Match: font family, font size, font weight, text color, line widths, marker sizes, gridline style, background.
- Put styles in SVG attributes (`fill`, `stroke`, `stroke-width`, `font-size`, etc.) to stabilize rendering.

## Practical workflow

1) **Establish a scaffold**
- Draw the plot frame (background, plot area bounds).
- Place title/labels using rough positions.

2) **Lock coordinate system**
- Decide mapping from data domain → pixel positions.
- Ensure axis ticks and labels land exactly where they appear in the reference.

3) **Recover data carefully**
- For each series, infer values from axis ticks and mark positions.
- Double-check with geometry: the same value should map to the same pixel y.

4) **Iterate with verification**
- Run `uv run python compare.py` to generate `diff.png` + MAE/RMSE.
- Fix the largest visible errors first (alignment → fonts → strokes → colors → data).

## Debugging tips

- If everything looks shifted: check margins, `viewBox`, and container size.
- If text looks off: fonts differ; try explicit `font-family` and sizes.
- If thin lines look different: anti-aliasing is sensitive; match stroke widths exactly.
