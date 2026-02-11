# Plan: Reconstruct "TELEFACT: Canada's National Income" Chart

This plan details the reconstruction of the "Canada's National Income" isotype chart into a D3.js SVG component. The output must be pixel-aligned to the 1190x1038 reference image.

## A) Chart Inventory

- **Chart Type:** Pictogram (Isotype) Bar Chart.
- **Dimensions:** 1190px width x 1038px height.
- **Data Series:** 4 Rows representing years (1929, 1933, 1937, 1940).
- **Graphical Unit:** 3D Block Icon (representing ~500 Million Canadian Dollars).
- **Marks:**
  - Repeated block icons.
  - Partial block icons (clipped) for remainders.
  - Grouping: Icons are grouped in sets of 5 with a larger gap.
- **Annotations:**
  - Header: "TELEFACT" (stylized banner).
  - Subtitle: "CANADA'S NATIONAL INCOME".
  - Row Labels: Years on the left.
  - Data Labels: Value text below each icon row.
  - Footer: Source credit.
  - Container: Thick black border with internal divider.

## B) Layout Spec

### Coordinate System
- **ViewBox:** `0 0 1190 1038`
- **Main Border Box:**
  - Left: 40px, Top: 70px
  - Width: ~1110px, Height: ~880px
  - Stroke: ~5px black.

### Header Area
- **"TELEFACT" Banner:**
  - Vertical span: y=70 to y=170.
  - Text centered horizontally. Font: "Impact" or heavy sans-serif. Size: ~80px.
  - Divider Line: y=170.
- **Subtitle:**
  - Text: "CANADA'S NATIONAL INCOME"
  - Position: centered or left-aligned? Reference shows left-aligned relative to content, roughly x=50. Baseline y=220. Font: Geometric Sans (Futura style), Size ~40px.

### Plot Area (Rows)
- **Y-Positions (approximate baselines for icons):**
  - Row 1929: y=340
  - Row 1933: y=520
  - Row 1937: y=700
  - Row 1940: y=880
- **X-Positions:**
  - Year Labels (1929, etc): x=60 (left aligned).
  - Icons Start: x=150.
  - Icon Width: ~60px.
  - Icon Spacing: ~10px.
  - Group Gap (after 5 icons): ~40px extra.

### Text Labels
- **Values:** Placed below the icon rows.
  - 1929 Text: x=150, y=380.
  - 1933 Text: x=150, y=560.
  - 1937 Text: x=150, y=740.
  - 1940 Text: x=150, y=920.

## C) Typography & Palette

- **Colors:**
  - Fill/Stroke: Black (`#000000`).
  - Background: White (`#FFFFFF`).
  - Icon Details: White strokes on black fill.

- **Fonts (Estimates):**
  - "TELEFACT": `Impact, "Arial Black", sans-serif` (Distressed look manually not required, just bold). Scale: ~80px.
  - Subtitle: `Futura, "Trebuchet MS", sans-serif`. Scale: ~40px.
  - Years: `Arial, sans-serif`, Bold. Scale: ~30px.
  - Data Values: `Arial, sans-serif`, Regular/Small Caps? Scale: ~24px.
  - Footer: `Arial, sans-serif`, Scale: ~18px.

## D) Data Extraction Protocol

**Unit:** 1 Icon ≈ 500 Million.
**Visual Logic:** `num_icons = value / 500`. Partial icons are clipped width-wise.

| Year | Label Text | Value (Numerical) | Icon Count (Calc) | Visual Grouping |
|------|------------|-------------------|-------------------|-----------------|
| 1929 | "5,149 MILLION CANADIAN DOLLARS" | 5149 | 10.3 | 5 full, gap, 5 full (approx) |
| 1933 | "2,795 MILLION" | 2795 | 5.6 | 5 full, gap, 0.6 partial |
| 1937 | "4,342 MILLION" | 4342 | 8.7 | 5 full, gap, 3 full, 0.7 partial |
| 1940 | "4,800 MILLION" | 4800 | 9.6 | 5 full, gap, 4 full, 0.6 partial |

*Note: For 1929, visually it looks like 10 icons. 5149 is close to 5000. I will render 10.3 (10 full + small sliver) or clamp to visual appearance if strictly needed. Reference shows 10. Let's strictly map value->width. 10.3 would show a tiny sliver. I'll implement exact data mapping to respect the chart's logic.*

## E) Implementation Steps

1.  **Scaffold:**
    - Create SVG with `viewBox="0 0 1190 1038"`.
    - Add white background rect.
    - Draw main border rect (stroke-width: 5).
    - Draw header divider line.

2.  **Typography Layers:**
    - Add "TELEFACT" (centered top).
    - Add subtitle.
    - Add year labels (y-positioned).
    - Add value text labels (below icon rows).
    - Add footer text (bottom right).

3.  **Icon Component:**
    - Design a `path` for the block icon.
    - It should look like a 3D isometric block (black with white edges).
    - Size: approx 60px wide x 70px high.

4.  **Data Rendering:**
    - Loop through data array.
    - For each row:
      - Calculate number of full icons and remainder.
      - Loop `i` from 0 to `ceil(total)`.
      - Calculate `x` position: `start_x + (i * (icon_w + gap)) + (floor(i/5) * group_gap)`.
      - If it's a full icon, render normally.
      - If it's partial, apply a `clipPath` rectangle with width `icon_w * remainder`.
    - Ensure row spacing matches reference.

5.  **Refinement:**
    - Adjust icon path details (add horizontal striations if possible for "stack" look).
    - Tune font sizes and weights.
    - Verify margins and gaps.

## F) Verification

- **Command:** `uv run python compare.py`
- **Checks:**
    1. Does the "TELEFACT" banner line up?
    2. Are there 4 rows of icons?
    3. Do the icons have the correct grouping (gaps after 5)?
    4. Is the text readable and aligned?
    5. Check partial icons: 1933 should show slightly more than half a block at the end.
