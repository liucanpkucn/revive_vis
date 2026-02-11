# Transform Plan: Stacked Bar Chart Reconstruction

## A) Chart Inventory

1.  **Chart Type:** Diverging Stacked Bar Chart (Population Pyramid style).
2.  **Dimensions:** 811px width x 1024px height.
3.  **Data Series:**
    *   **Categories (Center out):** Single (Blue), Married (Red), Widowed (Green).
    *   **Grouping:** Males (Left), Females (Right).
    *   **Y-Axis:** Age Periods (Categorical, Ordinal).
4.  **Axes:**
    *   **Y-Axis:** 9 bands equal height.
    *   **X-Axis:** Percentage (0-100) diverging from center. Linear scale.
5.  **Graphical Elements:**
    *   Rectangles for data segments.
    *   Vertical gridlines (every 10%).
    *   Horizontal gridlines (between age groups).
    *   Text labels (Title, Subtitle, Axis Headers, Ticks, In-chart annotations).

## B) Layout Specification

*   **ViewBox:** `0 0 811 1024`
*   **Background Color:** `#e3d6c8` (Aged paper tone).
*   **Chart Area:**
    *   **Top Y:** 215px
    *   **Bottom Y:** 840px (Total height: 625px)
    *   **Left X:** 105px
    *   **Right X:** 705px
    *   **Center Spine:** 405px
    *   **Side Width:** 300px per gender (Left: 105-405, Right: 405-705).
*   **Grid:**
    *   **Vertical Step:** 10% = 30px.
    *   **Horizontal Step:** 1 band = 625 / 9 ≈ 69.44px.
*   **Margins/Text Areas:**
    *   **Title:** Centered, baseline ~75px.
    *   **Subtitle:** Centered, baseline ~110px.
    *   **Credit:** Centered, baseline ~150px.
    *   **Column Headers (MALES/FEMALES):** Baseline ~205px.
    *   **Side Labels (AGES):**
        *   Left Column: Right-aligned to x=95px.
        *   Right Column: Left-aligned to x=715px.
    *   **Bottom Axis Labels:** Baseline ~860px.
    *   **"PER CENTS" Label:** Baseline ~880px.

## C) Typography & Palette

*   **Font Family:** `Times New Roman`, Georgia, or generic serif.
*   **Colors:**
    *   **Blue (Single):** `#1f64aa`
    *   **Red (Married):** `#ce1232`
    *   **Green (Widowed):** `#2e8b57`
    *   **Text/Grid:** `#000000`
*   **Strokes:**
    *   Gridlines: `stroke-width="0.5"` opacity 0.5.
    *   Bar Outlines: `stroke-width="0.5"` (black).
*   **Text Styles:**
    *   **Title:** ~22px, Uppercase (or small caps feel).
    *   **Subtitle:** ~14px, Italic? No, standard serif.
    *   **Headers (MALES/FEMALES):** ~12px, Bold, Uppercase.
    *   **In-Chart Labels:** ~14-18px, Bold, Rotated.

## D) Data Extraction Protocol

The data is strictly inferred from the 10% grid lines.
**Age Categories (Top to Bottom):**
`OVER 65`, `55-65`, `45-55`, `35-45`, `30-35`, `25-30`, `20-25`, `15-20`, `0-15`

**Series Values (Single, Married, Widowed)**
*Note: Values represent the segment width in %.*

| Age Group | Male [S, M, W] | Female [S, M, W] |
| :--- | :--- | :--- |
| **OVER 65** | `[4, 66, 30]` | `[6, 36, 58]` |
| **55-65** | `[5, 76, 19]` | `[8, 50, 42]` |
| **45-55** | `[9, 81, 10]` | `[11, 63, 26]` |
| **35-45** | `[12, 82, 6]` | `[13, 72, 15]` |
| **30-35** | `[19, 77, 4]` | `[16, 75, 9]` |
| **25-30** | `[34, 63, 3]` | `[29, 66, 5]` |
| **20-25** | `[71, 28, 1]` | `[44, 54, 2]` |
| **15-20** | `[99, 1, 0]` | `[83, 17, 0]` |
| **0-15** | `[100, 0, 0]` | `[100, 0, 0]` |

## E) Implementation Steps

1.  **Setup:** Create SVG `viewBox="0 0 811 1024"`. Add background rect `#e3d6c8`.
2.  **Scales:**
    *   `yScale`: `d3.scaleBand` domain `[ages...]` range `[215, 840]`.
    *   `xScale`: Linear, 1% = 3px.
3.  **Render Data (Bars):**
    *   Iterate through data rows.
    *   **Left Side:**
        *   Start x = 405.
        *   **Single:** `x = 405 - (val * 3)`, `width = val * 3`.
        *   **Married:** `x = 405 - (s + m) * 3`, `width = m * 3`.
        *   **Widowed:** `x = 405 - (s + m + w) * 3`, `width = w * 3`.
    *   **Right Side:**
        *   Start x = 405.
        *   **Single:** `x = 405`, `width = val * 3`.
        *   **Married:** `x = 405 + s * 3`, `width = m * 3`.
        *   **Widowed:** `x = 405 + (s + m) * 3`, `width = w * 3`.
4.  **Gridlines:**
    *   Draw vertical lines at `x = 105, 135, ... 705`.
    *   Draw horizontal lines at `y = 215 + k * cellHeight`.
5.  **Labels (Static):**
    *   Draw Title/Subtitle text.
    *   Draw "MALES" (x ~255), "FEMALES" (x ~555).
    *   Draw "AGES" headers and columns on left and right.
    *   Draw Bottom X-axis ticks: `100, 90...0...90, 100`.
6.  **Annotations (Rotated):**
    *   Place "SINGLE", "MARRIED", "WIDOWED" text manually or calculated centroids.
    *   **Rotation:**
        *   Left side: Negative rotation (~ -45° to -60°).
        *   Right side: Positive rotation (~ 45° to 60°).
        *   Adjust positions to match reference visually.

## F) Verification Loop

1.  **First Pass:** Implement layout and bars. Check alignment of center spine and edges.
2.  **Second Pass:** Add texts and refine fonts. Check vertical alignment of age labels.
3.  **Third Pass:** Add gridlines overlay. Ensure they match bar boundaries where applicable.
4.  **Comparison:** Run `compare.py`. If bars are too wide/narrow, adjust the hardcoded data values slightly (within +/- 1-2%).
5.  **Refine:** Color tuning and font weight adjustments.

### Specific Text Content
*   Title: "Conjugal condition of American Negroes according to age periods."
*   Subtitle: "Condition conjugale des Nègres Americains au point de vue de l' age."
*   Footer: "Done by Atlanta University." (Small text at top or bottom? Image shows it below subtitle: "Done by Atlanta University.")
*   Headers: "AGES.", "OVER 65" etc. (Note the periods if present in image).
    *   Image: "AGES." (with period), "MALES." (with period), "FEMALES." (with period).
    *   Image: "PER CENTS." (with period).
    *   Age labels: "OVER 65", "55 - 65", "45 - 55", "35 - 45", "30 - 35", "25 - 30", "20 - 25", "15 - 20", "0 - 15".
