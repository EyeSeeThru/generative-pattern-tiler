/**
 * Generative Pattern Tiler — Test Suite
 * RED PHASE: Tests describe what the tool should do.
 * GREEN PHASE: All tests pass after implementation.
 *
 * Run with: node tests/test_main.js
 */

const fs = require('fs');
const path = require('path');

// Import the core pattern generation module
// In RED phase, this will fail because the module doesn't exist yet
let patternCore;
try {
    patternCore = require('../src/pattern-core.js');
} catch (e) {
    patternCore = null;
}

const PASS = !patternCore ? '✗ (module not found)' : '';
const PASS_OK = patternCore ? '✓' : '✗ (module not found)';

// Test utilities
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
}

function assertArrayLength(arr, len, message) {
    if (!Array.isArray(arr) || arr.length !== len) {
        throw new Error(`${message}: expected length ${len}, got ${Array.isArray(arr) ? arr.length : 'not an array'}`);
    }
}

function test(name, fn) {
    try {
        fn();
        console.log(`  ✓ ${name}`);
        return true;
    } catch (e) {
        console.log(`  ✗ ${name}: ${e.message}`);
        return false;
    }
}

// ============================================================================
// Test Suite
// ============================================================================

console.log('\n=== Generative Pattern Tiler — Test Suite ===\n');

if (!patternCore) {
    console.log('RED PHASE: src/pattern-core.js does not exist yet...');
    console.log('Implement the module to make tests pass (GREEN phase).\n');
}

let passed = 0;
let failed = 0;

// ---------------------------------------------------------------------------
// Pattern Generation Tests
// ---------------------------------------------------------------------------
console.log('Pattern Generation:');

if (test('creates circle packing pattern', () => {
    if (!patternCore) throw new Error('Module not found');
    const result = patternCore.generatePattern('circle-packing', {
        width: 200,
        height: 200,
        seed: 42,
        options: { density: 0.7, minRadius: 5, maxRadius: 30 }
    });
    assert(result, 'Should return a pattern object');
    assert(result.pixels, 'Should have pixels array');
    assertEqual(result.pixels.length, 200 * 200, 'Should have correct number of pixels');
})) passed++; else failed++;

if (test('creates wave interference pattern', () => {
    if (!patternCore) throw new Error('Module not found');
    const result = patternCore.generatePattern('wave-interference', {
        width: 100,
        height: 100,
        seed: 123,
        options: { waveCount: 3, frequency: 0.1 }
    });
    assert(result, 'Should return a pattern object');
    assert(result.pixels, 'Should have pixels array');
})) passed++; else failed++;

if (test('creates geometric tiling pattern', () => {
    if (!patternCore) throw new Error('Module not found');
    const result = patternCore.generatePattern('geometric-tiling', {
        width: 150,
        height: 150,
        seed: 456,
        options: { shape: 'hexagon', scale: 1.5 }
    });
    assert(result, 'Should return a pattern object');
})) passed++; else failed++;

if (test('creates cellular/Voronoi pattern', () => {
    if (!patternCore) throw new Error('Module not found');
    const result = patternCore.generatePattern('cellular', {
        width: 120,
        height: 120,
        seed: 789,
        options: { cellCount: 25, jitter: 0.3 }
    });
    assert(result, 'Should return a pattern object');
})) passed++; else failed++;

// ---------------------------------------------------------------------------
// Seamless Tiling Tests
// ---------------------------------------------------------------------------
console.log('\nSeamless Tiling:');

if (test('circle packing pattern tiles seamlessly', () => {
    if (!patternCore) throw new Error('Module not found');
    // The key test: a pattern tiles if the left edge matches the right edge
    // and the top edge matches the bottom edge
    const result = patternCore.generatePattern('circle-packing', {
        width: 100,
        height: 100,
        seed: 42,
        options: { density: 0.5, minRadius: 5, maxRadius: 20 },
        seamless: true
    });
    assert(result.seamless === true, 'Pattern should be marked as seamless');
    assert(result.edgeMatchScore >= 0.7, `Edge match should be >= 0.7 for circle packing, got ${result.edgeMatchScore}`);
})) passed++; else failed++;

if (test('wave interference pattern tiles seamlessly', () => {
    if (!patternCore) throw new Error('Module not found');
    const result = patternCore.generatePattern('wave-interference', {
        width: 80,
        height: 80,
        seed: 100,
        options: { waveCount: 2 },
        seamless: true
    });
    assert(result.seamless === true, 'Pattern should be marked as seamless');
})) passed++; else failed++;

// ---------------------------------------------------------------------------
// Color Palette Tests
// ---------------------------------------------------------------------------
console.log('\nColor Palette:');

if (test('generates harmonious color palette', () => {
    if (!patternCore) throw new Error('Module not found');
    const palette = patternCore.generatePalette({
        type: 'analogous',
        baseColor: '#FF5733',
        count: 5
    });
    assertArrayLength(palette, 5, 'Should return 5 colors');
    palette.forEach((color, i) => {
        assert(/^#[0-9A-Fa-f]{6}$/.test(color), `Color ${i} should be valid hex: ${color}`);
    });
})) passed++; else failed++;

if (test('generates complementary palette', () => {
    if (!patternCore) throw new Error('Module not found');
    const palette = patternCore.generatePalette({
        type: 'complementary',
        baseColor: '#3498db',
        count: 4
    });
    assertArrayLength(palette, 4, 'Should return 4 colors');
})) passed++; else failed++;

if (test('generates triadic palette', () => {
    if (!patternCore) throw new Error('Module not found');
    const palette = patternCore.generatePalette({
        type: 'triadic',
        baseColor: '#9b59b6',
        count: 6
    });
    assertArrayLength(palette, 6, 'Should return 6 colors');
})) passed++; else failed++;

if (test('generates random vibrant palette', () => {
    if (!patternCore) throw new Error('Module not found');
    const palette = patternCore.generatePalette({
        type: 'random-vibrant',
        count: 5,
        seed: 42
    });
    assertArrayLength(palette, 5, 'Should return 5 colors');
})) passed++; else failed++;

// ---------------------------------------------------------------------------
// SVG Export Tests
// ---------------------------------------------------------------------------
console.log('\nSVG Export:');

if (test('exports pattern to SVG string', () => {
    if (!patternCore) throw new Error('Module not found');
    const result = patternCore.generatePattern('geometric-tiling', {
        width: 100,
        height: 100,
        seed: 42,
        options: { shape: 'triangle', scale: 1.0 }
    });
    const svg = patternCore.toSVG(result);
    assert(typeof svg === 'string', 'Should return SVG string');
    assert(svg.includes('<svg'), 'Should contain <svg> tag');
    assert(svg.includes('xmlns="http://www.w3.org/2000/svg"'), 'Should have SVG namespace');
    assert(svg.includes(`width="100"`), 'Should have correct width');
    assert(svg.includes(`height="100"`), 'Should have correct height');
})) passed++; else failed++;

if (test('SVG output is valid and renderable', () => {
    if (!patternCore) throw new Error('Module not found');
    const result = patternCore.generatePattern('circle-packing', {
        width: 50,
        height: 50,
        seed: 42,
        options: { density: 0.6, maxRadius: 10 }
    });
    const svg = patternCore.toSVG(result);
    // Basic SVG structure check
    assert(svg.startsWith('<svg'), 'SVG should start with <svg>');
    assert(svg.includes('</svg>'), 'SVG should close with </svg>');
})) passed++; else failed++;

// ---------------------------------------------------------------------------
// Animation Tests
// ---------------------------------------------------------------------------
console.log('\nAnimation:');

if (test('generates animation frames', () => {
    if (!patternCore) throw new Error('Module not found');
    const frames = patternCore.generateAnimationFrames('wave-interference', {
        width: 50,
        height: 50,
        frameCount: 5,
        options: { waveCount: 2, frequency: 0.1 }
    });
    assertArrayLength(frames, 5, 'Should return 5 frames');
    frames.forEach((frame, i) => {
        assert(frame.pixels, `Frame ${i} should have pixels`);
        assertEqual(frame.pixels.length, 50 * 50, `Frame ${i} should have correct pixel count`);
    });
})) passed++; else failed++;

if (test('animation frames have correct timing', () => {
    if (!patternCore) throw new Error('Module not found');
    const frames = patternCore.generateAnimationFrames('cellular', {
        width: 30,
        height: 30,
        frameCount: 10,
        options: { cellCount: 10 },
        fps: 30
    });
    assertArrayLength(frames, 10, 'Should return 10 frames');
    frames.forEach((frame, i) => {
        assertEqual(frame.timestamp, i * (1000 / 30), `Frame ${i} should have correct timestamp`);
    });
})) passed++; else failed++;

// ---------------------------------------------------------------------------
// Seed/Determinism Tests
// ---------------------------------------------------------------------------
console.log('\nDeterminism:');

if (test('same seed produces same pattern', () => {
    if (!patternCore) throw new Error('Module not found');
    const params = {
        width: 64,
        height: 64,
        seed: 12345,
        options: { density: 0.6, minRadius: 3, maxRadius: 15 }
    };
    const result1 = patternCore.generatePattern('circle-packing', params);
    const result2 = patternCore.generatePattern('circle-packing', params);
    assertEqual(result1.pixels.join(','), result2.pixels.join(','), 'Same seed should produce identical pixels');
})) passed++; else failed++;

if (test('different seeds produce different patterns', () => {
    if (!patternCore) throw new Error('Module not found');
    const params1 = { width: 64, height: 64, seed: 111, options: { density: 0.6 } };
    const params2 = { width: 64, height: 64, seed: 222, options: { density: 0.6 } };
    const result1 = patternCore.generatePattern('circle-packing', params1);
    const result2 = patternCore.generatePattern('circle-packing', params2);
    assert(result1.pixels.join(',') !== result2.pixels.join(','), 'Different seeds should produce different patterns');
})) passed++; else failed++;

// ---------------------------------------------------------------------------
// Resolution/Scale Tests
// ---------------------------------------------------------------------------
console.log('\nResolution:');

if (test('handles different resolutions', () => {
    if (!patternCore) throw new Error('Module not found');
    const result = patternCore.generatePattern('geometric-tiling', {
        width: 500,
        height: 500,
        seed: 42,
        options: { shape: 'hexagon', scale: 2.0 }
    });
    assertEqual(result.pixels.length, 500 * 500, 'Should handle 500x500 resolution');
})) passed++; else failed++;

if (test('scale affects pattern density', () => {
    if (!patternCore) throw new Error('Module not found');
    const small = patternCore.generatePattern('circle-packing', {
        width: 50, height: 50, seed: 42, options: { maxRadius: 5 }
    });
    const large = patternCore.generatePattern('circle-packing', {
        width: 50, height: 50, seed: 42, options: { maxRadius: 20 }
    });
    // Large radius should produce more filled pixels
    const smallFilled = small.pixels.filter(p => p !== 0).length;
    const largeFilled = large.pixels.filter(p => p !== 0).length;
    assert(largeFilled > smallFilled, 'Larger maxRadius should produce more filled pixels');
})) passed++; else failed++;

// ============================================================================
// Results
// ============================================================================

console.log('\n=== Results ===');
console.log(`Passed: ${passed}/${passed + failed}`);
if (failed > 0) {
    console.log(`Failed: ${failed}/${passed + failed}`);
    console.log('\nFix the failing tests.');
    process.exit(1);
} else if (!patternCore) {
    console.log('\nModule not found — implement src/pattern-core.js');
    process.exit(1);
} else {
    console.log('\nGREEN PHASE: All tests pass!');
    process.exit(0);
}
