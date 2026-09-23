/* Do the geese leave a trail when they are on land?  Puts the flock ashore beside
   the tarn, runs it, and counts goose-shaped prints in the pool. */
(() => {
  const G = window.__RC_GEESE__, T = window.__RC_TRACKS__;
  const S = G.st;
  T.clear();
  S.mode = 'walk'; S.x = -122; S.z = 72; S.alt = 0;         /* ashore, 20 m north of the tarn centre */
  G.birds.forEach((b) => b.g.position.set(S.x, 0, S.z));
  const modes = {};
  for (let t = 0; t < 120; t += 0.05){
    G.fastForward(0.05);
    modes[S.mode] = (modes[S.mode] || 0) + 1;
  }
  const im = T.mesh.instanceMatrix.array;
  let goose = 0, deer = 0, fox = 0, wet = 0;
  for (let i = 0; i < T.count; i++){
    const o = i * 16;
    const sx = Math.hypot(im[o], im[o + 1], im[o + 2]);
    const sl = Math.hypot(im[o + 8], im[o + 9], im[o + 10]);
    const x = im[o + 12], z = im[o + 14];
    if (Math.abs(sx - 0.18) < 0.03 && Math.abs(sl - 0.28) < 0.05) goose++;
    else if (Math.abs(sx - 0.08) < 0.02) fox++;
    else deer++;
    if (groundH(x, z) < WATER_Y + 0.25) wet++;
  }
  return [
    `120 s ashore, modes seen: ${Object.entries(modes).map(([k, v]) => k + '=' + (v * 0.05).toFixed(0) + 's').join(' ')}`,
    `prints by kind: goose=${goose} fox=${fox} deer=${deer} total=${T.count}`,
    `prints in water: ${wet}  (want 0)`,
    `flock ended at (${S.x.toFixed(0)},${S.z.toFixed(0)}) mode=${S.mode} alt=${S.alt.toFixed(1)}`,
    `geese count=${G.birds.length}`,
  ];
})()
