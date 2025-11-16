/*
 * AI Literal Visualization script
 *
 * This script listens for clicks on the generate button, reads the user's
 * input string and uses it as a seed to generate deterministic yet
 * varied abstract art on a canvas element. The colours and shapes are
 * derived from a hash of the input text, ensuring that similar words
 * produce similar palettes. A seeded pseudo‑random number generator
 * ensures reproducible randomness.
 */

// When the document is ready, attach event listeners
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('moodInput');
  const button = document.getElementById('generateButton');
  const canvas = document.getElementById('artCanvas');
  const placeholder = document.getElementById('placeholderText');

  button.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    generateArt(text, canvas);
    placeholder.style.display = 'none';
    canvas.style.display = 'block';
  });

  // Optionally respond to Enter key
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      button.click();
    }
  });
});

/**
 * Generates an abstract artwork on the given canvas using a seeded PRNG
 * based on the provided text. Colours and shapes vary but depend on
 * the input string, yielding literal visualisations of the prompt.
 *
 * @param {string} text The user input used to seed the art
 * @param {HTMLCanvasElement} canvas The canvas element to draw on
 */
function generateArt(text, canvas) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;

  // Create a simple hash from the text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // Convert to 32bit integer
  }

  // Generate base colour from hash
  const r = (hash & 0xff0000) >> 16;
  const g = (hash & 0x00ff00) >> 8;
  const b = hash & 0x0000ff;
  const baseColour = adjustColour(r, g, b);

  // Fill background with a softened base colour
  ctx.fillStyle = `rgb(${baseColour.r}, ${baseColour.g}, ${baseColour.b})`;
  ctx.fillRect(0, 0, width, height);

  // Create a seeded random generator
  const rand = seededRandom(text);

  // Draw random shapes
  const shapeCount = Math.floor(rand() * 8) + 5; // between 5 and 12
  for (let i = 0; i < shapeCount; i++) {
    drawShape(ctx, width, height, rand, i);
  }
}

/**
 * Adjusts a colour to be more vibrant and ensures values wrap around 0–255.
 * This helps avoid extremely dark backgrounds.
 *
 * @param {number} r Red component (0–255)
 * @param {number} g Green component (0–255)
 * @param {number} b Blue component (0–255)
 * @returns {{r:number,g:number,b:number}} Adjusted colour
 */
function adjustColour(r, g, b) {
  // Add a bias to lighten darker colours
  const bias = 100;
  const nr = (r + bias) % 256;
  const ng = (g + bias) % 256;
  const nb = (b + bias) % 256;
  return { r: nr, g: ng, b: nb };
}

/**
 * Creates a deterministic pseudo‑random number generator seeded by the
 * input string. Returns a function that when called returns a float in
 * [0, 1). This uses a simple linear congruential generator (LCG).
 *
 * @param {string} seedStr The seed string
 * @returns {() => number} A function producing a pseudo‑random float
 */
function seededRandom(seedStr) {
  // Convert seed string into an integer seed
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed << 5) - seed + seedStr.charCodeAt(i);
    seed |= 0;
  }
  // Ensure positive seed
  seed = (seed >>> 0) % 2147483647;
  if (seed <= 0) seed += 2147483646;
  return function () {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/**
 * Draws a single shape onto the canvas using random parameters derived
 * from the seeded random generator. Shapes include circles, rectangles
 * and triangles with random positions, sizes and colours.
 *
 * @param {CanvasRenderingContext2D} ctx Drawing context
 * @param {number} width Canvas width
 * @param {number} height Canvas height
 * @param {() => number} rand Seeded random function
 * @param {number} index Index of shape (used to vary hues)
 */
function drawShape(ctx, width, height, rand, index) {
  const shapeType = Math.floor(rand() * 3); // 0 circle, 1 rect, 2 triangle
  // Determine size relative to canvas
  const maxSize = Math.min(width, height) * 0.4;
  const size = (rand() * 0.3 + 0.1) * maxSize;
  const x = rand() * (width - size) + size / 2;
  const y = rand() * (height - size) + size / 2;
  const rotation = rand() * Math.PI * 2;

  // Generate colour: vary hue based on index and random factor
  const hue = Math.floor((rand() + index / 10) * 360) % 360;
  const sat = Math.floor(rand() * 30 + 60); // 60–90%
  const light = Math.floor(rand() * 30 + 40); // 40–70%
  ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  switch (shapeType) {
    case 0: // Circle
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
      break;
    case 1: // Rectangle
      ctx.fillRect(-size / 2, -size / 2, size, size);
      break;
    case 2: // Triangle
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.closePath();
      ctx.fill();
      break;
  }
  ctx.restore();
}
