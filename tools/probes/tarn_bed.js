(() => {
  const G = window.__RC_GROUND__;
  const CX = -122, CZ = 52;
  const out = [];
  for (let d = 6; d <= 17; d += 1){
    // sample the bed at several angles, report min/max ground at this radius
    let mn = 99, mx = -99;
    for (let k = 0; k < 8; k++){
      const a = k / 8 * 6.283;
      const g = G(CX + Math.cos(a) * d, CZ + Math.sin(a) * d);
      mn = Math.min(mn, g); mx = Math.max(mx, g);
    }
    out.push(`r=${d}: bed ${mn.toFixed(2)} .. ${mx.toFixed(2)}  (water=-0.55)`);
  }
  return out;
})()
