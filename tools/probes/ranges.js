/* Candidate seasonal deer ranges. Grazable = dry (ground above water+0.4) and not
   too steep. Also reports the walk length from the current meadow. */
(() => {
  const G = window.__RC_GROUND__;
  const WATER = -0.55;
  const cands = {
    meadow_now: [-115, 25], nw_upland: [-150, -40], w_hill: [-172, 60],
    sw_far: [-105, 130], s_cove_edge: [-68, 150], nw_far: [-135, -100],
    n_ferris_field: [-45, -118], se_outside: [-30, 140], mid_w: [-140, 95],
    w_high: [-190, 20], nw_corner: [-180, -80], s_wide: [-95, 170]
  };
  const LAND = { reservoir: [-165, 255], array: [4, 256], watchtower: [199, 268], lighthouse: [72, 195] };
  const rows = [];
  for (const [k, [x, z]] of Object.entries(cands)){
    const h = G(x, z);
    const slope = Math.atan(Math.hypot(G(x+6,z)-h, G(x,z+6)-h) / 6) * 180 / Math.PI;
    let ld = 1e9, ln = '';
    for (const [n, [lx, lz]] of Object.entries(LAND)){ const d = Math.hypot(x-lx, z-lz); if (d < ld){ ld = d; ln = n; } }
    const inCity = Math.abs(x) < 96 && Math.abs(z) < 96;
    const dry = h > WATER + 0.4;
    rows.push(k.padEnd(15) + ` (${String(x).padStart(4)},${String(z).padStart(4)}) g=${h.toFixed(1).padStart(5)} slope=${slope.toFixed(0).padStart(2)}deg`
      + ` ${dry ? 'DRY ' : 'WET '} ${inCity ? 'IN-CITY' : 'out     '} walk=${Math.hypot(x+115, z-25).toFixed(0).padStart(3)}m near=${ln} ${ld.toFixed(0)}m`
      + `  ${(!dry || inCity || slope > 22) ? 'REJECT' : 'ok'}`);
  }
  return rows;
})()
