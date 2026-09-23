/* Census of the print pool: which animal wrote what, and where.
   Reads the instance colours back into kinds by matching the palette at stamp time,
   so a wrong-kind / wrong-place print shows up as a region outlier. */
(() => {
  const T = window.__RC_TRACKS__;
  const im = T.mesh.instanceMatrix.array;
  const kinds = { deer: { n: 0, minX: 1e9, maxX: -1e9, minZ: 1e9, maxZ: -1e9 }, fox: { n: 0, minX: 1e9, maxX: -1e9, minZ: 1e9, maxZ: -1e9 }, goose: { n: 0, minX: 1e9, maxX: -1e9, minZ: 1e9, maxZ: -1e9 } };
  const shp = [[0.12, 0.22], [0.09, 0.13], [0.22, 0.34]];
  const names = ['deer', 'fox', 'goose'];
  for (let i = 0; i < T.count; i++){
    const o = i * 16;
    /* scale is the length of each basis column; the raw element is cos*scale */
    const sx = Math.hypot(im[o], im[o + 1], im[o + 2]), sz = Math.hypot(im[o + 8], im[o + 9], im[o + 10]);
    let best = 0, bd = 1e9;
    for (let k = 0; k < 3; k++){
      const d = Math.abs(sx - shp[k][0]) + Math.abs(sz - shp[k][1]);
      if (d < bd){ bd = d; best = k; }
    }
    const b = kinds[names[best]], x = im[o + 12], z = im[o + 14];
    b.n++;
    b.minX = Math.min(b.minX, x); b.maxX = Math.max(b.maxX, x);
    b.minZ = Math.min(b.minZ, z); b.maxZ = Math.max(b.maxZ, z);
  }
  const fmt = (n, b) => b.n ? `${n}: ${b.n} prints  x[${b.minX.toFixed(0)}..${b.maxX.toFixed(0)}] z[${b.minZ.toFixed(0)}..${b.maxZ.toFixed(0)}]` : `${n}: none`;
  return [fmt('deer', kinds.deer), fmt('fox', kinds.fox), fmt('goose', kinds.goose),
    `total visible=${T.count}  stamped since load=${T.stamped}`,
    `tarn is at (-122,52); city box is |x|<96,|z|<96`,
    `deer prints inside the city: ${(() => { let c = 0; for (let i = 0; i < T.count; i++){ const o = i * 16; const sx = Math.hypot(im[o], im[o + 1], im[o + 2]); if (Math.abs(im[o + 12]) < 96 && Math.abs(im[o + 14]) < 96 && Math.abs(sx - 0.12) < 0.02) c++; } return c; })()}`];
})()
