/* Find a natural low basin for a west-side tarn. Wants: low ground (0..2),
   flat enough not to cliff, clear of reserved lots, near the deer ranges. */
(() => {
  const G = window.__RC_GROUND__;
  const cands = [[-128,66],[-140,78],[-118,88],[-152,52],[-108,70],[-136,38],[-160,92],[-95,92],[-122,52],[-146,66]];
  const R = 18, STEP = 3;
  const out = [];
  for (const [cx, cz] of cands){
    let lo = 1e9, hi = -1e9, sum = 0, n = 0;
    for (let x = cx - R; x <= cx + R; x += STEP) for (let z = cz - R; z <= cz + R; z += STEP){
      const h = G(x, z); lo = Math.min(lo, h); hi = Math.max(hi, h); sum += h; n++;
    }
    const d = (ax, az) => Math.hypot(cx - ax, cz - az).toFixed(0);
    out.push(`(${cx},${cz}) mean=${(sum/n).toFixed(2)} lo=${lo.toFixed(2)} hi=${hi.toFixed(2)} spread=${(hi-lo).toFixed(2)} | meadow ${d(-115,20)} fair ${d(-38,-118)} oak ${d(-150,-20)} lee ${d(-95,55)} | res ${d(-165,255)} arr ${d(4,256)} wheel ${d(-55,-112)} | cityEdge ${Math.max(Math.abs(cx)-96,0).toFixed(0)}`);
  }
  return out;
})()
