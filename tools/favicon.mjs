// Outlines the A³ monogram from Instrument Serif and writes the favicon SVG.
// Usage: node favicon.mjs <fontsDir> <outSvg>
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';

const [fontsDir, out] = process.argv.slice(2);
const load = (file) => {
  const buf = fs.readFileSync(path.join(fontsDir, file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const roman = load('instrument-serif-latin-400-normal.woff');
const italic = load('instrument-serif-latin-400-italic.woff');

// Layout in a 64×64 box: a large A, a small italic 3 at its upper right.
const aSize = 50;
const aPath = roman.getPath('A', 0, 0, aSize);
const aBox = aPath.getBoundingBox();
const aW = aBox.x2 - aBox.x1;
const aH = aBox.y2 - aBox.y1;

const tSize = 23;
const tPath = italic.getPath('3', 0, 0, tSize);
const tBox = tPath.getBoundingBox();
const tW = tBox.x2 - tBox.x1;
const tH = tBox.y2 - tBox.y1;

const gap = 1.5;
const totalW = aW + gap + tW;
const left = (64 - totalW) / 2;
const top = (64 - aH) / 2 + 1.5;

const aShifted = roman.getPath('A', left - aBox.x1, top - aBox.y1, aSize);
const tShifted = italic.getPath('3', left + aW + gap - tBox.x1, top - 3 - tBox.y1, tSize);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="A³ — Ahmed Abbas Ashour">
<title>A³ — Ahmed Abbas Ashour</title>
<rect width="64" height="64" rx="15" fill="#07332B"/>
<rect x="2.5" y="2.5" width="59" height="59" rx="12.5" fill="none" stroke="#D9C18D" stroke-opacity=".35"/>
<path fill="#D9C18D" d="${aShifted.toPathData(2)}"/>
<path fill="#5FE0C8" d="${tShifted.toPathData(2)}"/>
</svg>
`;
fs.writeFileSync(out, svg);
console.log(JSON.stringify({ aW, aH, tW, tH, bytes: svg.length }));
