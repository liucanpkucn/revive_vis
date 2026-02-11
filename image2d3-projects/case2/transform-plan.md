# Transform Plan: Historical Choropleth Map Reconstruction

This plan outlines the reconstruction of the "Fettgehalt der Milch" historical map into a D3.js visualization.

## A) Chart Inventory

1.  **Chart Type:** Choropleth Map (Thematic Map).
2.  **Subject:** Average milk fat content (1930-1932) in the German Reich.
3.  **Components:**
    -   **Map Layer:** Main German territory + East Prussia inset. (Polygon geometry required).
    -   **Legend:** Vertical color ramp (9 discrete buckets) with numeric labels.
    -   **Frame:** Double-line decorative border.
    -   **Annotations:** Main title, subtitle, source notes, map ID.
4.  **Data Attributes:**
    -   Region Name (e.g., Schleswig, Hannover).
    -   Value Category (3.0 - 3.8 vH).

## B) Layout Spec

-   **Dimensions:** 1331px width x 1078px height.
-   **ViewBox:** `0 0 1331 1078`.
-   **Margins/Frame:**
    -   Outer Frame Rect: `x=12, y=12, width=1307, height=1054` (Approx 2px stroke).
    -   Inner Frame Rect: `x=16, y=16, width=1299, height=1046` (Approx 1px stroke).
    -   Background: Paper color `#FDF5E6` (Old Lace/Beige) or sampled `#F9F1E0`.
-   **Title Placement:**
    -   Main Title ("Fettgehalt der Milch"): x=980, y=400 (Left-aligned anchor).
    -   Subtitle ("im Durchschnitt..."): x=980, y=435.
-   **Legend Placement:**
    -   Header ("Fettgehalt der Milch in..."): x=800, y=760 (width constrained to ~300px).
    -   Color Ramp Origin: x=850, y=820.
    -   Swatch Size: ~65px width x ~24px height.
-   **Other Labels:**
    -   "Deutsches Reich...": Top Left (x=70, y=90).
    -   "Karte 76": Top Right (x=1250, y=40).
    -   "Bearbeitet im...": Bottom Left (x=30, y=1065).

## C) Typography & Palette

-   **Fonts:**
    -   *Main Title:* Condensed Serif (e.g., "Times New Roman Condensed", "Oswald", or native `font-stretch: condensed`). Size: ~42px. Bold. Color: Black.
    -   *Subtitle:* Sans-serif (e.g., Arial, Helvetica). Size: ~20px. Color: Black.
    -   *Legend Text:* Monospace or Sans-serif. Size: ~14px.
    -   *Map Labels:* Serif Italic. Size: ~10-14px.
-   **Color Palette (9 Classes):**
    -   Sampled from image (Light -> Dark):
        1.  3,0: `#FFF5E1` (Lightest)
        2.  3,1: `#FDE0C3`
        3.  3,2: `#FBCBA6`
        4.  3,3: `#F9B689`
        5.  3,4: `#F29D6E`
        6.  3,5: `#EB8454`
        7.  3,6: `#D86A3E`
        8.  3,7: `#C2502A`
        9.  3,8: `#AA3819` (Darkest)
-   **Strokes:**
    -   Region Borders: `#444` (0.5px).
    -   National Borders: `#000` (1.5px).
    -   Frame: `#000` (Double line).

## D) Data Extraction Protocol

1.  **Legend Data:**
    -   Buckets: `["3,0 v H", "3,1 »", "3,2 »", "3,3 »", "3,4 »", "3,5 »", "3,6 »", "3,7 »", "3,8 »"]`. Note: The image uses a ditto mark or small double dash for "v H".
    -   Mapping: Index 0 (Top) to Index 8 (Bottom).
2.  **Map Geometry (TBD):**
    -   *Constraint Check:* Exact SVG paths for 1930s German administrative districts are not available in the prompt context.
    -   *Strategy:* The implementation will define the **structure** for the map (`<g id="map">`) and populate it with a placeholder message or simplified path if possible. **Strict pixel alignment of the map polygons is impossible without vector tracing.** The code should allow for `d` attributes to be pasted in later.
    -   *Action:* We will render the frame, legend, and text perfectly. We will place a "Map Placeholder" group.

## E) Implementation Steps

1.  **Scaffold:**
    -   Create `svg` with fixed viewBox `0 0 1331 1078`.
    -   Add `<defs>` for texture/filters if needed (paper grain optional, stick to flat color for now).
    -   Draw background rect.
2.  **Frame:**
    -   Draw the outer and inner rectangles using standard SVG `<rect>` with distinct stroke widths.
3.  **Legend Construction:**
    -   Create a group `<g transform="translate(850, 820)">`.
    -   Loop through the 9 data buckets.
    -   Draw `<rect>` for color.
    -   Draw `<text>` for labels (aligned right of the rect).
    -   Add Legend Header text above.
4.  **Annotations:**
    -   Add Title text elements (adjust `text-anchor`, `font-family`, `font-weight`).
    -   Add Corner labels ("Deutsches Reich", "Karte 76", etc.).
5.  **Map Layer (Structural):**
    -   Create a group `<g id="map-layer">`.
    -   (Since we cannot invent geometry, this layer will be prepared to receive paths).
    -   Add a visual note or comment in code that map paths are `TBD`.

## F) Verification Loop

1.  **Run `compare.py`:** Check alignment of the Frame and Legend.
2.  **Tune:** Adjust Legend X/Y and Title X/Y to match reference pixels.
3.  **Refine Colors:** Compare the rendered swatch colors against the reference image area.
4.  **Fonts:** Tweak font sizes and weights to match the visual weight of the text.

*(Self-Correction during planning)*: Since I cannot draw the map regions, the RMSE will be high in the center. I will focus on minimizing error in the *layout elements* (borders, text, legend) to prove the reconstruction logic is sound. The map itself will be left as a valid D3 selection ready for data.
