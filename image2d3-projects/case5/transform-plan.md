# Transform Plan: Historical Banking Charts Reconstruction

## A) Chart Inventory

1.  **Container**: Fixed SVG size 867x1307. Background color `#F9ECCB` (parchment beige).
2.  **Typography**: Serif font (e.g., "Times New Roman", "Georgia"). Main title bold sans-serif, subtitle serif.
3.  **Global Header**:
    - "ATLAS OF CANADA" (Top Right)
    - "PLATE No 72" (Top Right, below)
    - "CURRENCY AND BANKING" (Center, Bold, Sans-serif)
    - "Chartered Banks in Canada" (Center, Serif)
4.  **Charts**: 5 distinct horizontal bar charts, stacked vertically.
    - **Chart 1: Liabilities** (Red bars, single series)
    - **Chart 2: Assets** (Green bars, single series)
    - **Chart 3: Deposits** (Stacked Red/Green bars, 2 series, plus legend)
    - **Chart 4: Discount and Loans** (Red bars, single series)
    - **Chart 5: Reserve Fund** (Red bars, single series)

## B) Layout Spec (Pixel Coordinates)

*   **Margins**:
    - Global Side Margins: ~75px left/right.
    - Chart Width: ~760px (Plot area).
    - Left Axis Labels: x < 75.
    - Right Annotations (Chart 3): x > 835.

*   **Vertical Regions (y-coordinates estimates)**:
    - Title Area: y=0 to 140.
    - **Chart 1 (Liabilities)**:
        - Header: y=130 ("Liabilities", "Million dollars").
        - Plot Area: y=160 to 280 (Height ~120px).
    - **Chart 2 (Assets)**:
        - Header: y=320.
        - Plot Area: y=350 to 470.
    - **Chart 3 (Deposits)**:
        - Header: y=510.
        - Plot Area: y=540 to 660.
        - Legend: y=680 to 700.
    - **Chart 4 (Discount & Loans)**:
        - Header: y=720.
        - Plot Area: y=750 to 870.
    - **Chart 5 (Reserve Fund)**:
        - Header: y=910.
        - Plot Area: y=940 to 1040.

## C) Typography & Palette

- **Colors**:
    - Background: `#F9ECCB`
    - Red Bars (Salmon): `#EFA09E`
    - Green Bars (Sage): `#BBC8BA`
    - Grid/Axes: `#555555` (Stroke width 0.5 or 1)
    - Text: `#222222`
- **Fonts**:
    - Titles: Sans-serif (Arial/Helvetica), ~16-20px, Bold.
    - Subtitles/Axis Labels: Serif (Times), ~10-14px.
    - Small labels inside bars: ~8px (skip if unreadable/too cluttered).

## D) Data Extraction Protocol

**Chart 1: Liabilities (Red)**
- **Y-Domain (Top to Bottom)**: `['1869', '1871', '1876', '1881', '1886', '1891', '1896', '1901', '1904']`
- **X-Scale**: Linear 0-700. Ticks every 50. Sub-ticks every 10.
- **Values (Approx via Grid)**:
    - 1869: ~45
    - 1871: ~80
    - 1876: ~90
    - 1881: ~125
    - 1886: ~160
    - 1891: ~195
    - 1896: ~230
    - 1901: ~420
    - 1904: ~645

**Chart 2: Assets (Green)**
- **Y-Domain**: `['1868', '1871', '1875', '1881', '1886', '1891', '1896', '1901', '1904']`
- **X-Scale**: Linear 0-700. Ticks every 50.
- **Values (Approx)**:
    - 1868: ~20
    - 1871: ~125
    - 1875: ~180
    - 1881: ~200
    - 1886: ~225
    - 1891: ~295
    - 1896: ~320
    - 1901: ~530
    - 1904: ~695

**Chart 3: Deposits (Stacked Red + Green)**
- **Y-Domain**: `['1869-1873', '1874-1878', '1879-1883', '1884-1888', '1889-1893', '1894-1898', '1899-1903', '1904']`
- **X-Scale**: Linear 0-425. Ticks every 25.
- **Data (Demand | Notice)**:
    - 1869-73: 26 | 31 (Total ~57)
    - 1874-78: 32 | 37
    - 1879-83: 41 | 42
    - 1884-88: 48 | 55
    - 1889-93: 59 | 86
    - 1894-98: 70 | 125
    - 1899-03: 100 | 218
    - 1904: 118 | 312

**Chart 4: Discount and Loans (Red)**
- **Y-Domain**: `['1868', '1869-1873', '1874-1878', '1879-1883', '1884-1888', '1889-1893', '1894-1898', '1899-1903', '1904']`
- **X-Scale**: Linear 0-600. Ticks every 50.
- **Values**:
    - 1868: ~58
    - 1869-73: ~91
    - 1874-78: ~140
    - 1879-83: ~141
    - 1884-88: ~190
    - 1889-93: ~205
    - 1894-98: ~225
    - 1899-03: ~380
    - 1904: ~510

**Chart 5: Reserve Fund (Red)**
- **Y-Domain**: `['1853', '1886', '1891', '1896', '1901', '1904']`
- **X-Scale**: Linear 0-50. Ticks every 5.
- **Values**:
    - 1853: ~17
    - 1886: ~17
    - 1891: ~22
    - 1896: ~26
    - 1901: ~35
    - 1904: ~52

## E) Implementation Steps

1.  **Setup**: Create `Visualization.tsx` with `viewBox="0 0 867 1307"`. Add background rect.
2.  **Shared Components**:
    - `GridSystem`: Draws vertical lines for X-ticks and horizontal lines for rows.
    - `BarRow`: Renders text label (left), bar rects, and value text (optional/if readable).
3.  **Implement Chart 1 (Liabilities)**:
    - Position `g` at y=160.
    - Draw X-axis ticks at top (y=0 in local coords).
    - Map data to rect widths.
4.  **Implement Chart 2 (Assets)**:
    - Position `g` at y=350. Change bar fill to Green.
5.  **Implement Chart 3 (Deposits)**:
    - Position `g` at y=540.
    - Stacked bars logic.
    - Add Legend at bottom.
    - Add right-side total text annotations.
6.  **Implement Chart 4 & 5**:
    - Follow similar pattern with respective domains/ranges.
7.  **Labels & Titles**: Place main header text.

## F) Verification

- Run `uv run python compare.py`.
- **Check 1**: Do all 5 charts appear vertically?
- **Check 2**: Do the grid lines align with the reference image grid? (Crucial for "pixel-perfect" look).
- **Check 3**: Are the fonts similar (Serif)?
- **Check 4**: Are the bar colors correct?
- Adjust offsets (`dy`, `dx`) to align text baselines.
