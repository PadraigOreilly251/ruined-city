// Build a self-contained standalone HTML (works on file://, no external fetches).
// Usage: node build-standalone.mjs <srcTemplate> <outFile>   (defaults resolve in this dir)
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const dir = path.dirname(fileURLToPath(import.meta.url));
const SRC = process.argv[2] || 'city-voxel.src.html';
const OUT = process.argv[3] || 'city-voxel.html';
const read = f => fs.readFileSync(`${dir}/${f}`, 'utf8');

/* --- three.module.js -> classic script --- */
let three = read('three.module.js');
const m3 = three.match(/export\s*\{([\s\S]*?)\}\s*;?\s*$/);
if (!m3) throw new Error('three export block not found');
three = three.slice(0, m3.index).trimEnd();
const map3 = {};
for (const raw of m3[1].split(',')) {
  const t = raw.trim(); if (!t) continue;
  const parts = t.split(/\s+as\s+/);
  map3[parts[1] || parts[0]] = parts[0];
}
const threeScript = `/* three.js r160 (three.module.js inlined, export statement converted) */\n${three}\nwindow.THREE = { ${Object.entries(map3).map(([k, v]) => `${k}: ${v}`).join(', ')} };\nconsole.info('[city] three.js r160 inlined, ' + ${Object.keys(map3).length} + ' exports');`;

/* --- OrbitControls.js -> classic script --- */
let oc = read('controls/OrbitControls.js');
const m1 = oc.match(/import\s*\{([\s\S]*?)\}\s*from\s*['"]three['"];?/);
if (!m1) throw new Error('OrbitControls import not found');
oc = oc.replace(m1[0], `/* import removed: names (EventDispatcher, Vector2, ...) resolve from the global scope of the inlined three.js script */`);
const m2 = oc.match(/\nexport\s*\{\s*OrbitControls\s*\}\s*;?\s*$/);
if (!m2) throw new Error('OrbitControls export not found');
oc = oc.slice(0, m2.index) + '\nwindow.OrbitControls = OrbitControls;\n';
oc = `(function(){\n` + oc + `})();\n`;

/* --- HTML --- */
let html = read(SRC);
// drop importmap + comment
html = html.replace(/<script type="importmap">[\s\S]*?<\/script>\n<!--[\s\S]*?-->/, '');
// module script -> three classic scripts (function replacement: no $' / $& mangling)
const newBlock = `<script>\n${threeScript}\n</script>\n<script>\n/* three.js r160 OrbitControls (inlined) */\n${oc}</script>\n<script>\n`;
html = html.replace('<script type="module">\nimport * as THREE from \'three\';\nimport { OrbitControls } from \'three/addons/OrbitControls.js\';\n', () => newBlock);

fs.writeFileSync(`${dir}/${OUT}`, html);
console.log('wrote', OUT, (html.length/1e6).toFixed(2), 'MB');
