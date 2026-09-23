/* Verify the live track system: priming, water exclusion, live stamping,
   season recolour, and what it costs per simulated second. */
(async () => {
  const T = window.__RC_TRACKS__;
  const im = () => T.mesh.instanceMatrix.array;
  const col = () => (T.mesh.instanceColor ? T.mesh.instanceColor.array : null);
  const out = [];
  out.push(`primed: visible=${T.count} totalStamped=${T.stamped}`);
  let wet = 0, a = im();
  for (let i = 0; i < T.count; i++){ if (a[i * 16 + 13] < WATER_Y + 0.1) wet++; }
  out.push(`prints under the waterline: ${wet}  (want 0)`);

  /* live stamping: drive a whole migration and see what gets written */
  T.clear();
  window.__RC_HERD__.setSeason(0); window.__RC_HERD__.st.rest = 0; window.__RC_HERD__.st.moving = false;
  window.__RC_HERD__.fastForward(180);
  const n = T.count, c = col();
  let sumY = 0, kinds = {};
  const kn = T.kind || [];
  out.push(`after 180 s of migration: prints=${n}`);
  if (c) out.push(`instance colors set: ${(c[0] !== undefined && c[1] !== undefined)}`);
  const t0 = T.count ? [c[0], c[1], c[2]] : [];
  window.__RC_HERD__.setSeason(3); window.__RC_HERD__.fastForward(0.2);      /* triggers the surface tick */
  const c2 = col();
  out.push(`recolour on season change: before=[${t0.map(v => v.toFixed(2))}] after=[${c2[0].toFixed(2)},${c2[1].toFixed(2)},${c2[2].toFixed(2)}] -> ${Math.abs(c2[0] - t0[0]) > 0.01 ? 'YES' : 'NO'}`);

  /* cost: same work with the system on and off */
  const timeFF = (sec) => { const s = performance.now(); window.__RC_HERD__.fastForward(sec); return performance.now() - s; };
  T.enabled = false; const off = timeFF(60);
  T.enabled = true;  const on = timeFF(60);
  out.push(`60 s of herd sim: off=${off.toFixed(1)}ms  on=${on.toFixed(1)}ms  delta=${(on - off).toFixed(1)}ms`);
  out.push(`final: visible=${T.count} stamped=${T.stamped} drawn=${T.mesh.count}`);
  return out;
})()
