/**
 * Generative Pattern Tiler — App
 * UI logic for the pattern generation tool.
 */

// ============================================================================
// State
// ============================================================================

let currentPattern = null;
let currentPalette = null;
let animationFrames = null;
let currentFrameIndex = 0;

// ============================================================================
// DOM Elements
// ============================================================================

const canvas = document.getElementById('pattern-canvas');
const ctx = canvas.getContext('2d');

// Pattern type selector
const patternType = document.getElementById('pattern-type');

// Seed controls
const seedInput = document.getElementById('seed');
const randomSeedBtn = document.getElementById('random-seed');

// Size controls
const widthSlider = document.getElementById('width');
const widthVal = document.getElementById('width-val');
const heightSlider = document.getElementById('height');
const heightVal = document.getElementById('height-val');

// Pattern-specific controls
const densityControl = document.getElementById('density-control');
const densitySlider = document.getElementById('density');
const densityVal = document.getElementById('density-val');

const minRadiusControl = document.getElementById('min-radius-control');
const minRadiusSlider = document.getElementById('min-radius');
const minRadiusVal = document.getElementById('min-radius-val');

const maxRadiusControl = document.getElementById('max-radius-control');
const maxRadiusSlider = document.getElementById('max-radius');
const maxRadiusVal = document.getElementById('max-radius-val');

const waveCountControl = document.getElementById('wave-count-control');
const waveCountSlider = document.getElementById('wave-count');
const waveCountVal = document.getElementById('wave-count-val');

const frequencyControl = document.getElementById('frequency-control');
const frequencySlider = document.getElementById('frequency');
const frequencyVal = document.getElementById('frequency-val');

const shapeControl = document.getElementById('shape-control');
const shapeSelect = document.getElementById('shape');

const scaleControl = document.getElementById('scale-control');
const scaleSlider = document.getElementById('scale');
const scaleVal = document.getElementById('scale-val');

const cellCountControl = document.getElementById('cell-count-control');
const cellCountSlider = document.getElementById('cell-count');
const cellCountVal = document.getElementById('cell-count-val');

const jitterControl = document.getElementById('jitter-control');
const jitterSlider = document.getElementById('jitter');
const jitterVal = document.getElementById('jitter-val');

// Color controls
const paletteType = document.getElementById('palette-type');
const baseColor = document.getElementById('base-color');

// Seamless toggle
const seamlessToggle = document.getElementById('seamless');

// Action buttons
const generateBtn = document.getElementById('generate');
const animateBtn = document.getElementById('animate');

// Export buttons
const exportSvgBtn = document.getElementById('export-svg');
const exportPngBtn = document.getElementById('export-png');
const exportJsonBtn = document.getElementById('export-json');

// Palette preview
const palettePreview = document.getElementById('palette-preview');

// Animation controls
const animationControls = document.getElementById('animation-controls');
const frameSlider = document.getElementById('frame-slider');
const frameVal = document.getElementById('frame-val');
const prevFrameBtn = document.getElementById('prev-frame');
const nextFrameBtn = document.getElementById('next-frame');

// ============================================================================
// Event Listeners
// ============================================================================

// Pattern type change — show/hide relevant controls
patternType.addEventListener('change', updateControlVisibility);

// Sliders — update value display
widthSlider.addEventListener('input', () => widthVal.textContent = widthSlider.value);
heightSlider.addEventListener('input', () => heightVal.textContent = heightSlider.value);
densitySlider.addEventListener('input', () => densityVal.textContent = densitySlider.value);
minRadiusSlider.addEventListener('input', () => minRadiusVal.textContent = minRadiusSlider.value);
maxRadiusSlider.addEventListener('input', () => maxRadiusVal.textContent = maxRadiusSlider.value);
waveCountSlider.addEventListener('input', () => waveCountVal.textContent = waveCountSlider.value);
frequencySlider.addEventListener('input', () => frequencyVal.textContent = frequencySlider.value);
scaleSlider.addEventListener('input', () => scaleVal.textContent = scaleSlider.value);
cellCountSlider.addEventListener('input', () => cellCountVal.textContent = cellCountSlider.value);
jitterSlider.addEventListener('input', () => jitterVal.textContent = jitterSlider.value);

// Random seed
randomSeedBtn.addEventListener('click', () => {
    seedInput.value = Math.floor(Math.random() * 999999);
    generatePattern();
});

// Generate button
generateBtn.addEventListener('click', generatePattern);

// Animate button
animateBtn.addEventListener('click', generateAnimation);

// Export buttons
exportSvgBtn.addEventListener('click', exportSVG);
exportPngBtn.addEventListener('click', exportPNG);
exportJsonBtn.addEventListener('click', exportJSON);

// Animation frame controls
frameSlider.addEventListener('input', () => {
    currentFrameIndex = parseInt(frameSlider.value);
    renderCurrentFrame();
    updateFrameDisplay();
});

prevFrameBtn.addEventListener('click', () => {
    if (animationFrames && currentFrameIndex > 0) {
        currentFrameIndex--;
        frameSlider.value = currentFrameIndex;
        renderCurrentFrame();
        updateFrameDisplay();
    }
});

nextFrameBtn.addEventListener('click', () => {
    if (animationFrames && currentFrameIndex < animationFrames.length - 1) {
        currentFrameIndex++;
        frameSlider.value = currentFrameIndex;
        renderCurrentFrame();
        updateFrameDisplay();
    }
});

// ============================================================================
// Control Visibility
// ============================================================================

function updateControlVisibility() {
    const type = patternType.value;

    // Hide all pattern-specific controls first
    densityControl.classList.add('hidden');
    minRadiusControl.classList.add('hidden');
    maxRadiusControl.classList.add('hidden');
    waveCountControl.classList.add('hidden');
    frequencyControl.classList.add('hidden');
    shapeControl.classList.add('hidden');
    scaleControl.classList.add('hidden');
    cellCountControl.classList.add('hidden');
    jitterControl.classList.add('hidden');

    // Show relevant controls based on pattern type
    switch (type) {
        case 'circle-packing':
            densityControl.classList.remove('hidden');
            minRadiusControl.classList.remove('hidden');
            maxRadiusControl.classList.remove('hidden');
            break;
        case 'wave-interference':
            waveCountControl.classList.remove('hidden');
            frequencyControl.classList.remove('hidden');
            break;
        case 'geometric-tiling':
            shapeControl.classList.remove('hidden');
            scaleControl.classList.remove('hidden');
            break;
        case 'cellular':
            cellCountControl.classList.remove('hidden');
            jitterControl.classList.remove('hidden');
            break;
    }
}

// ============================================================================
// Pattern Generation
// ============================================================================

function getOptions() {
    const type = patternType.value;

    const options = {};

    switch (type) {
        case 'circle-packing':
            options.density = parseFloat(densitySlider.value);
            options.minRadius = parseInt(minRadiusSlider.value);
            options.maxRadius = parseInt(maxRadiusSlider.value);
            break;
        case 'wave-interference':
            options.waveCount = parseInt(waveCountSlider.value);
            options.frequency = parseFloat(frequencySlider.value);
            break;
        case 'geometric-tiling':
            options.shape = shapeSelect.value;
            options.scale = parseFloat(scaleSlider.value);
            break;
        case 'cellular':
            options.cellCount = parseInt(cellCountSlider.value);
            options.jitter = parseFloat(jitterSlider.value);
            break;
    }

    return options;
}

function getPalette() {
    const type = paletteType.value;
    const color = baseColor.value;

    const palette = patternCore.generatePalette({
        type,
        baseColor: color,
        count: 8,
        seed: parseInt(seedInput.value)
    });

    return palette;
}

function generatePattern() {
    const type = patternType.value;
    const width = parseInt(widthSlider.value);
    const height = parseInt(heightSlider.value);
    const seed = parseInt(seedInput.value);
    const options = getOptions();
    const seamless = seamlessToggle.checked;

    // Generate palette
    currentPalette = getPalette();
    renderPalettePreview();

    // Generate pattern
    currentPattern = patternCore.generatePattern(type, {
        width,
        height,
        seed,
        options,
        seamless
    });

    // Clear animation frames
    animationFrames = null;
    animationControls.classList.add('hidden');

    // Render to canvas
    renderPattern();
}

function generateAnimation() {
    const type = patternType.value;
    const width = Math.min(200, parseInt(widthSlider.value)); // Smaller for animation
    const height = Math.min(200, parseInt(heightSlider.value));
    const seed = parseInt(seedInput.value);
    const options = getOptions();

    // Generate palette
    currentPalette = getPalette();
    renderPalettePreview();

    // Generate animation frames
    animationFrames = patternCore.generateAnimationFrames(type, {
        width: Math.min(200, width),
        height: Math.min(200, height),
        seed,
        options,
        frameCount: 10,
        fps: 10
    });

    currentFrameIndex = 0;
    frameSlider.max = animationFrames.length - 1;
    frameSlider.value = 0;

    // Show animation controls
    animationControls.classList.remove('hidden');

    // Render first frame
    renderCurrentFrame();
    updateFrameDisplay();
}

// ============================================================================
// Rendering
// ============================================================================

function renderPattern() {
    if (!currentPattern || !currentPalette) return;

    const width = parseInt(widthSlider.value);
    const height = parseInt(heightSlider.value);

    canvas.width = width;
    canvas.height = height;

    // Create image data
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // For circle packing and cellular, color by index
    // For wave interference, use grayscale
    const type = patternType.value;

    if (type === 'wave-interference') {
        // Grayscale rendering
        for (let i = 0; i < currentPattern.pixels.length; i++) {
            const v = currentPattern.pixels[i];
            const idx = i * 4;
            data[idx] = v;
            data[idx + 1] = v;
            data[idx + 2] = v;
            data[idx + 3] = 255;
        }
    } else {
        // Color by palette
        for (let i = 0; i < currentPattern.pixels.length; i++) {
            const colIdx = currentPattern.pixels[i];
            const color = currentPalette[colIdx % currentPalette.length] || currentPalette[0];

            // Parse hex color
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);

            const idx = i * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function renderCurrentFrame() {
    if (!animationFrames || !currentPalette) return;

    const frame = animationFrames[currentFrameIndex];
    const width = Math.min(200, parseInt(widthSlider.value));
    const height = Math.min(200, parseInt(heightSlider.value));

    canvas.width = Math.max(width, canvas.width);
    canvas.height = Math.max(height, canvas.height);

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Wave interference — grayscale
    const type = patternType.value;

    if (type === 'wave-interference') {
        for (let i = 0; i < frame.pixels.length; i++) {
            const v = frame.pixels[i];
            const idx = i * 4;
            data[idx] = v;
            data[idx + 1] = v;
            data[idx + 2] = v;
            data[idx + 3] = 255;
        }
    } else {
        // Color by palette
        for (let i = 0; i < frame.pixels.length; i++) {
            const colIdx = frame.pixels[i];
            const color = currentPalette[colIdx % currentPalette.length] || currentPalette[0];

            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);

            const idx = i * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function updateFrameDisplay() {
    if (animationFrames) {
        frameVal.textContent = `${currentFrameIndex + 1} / ${animationFrames.length}`;
    }
}

function renderPalettePreview() {
    if (!currentPalette) return;

    palettePreview.innerHTML = '';

    for (const color of currentPalette) {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.title = color;
        swatch.addEventListener('click', () => {
            navigator.clipboard.writeText(color).then(() => {
                showToast(`Copied ${color}!`, 'success');
            });
        });
        palettePreview.appendChild(swatch);
    }
}

// ============================================================================
// Export Functions
// ============================================================================

function exportSVG() {
    if (!currentPattern || !currentPalette) {
        showToast('Generate a pattern first!', 'error');
        return;
    }

    const svg = patternCore.toSVG(currentPattern, currentPalette, {
        width: parseInt(widthSlider.value),
        height: parseInt(heightSlider.value)
    });

    downloadFile('pattern.svg', svg, 'image/svg+xml');
    showToast('SVG exported!', 'success');
}

function exportPNG() {
    if (!currentPattern) {
        showToast('Generate a pattern first!', 'error');
        return;
    }

    // Render canvas to PNG
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'pattern.png';
    link.href = dataUrl;
    link.click();

    showToast('PNG exported!', 'success');
}

function exportJSON() {
    if (!currentPattern) {
        showToast('Generate a pattern first!', 'error');
        return;
    }

    const data = {
        patternType: patternType.value,
        width: parseInt(widthSlider.value),
        height: parseInt(heightSlider.value),
        seed: parseInt(seedInput.value),
        options: getOptions(),
        palette: currentPalette,
        seamless: seamlessToggle.checked,
        pixels: currentPattern.pixels
    };

    downloadFile('pattern.json', JSON.stringify(data, null, 2), 'application/json');
    showToast('JSON exported!', 'success');
}

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}

// ============================================================================
// Toast Notifications
// ============================================================================

function showToast(message, type = '') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto-hide
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ============================================================================
// Initialize
// ============================================================================

function init() {
    updateControlVisibility();
    generatePattern();
}

init();
