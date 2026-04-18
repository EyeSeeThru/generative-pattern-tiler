/**
 * pattern-core.js — Generative Pattern Tiler
 * Core module for generating seamless tiling patterns.
 * 
 * Supports:
 * - Circle packing patterns
 * - Wave interference patterns
 * - Geometric tiling patterns
 * - Cellular (Voronoi) patterns
 * - Color palette generation
 * - SVG export
 * - Animation frames
 */

// ============================================================================
// Seeded Random Number Generator
// ============================================================================

function createRNG(seed) {
    let s = seed;
    return function() {
        // Mulberry32 algorithm
        s |= 0;
        s = s + 0x6D2B79F5 | 0;
        let t = Math.imul(s ^ s >>> 15, 1 | s);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// ============================================================================
// Color Utilities
// ============================================================================

function hexToHSL(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generatePalette({ type, baseColor, count, seed }) {
    const rng = createRNG(seed || Date.now());
    const palette = [];

    if (!baseColor) {
        // Generate random base if not provided
        baseColor = '#' + Math.floor(rng() * 0xFFFFFF).toString(16).padStart(6, '0');
    }

    const [h, s, l] = hexToHSL(baseColor);

    switch (type) {
        case 'analogous': {
            const angleStep = 30 / (count - 1 || 1);
            for (let i = 0; i < count; i++) {
                palette.push(hslToHex(h + (i - (count - 1) / 2) * angleStep, s, l));
            }
            break;
        }
        case 'complementary': {
            const compH = (h + 180) % 360;
            for (let i = 0; i < Math.ceil(count / 2); i++) {
                const lightness = l * (1 - i * 0.15);
                palette.push(hslToHex(h, s, lightness));
            }
            for (let i = 0; i < Math.floor(count / 2); i++) {
                const lightness = l * (1 - i * 0.15);
                palette.push(hslToHex(compH, s, lightness));
            }
            break;
        }
        case 'triadic': {
            const hues = [h, (h + 120) % 360, (h + 240) % 360];
            for (let i = 0; i < count; i++) {
                const hue = hues[i % 3];
                const lightness = l * (1 - (i % 2) * 0.2);
                palette.push(hslToHex(hue, s, lightness));
            }
            break;
        }
        case 'random-vibrant': {
            for (let i = 0; i < count; i++) {
                const hue = rng() * 360;
                const saturation = 60 + rng() * 40;
                const lightness = 40 + rng() * 30;
                palette.push(hslToHex(hue, saturation, lightness));
            }
            break;
        }
        default: {
            for (let i = 0; i < count; i++) {
                palette.push(hslToHex(h, s, l * (1 - i * 0.1)));
            }
        }
    }

    return palette;
}

// ============================================================================
// Pattern Generation
// ============================================================================

/**
 * Generate a 2D array of pixel indices for the pattern
 */
function generatePatternPixels(width, height, generatorFn) {
    const pixels = new Array(width * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            pixels[y * width + x] = generatorFn(x, y);
        }
    }
    return pixels;
}

/**
 * Circle Packing Pattern
 * Places non-overlapping circles of varying sizes
 */
function generateCirclePacking(width, height, seed, options = {}) {
    const { density = 0.5, minRadius = 5, maxRadius = 20 } = options;
    const rng = createRNG(seed);
    const pixels = new Array(width * height).fill(0);
    const circles = [];

    // Fill with circles
    const attempts = Math.floor(width * height * density * 0.1);

    for (let attempt = 0; attempt < attempts; attempt++) {
        const radius = minRadius + rng() * (maxRadius - minRadius);
        const x = rng() * (width + radius * 2) - radius;
        const y = rng() * (height + radius * 2) - radius;

        // Check if circle overlaps with existing circles
        let overlaps = false;
        for (const circle of circles) {
            const dx = x - circle.x;
            const dy = y - circle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius + circle.r + 1) {
                overlaps = true;
                break;
            }
        }

        if (!overlaps) {
            circles.push({ x, y, r: radius, colIdx: circles.length + 1 });
        }
    }

    // Render circles to pixel array
    // For seamless tiling, circles near edges are rendered at both original and wrapped positions
    for (const circle of circles) {
        // Determine which wrapped positions to render at
        const positions = [[circle.x, circle.y]];

        // Horizontal wrapping
        if (circle.x > width - circle.r) {
            positions.push([circle.x - width, circle.y]);
        }
        if (circle.x < circle.r) {
            positions.push([circle.x + width, circle.y]);
        }
        // Vertical wrapping
        if (circle.y > height - circle.r) {
            positions.push([circle.x, circle.y - height]);
        }
        if (circle.y < circle.r) {
            positions.push([circle.x, circle.y + height]);
        }
        // Corner wrapping (both axes)
        if (circle.x > width - circle.r && circle.y > height - circle.r) {
            positions.push([circle.x - width, circle.y - height]);
        }
        if (circle.x < circle.r && circle.y < circle.r) {
            positions.push([circle.x + width, circle.y + height]);
        }
        if (circle.x > width - circle.r && circle.y < circle.r) {
            positions.push([circle.x - width, circle.y + height]);
        }
        if (circle.x < circle.r && circle.y > height - circle.r) {
            positions.push([circle.x + width, circle.y - height]);
        }

        for (const [cx, cy] of positions) {
            const minX = Math.max(0, Math.floor(cx - circle.r));
            const maxX = Math.min(width - 1, Math.ceil(cx + circle.r));
            const minY = Math.max(0, Math.floor(cy - circle.r));
            const maxY = Math.min(height - 1, Math.ceil(cy + circle.r));

            for (let py = minY; py <= maxY; py++) {
                for (let px = minX; px <= maxX; px++) {
                    const dx = px - cx;
                    const dy = py - cy;
                    if (dx * dx + dy * dy <= circle.r * circle.r) {
                        pixels[py * width + px] = circle.colIdx;
                    }
                }
            }
        }
    }

    return { pixels, circles };
}

/**
 * Wave Interference Pattern
 * Creates wave patterns from multiple sources
 */
function generateWaveInterference(width, height, seed, options = {}) {
    const { waveCount = 3, frequency = 0.1 } = options;
    const rng = createRNG(seed);
    const pixels = new Array(width * height);

    // Generate wave sources
    const sources = [];
    for (let i = 0; i < waveCount; i++) {
        sources.push({
            x: rng() * width,
            y: rng() * height,
            phase: rng() * Math.PI * 2,
            amplitude: 0.5 + rng() * 0.5
        });
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let value = 0;
            for (const src of sources) {
                const dx = x - src.x;
                const dy = y - src.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                value += Math.sin(dist * frequency + src.phase) * src.amplitude;
            }
            // Normalize to 0-1
            const normalized = (value / waveCount + 1) / 2;
            pixels[y * width + x] = Math.floor(normalized * 255);
        }
    }

    return { pixels };
}

/**
 * Geometric Tiling Pattern
 * Creates tessellating geometric shapes
 */
function generateGeometricTiling(width, height, seed, options = {}) {
    const { shape = 'hexagon', scale = 1.5 } = options;
    const rng = createRNG(seed);
    const pixels = new Array(width * height).fill(0);

    const tileSize = Math.max(10, Math.min(30, 20 * scale));
    let colIdx = 1;

    for (let y = 0; y < height + tileSize; y += tileSize * 0.75) {
        for (let x = 0; x < width + tileSize; x += tileSize) {
            const offsetY = (Math.floor(x / tileSize) % 2) * tileSize * 0.5;
            const cx = x + tileSize / 2;
            const cy = y - offsetY + tileSize / 2;
            const colorIdx = (colIdx++ % 8) + 1;

            if (shape === 'hexagon') {
                // Draw hexagon
                const r = tileSize * 0.5;
                for (let py = 0; py < tileSize; py++) {
                    for (let px = 0; px < tileSize; px++) {
                        const dx = px + x - cx;
                        const dy = py + y - offsetY - cy;
                        // Hexagon distance metric
                        const hexDist = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dx + dy) * 0.5);
                        if (hexDist < r * 0.9) {
                            const nx = Math.floor(px + x);
                            const ny = Math.floor(py + y - offsetY);
                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                pixels[ny * width + nx] = colorIdx;
                            }
                        }
                    }
                }
            } else if (shape === 'triangle') {
                // Draw equilateral triangle
                const r = tileSize * 0.45;
                for (let py = 0; py < tileSize; py++) {
                    for (let px = 0; px < tileSize; px++) {
                        const dx = px + x - cx;
                        const dy = py + y - offsetY - cy;
                        // Triangle: check if point is inside
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const angle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);
                        if (dist < r && angle < Math.PI * 2 / 3) {
                            const nx = Math.floor(px + x);
                            const ny = Math.floor(py + y - offsetY);
                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                pixels[ny * width + nx] = colorIdx;
                            }
                        }
                    }
                }
            } else {
                // Default: square pattern
                for (let py = 0; py < tileSize * 0.5; py++) {
                    for (let px = 0; px < tileSize * 0.5; px++) {
                        const nx = Math.floor(px + x);
                        const ny = Math.floor(py + y);
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            pixels[ny * width + nx] = colorIdx;
                        }
                    }
                }
            }
        }
    }

    return { pixels };
}

/**
 * Cellular (Voronoi) Pattern
 * Creates cell-like patterns using Worley noise
 */
function generateCellular(width, height, seed, options = {}) {
    const { cellCount = 25, jitter = 0.3 } = options;
    const rng = createRNG(seed);
    const pixels = new Array(width * height);

    // Generate cell centers
    const cells = [];
    const cellW = width / Math.ceil(Math.sqrt(cellCount));
    const cellH = height / Math.ceil(Math.sqrt(cellCount));

    for (let i = 0; i < cellCount; i++) {
        const gridX = i % Math.ceil(Math.sqrt(cellCount));
        const gridY = Math.floor(i / Math.ceil(Math.sqrt(cellCount)));
        cells.push({
            x: (gridX + 0.5 + (rng() - 0.5) * jitter) * cellW,
            y: (gridY + 0.5 + (rng() - 0.5) * jitter) * cellH,
            colIdx: i + 1
        });
    }

    // Assign each pixel to nearest cell
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let minDist = Infinity;
            let nearestCell = cells[0];

            for (const cell of cells) {
                const dx = x - cell.x;
                const dy = y - cell.y;
                const dist = dx * dx + dy * dy;
                if (dist < minDist) {
                    minDist = dist;
                    nearestCell = cell;
                }
            }

            pixels[y * width + x] = nearestCell.colIdx;
        }
    }

    return { pixels, cells };
}

// ============================================================================
// Seamless Tiling
// ============================================================================

function checkSeamless(pixels, width, height) {
    // Check horizontal edge match (left vs right)
    let hMatch = 0;
    for (let y = 0; y < height; y++) {
        if (pixels[y * width] === pixels[y * width + width - 1]) {
            hMatch++;
        }
    }
    const hScore = hMatch / height;

    // Check vertical edge match (top vs bottom)
    let vMatch = 0;
    for (let x = 0; x < width; x++) {
        if (pixels[x] === pixels[(height - 1) * width + x]) {
            vMatch++;
        }
    }
    const vScore = vMatch / width;

    return (hScore + vScore) / 2;
}

// ============================================================================
// SVG Export
// ============================================================================

function toSVG(patternResult, palette, options = {}) {
    const { width = Math.sqrt(patternResult.pixels.length) | 0 } = options;
    const height = patternResult.pixels.length / width;

    // Make palette optional — use default if not provided
    if (!palette || !Array.isArray(palette)) {
        palette = ['#ffffff', '#333333', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];
    }

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`;
    svg += `  <rect width="100%" height="100%" fill="${palette[0] || '#ffffff'}"/>\n`;

    // Group pixels by color index
    const colorGroups = {};
    for (let i = 0; i < patternResult.pixels.length; i++) {
        const colIdx = patternResult.pixels[i];
        if (colIdx === 0) continue; // Skip background
        if (!colorGroups[colIdx]) colorGroups[colIdx] = [];
        const x = i % width;
        const y = Math.floor(i / width);
        colorGroups[colIdx].push({ x, y });
    }

    // Render each color group as a single path
    for (const [colIdx, points] of Object.entries(colorGroups)) {
        const color = palette[parseInt(colIdx) % palette.length] || '#333333';
        // Create a simple representation - just dots for circle packing
        let paths = '';
        if (patternResult.circles && patternResult.circles.length > 0) {
            // Circle packing - render as circles
            for (const circle of patternResult.circles) {
                if (circle.colIdx === parseInt(colIdx)) {
                    paths += `    <circle cx="${circle.x.toFixed(1)}" cy="${circle.y.toFixed(1)}" r="${circle.r.toFixed(1)}" fill="${color}"/>\n`;
                }
            }
        } else {
            // For other patterns, render as small rects
            for (const pt of points) {
                paths += `    <rect x="${pt.x}" y="${pt.y}" width="1" height="1" fill="${color}"/>\n`;
            }
        }
        svg += paths;
    }

    svg += '</svg>';
    return svg;
}

// ============================================================================
// Animation Frames
// ============================================================================

function generateAnimationFrames(patternType, options = {}) {
    const { width = 50, height = 50, frameCount = 10, fps = 30, seed = 42 } = options;
    const frames = [];

    for (let f = 0; f < frameCount; f++) {
        const frameSeed = seed + f * 1000;
        const frameOptions = { ...options, phase: f / frameCount };
        const result = generatePattern(patternType, { width, height, seed: frameSeed, options: frameOptions });
        frames.push({
            pixels: result.pixels,
            timestamp: f * (1000 / fps)
        });
    }

    return frames;
}

// ============================================================================
// Main Pattern Generator
// ============================================================================

function generatePattern(type, params) {
    const { width = 100, height = 100, seed = 42, options = {}, seamless = false } = params;

    let result;

    switch (type) {
        case 'circle-packing':
            result = generateCirclePacking(width, height, seed, options);
            break;
        case 'wave-interference':
            result = generateWaveInterference(width, height, seed, options);
            break;
        case 'geometric-tiling':
            result = generateGeometricTiling(width, height, seed, options);
            break;
        case 'cellular':
            result = generateCellular(width, height, seed, options);
            break;
        default:
            result = generateCirclePacking(width, height, seed, options);
    }

    if (seamless) {
        result.seamless = true;
        result.edgeMatchScore = checkSeamless(result.pixels, width, height);
    }

    return result;
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
    generatePattern,
    generatePalette,
    toSVG,
    generateAnimationFrames
};
