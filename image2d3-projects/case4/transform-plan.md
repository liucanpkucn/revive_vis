# Plan for Reconstructing "Negro Population by Age and Sex: 1900"

## A) Chart Inventory

1.  **Chart Type:** Small Multiples (Grid of Population Pyramids).
2.  **Container:** SVG 1080x1420 px.
3.  **Grid System:** 7 rows × 4 columns (Total 28 charts).
4.  **Axes:**
    *   **Y-Axis (Age Groups):** Categorical. Shared labels on the far left of the grid.
        *   Labels: "80-90", "70-80", "60-70", "50-60", "40-50", "30-40", "20-30", "10-20", "0-10".
        *   Additional Labels: "AGES" (above 80-90), "PER CENT" (below 0-10).
    *   **X-Axis (Population %):** Linear, Diverging.
        *   Domain: 15% (Males, left) to 15% (Females, right).
        *   Ticks: 15, 10, 5, 0, 5, 10, 15.
5.  **Marks:**
    *   **Bars:** Rectangles for each age group/sex.
    *   **Gridlines:** Vertical lines at 0%, 5%, 10%, 15% for each chart.
6.  **Annotations:**
    *   **Global Title:** "NEGRO POPULATION BY AGE AND SEX: 1900".
    *   **Plate Number:** "PLATE No. 39".
    *   **Footer:** "JULIUS BIEN & CO. LITH. N.Y.".
    *   **Per Chart:** State Name (centered top).
    *   **Per Chart:** Diagonal labels "MALES" (left) and "FEMALES" (right).

## B) Layout Spec (Pixel Coordinates)

*   **ViewBox:** `0 0 1080 1420`
*   **Global Margins:**
    *   Top: ~130px (for Title).
    *   Bottom: ~40px.
    *   Left: ~80px (for Age labels).
    *   Right: ~40px.
*   **Grid Dimensions:**
    *   Grid Start Y: ~140px.
    *   Grid End Y: ~1380px.
    *   Grid Width: 1080 - 80 - 40 = 960px.
    *   Grid Height: 1240px.
    *   Row Height: ~177px (1240 / 7).
    *   Col Width: ~240px (960 / 4).
*   **Chart Internal Layout (Relative to Cell):**
    *   Title Height: ~20px.
    *   Plot Area Top: ~25px.
    *   Plot Area Bottom: ~160px.
    *   Center Axis (x=0): Midpoint of cell width.

## C) Typography & Palette

*   **Fonts:**
    *   Title: Serif (e.g., "Times New Roman" or "Georgia"), approx 24px, All Caps.
    *   State Names: Sans-serif (e.g., "Arial" or "Helvetica"), approx 10px, All Caps.
    *   Axis/Tick Labels: Sans-serif, approx 8px.
    *   "MALES"/"FEMALES": Sans-serif, approx 8px, rotated -45° and +45°.
*   **Colors:**
    *   Background: `#FDF5E6` (Old Lace) or `#F5ECCE` to match paper tone.
    *   Stroke: `#000000` (Black).
    *   Bar Fill: `#FFFFFF` (White) or Transparent with Black Stroke. (Reference suggests bars occlude gridlines, implying White fill).
    *   Gridlines: Thin Black (0.5px).

## D) Data Extraction Protocol

1.  **State List (Left-to-Right, Top-to-Bottom):**
    *   Row 1: ALABAMA, ARIZONA, ARKANSAS, CALIFORNIA
    *   Row 2: COLORADO, CONNECTICUT, DELAWARE, DISTRICT OF COLUMBIA
    *   Row 3: FLORIDA, GEORGIA, HAWAII, IDAHO
    *   Row 4: ILLINOIS, INDIANA, INDIAN TERRITORY, IOWA
    *   Row 5: KANSAS, KENTUCKY, LOUISIANA, MAINE
    *   Row 6: MARYLAND, MASSACHUSETTS, MICHIGAN, MINNESOTA
    *   Row 7: MISSISSIPPI, MISSOURI, MONTANA, NEBRASKA
2.  **Y-Domain (Top-to-Bottom):**
    *   `["80-90", "70-80", "60-70", "50-60", "40-50", "30-40", "20-30", "10-20", "0-10"]`
3.  **Data Values:**
    *   **Constraint:** Extracting 504 distinct values is not feasible without hallucination.
    *   **Strategy:** Implement the data structure for *all* states but populate actual values for **ALABAMA** (as a representative shape) and leave others as copies of Alabama or simplified placeholders, clearly marked in code comments.
    *   **Alabama Estimates (Male/Female %):**
        *   80-90: 0.2 / 0.2
        *   70-80: 0.5 / 0.5
        *   60-70: 1.0 / 1.0
        *   50-60: 2.0 / 2.0
        *   40-50: 3.5 / 3.5
        *   30-40: 5.0 / 5.0
        *   20-30: 8.0 / 9.0
        *   10-20: 12.0 / 13.0
        *   0-10: 15.0 / 15.0 (Base is wide)

## E) Implementation Steps

1.  **Setup:** Create `Visualization.tsx` with standard imports. Define constants for dimensions.
2.  **Data & Scales:**
    *   Define `STATES` array.
    *   Define `AGE_GROUPS` array.
    *   Create `scaleBand` for Y (ages) and `scaleLinear` for X (0-15%).
3.  **Main Container:**
    *   SVG with `viewBox="0 0 1080 1420"`.
    *   Add background rect.
    *   Add Header (Title, Plate No).
    *   Add Footer.
4.  **Grid Generation:**
    *   Loop `rows` (0-6) and `cols` (0-3).
    *   Calculate `x` and `y` offsets for each cell.
    *   Render `<g>` for each state.
5.  **Chart Component (Inside Loop):**
    *   Draw State Title.
    *   Draw Vertical Gridlines (ticks 15, 10, 5, 0, 5, 10, 15).
    *   Draw X-Axis Labels (15 10 5 0 5 10 15) at bottom of cell.
    *   Draw Bars (path or rects). **Note:** Bars must be mirrored. Left = Male, Right = Female.
    *   Draw "MALES" and "FEMALES" text annotations (rotated).
6.  **Row Headers (Left Margin):**
    *   For each row, render the "AGES" list to the left of the first column.
    *   Add "AGES" header and "PER CENT" footer for the labels column.
7.  **Refinement:**
    *   Adjust font sizes to match reference.
    *   Ensure bars have white fill to match the 'occlusion' effect if present, or just black outlines.

## F) Verification Loop

1.  **Run `compare.py`:** Check alignment of the 4x7 grid.
2.  **Check Typography:** Are titles centered? Is the "AGES" column aligned with the rows?
3.  **Check Data:** Does the "Alabama" shape look like a pyramid?
4.  **Check Axis:** Do the 15-10-5 lines match the image grid?
