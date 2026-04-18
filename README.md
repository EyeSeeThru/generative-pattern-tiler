# Generative Pattern Tiler

**Create beautiful seamless tiling patterns — circle packing, wave interference, geometric shapes, and cellular patterns.**

🎨 **Live Preview** | 📤 **SVG/PNG/JSON Export** | 🎬 **Animation Support**

![Pattern Examples](assets/preview.png)

## Features

- **4 Pattern Types:**
  - **Circle Packing** — Non-overlapping circles with adjustable density and radius
  - **Wave Interference** — Multi-source wave patterns with interference
  - **Geometric Tiling** — Hexagons, triangles, squares
  - **Cellular (Voronoi)** — Worley noise-based cell patterns

- **Seamless Tiling** — All patterns tile seamlessly for use as textures/backgrounds

- **Color Palettes** — 5 palette types: Random Vibrant, Analogous, Complementary, Triadic, Monochrome

- **Export Formats:**
  - SVG (vector, infinite scaling)
  - PNG (raster)
  - JSON (for reloading or programmatic use)

- **Animation** — Generate multi-frame animations showing pattern evolution

- **Deterministic** — Same seed always produces the same pattern

## How to Use

Open `index.html` in any modern browser. No server required — everything runs client-side.

### Controls

| Control | Description |
|---------|-------------|
| **Pattern Type** | Choose circle packing, wave interference, geometric tiling, or cellular |
| **Seed** | Deterministic random seed (same seed = same pattern) |
| **Width/Height** | Pattern dimensions in pixels |
| **Density** | Circle packing density |
| **Min/Max Radius** | Circle size range |
| **Wave Count** | Number of wave sources |
| **Frequency** | Wave frequency/spacing |
| **Shape** | Geometric shape type |
| **Cell Count** | Number of Voronoi cells |
| **Jitter** | Cell center randomness |
| **Color Palette** | Color harmony type |
| **Seamless** | Enable/disable seamless tiling |

### Export

Click **Export SVG**, **Export PNG**, or **Export JSON** to download your pattern.

## Tech Stack

- Pure HTML/CSS/JavaScript — **no build step, no dependencies**
- Canvas API for rendering
- SVG export for vector output
- Works offline

## File Structure

```
generative-pattern-tiler/
├── index.html           # Main application
├── css/
│   └── style.css        # Dark theme styling
├── js/
│   ├── app.js           # UI logic and rendering
│   └── pattern-core.js  # Core pattern generation module
├── src/
│   └── pattern-core.js  # Node.js compatible core module
├── tests/
│   └── test_main.js     # TDD test suite (18 tests)
├── README.md
└── assets/
    └── preview.png
```

## TDD

```bash
node tests/test_main.js
# → 18 tests passed
```

Tests cover:
- Pattern generation (circle packing, wave interference, geometric tiling, cellular)
- Seamless tiling edge matching
- Color palette generation (5 harmony types)
- SVG export
- Animation frames
- Determinism (same seed = same output)

## Pattern Details

### Circle Packing
Places non-overlapping circles of varying sizes using a greedy algorithm. Seamless wrapping ensures patterns tile without visible seams.

### Wave Interference
Multiple wave sources create interference patterns. Phase and frequency determine the pattern complexity.

### Geometric Tiling
Regular tessellations using hexagons, triangles, or squares with alternating colors.

### Cellular (Voronoi)
Worley noise pattern with adjustable jitter. Cell centers are randomly placed and each pixel is assigned to the nearest center.

## Ideas for Extending

- Add more geometric shapes (pentagon, heptagon, irregular tiles)
- GIF export for animations
- Pattern tiling preview (show 3x3 grid)
- Gradient fills instead of solid colors
- Texture overlay (noise, grain)
- SVG animation (CSS/SMIL)

---

Built as Nightly Build #30 by Cerebro (OpenClaw agent).
Inspired by generative art and mathematical tiling patterns.
