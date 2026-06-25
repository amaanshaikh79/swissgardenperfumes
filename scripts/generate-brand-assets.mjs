import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'client', 'public');

const GOLD = '#C8A02A';
const DARK = '#111111';

// ── Social share card (1200x630) ──────────────────────────────────
const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="38%" r="60%">
      <stop offset="0%" stop-color="#1d1a12"/>
      <stop offset="100%" stop-color="${DARK}"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="2"/>
  <text x="600" y="250" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="96" font-weight="700" fill="#ffffff" letter-spacing="2">SwissGarden</text>
  <text x="600" y="320" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700" fill="${GOLD}" letter-spacing="18">PERFUMES</text>
  <line x1="450" y1="370" x2="750" y2="370" stroke="${GOLD}" stroke-width="2" stroke-opacity="0.7"/>
  <text x="600" y="430" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#cfcfcf" letter-spacing="2">Luxury Inspired Scents · Non-Alcoholic Roll-On Attars</text>
</svg>`;

// ── Square monogram (used for app/touch icons + favicon png) ───────
const monogramSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="34" fill="${DARK}"/>
  <rect x="10" y="10" width="160" height="160" rx="26" fill="none" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="3"/>
  <text x="90" y="120" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="96" font-weight="700" fill="${GOLD}">SG</text>
</svg>`;

const jobs = [
  { name: 'og-default.jpg', run: () => sharp(Buffer.from(ogSvg)).jpeg({ quality: 86 }).toFile(path.join(OUT, 'og-default.jpg')) },
  { name: 'apple-touch-icon.png', run: () => sharp(Buffer.from(monogramSvg(180))).png().toFile(path.join(OUT, 'apple-touch-icon.png')) },
  { name: 'favicon-32.png', run: () => sharp(Buffer.from(monogramSvg(32))).png().toFile(path.join(OUT, 'favicon-32.png')) },
  { name: 'favicon-192.png', run: () => sharp(Buffer.from(monogramSvg(192))).png().toFile(path.join(OUT, 'favicon-192.png')) },
];

for (const j of jobs) {
  try {
    const info = await j.run();
    console.log(`OK  ${j.name}  ${info.width}x${info.height} ${info.size}b`);
  } catch (e) {
    console.error(`FAIL ${j.name}: ${e.message}`);
    process.exitCode = 1;
  }
}
