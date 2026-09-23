/* Isolated JS cost of the deer update (no renderer in the number).
   fastForward() drives updateDeer at a fixed dt, so this is per-frame CPU for
   the herd logic alone — the metric that mattered when the HUD cost 34ms/frame. */
(() => {
  const H = window.__RC_HERD__, D = window._deer;
  const runs = [];
  for (let k = 0; k < 5; k++){
    const t0 = performance.now();
    H.fastForward(32, 0.016);          /* 2000 frames */
    const t1 = performance.now();
    runs.push((t1 - t0) / 2000);
  }
  runs.sort((a, b) => a - b);
  const med = runs[2];
  return [
    `animals=${D.length}`,
    `updateDeer per frame: min=${runs[0].toFixed(3)}ms med=${med.toFixed(3)}ms max=${runs[4].toFixed(3)}ms`,
    `budget at 60fps: ${(med / 16.67 * 100).toFixed(2)}% of a frame`,
    `budget at 30fps: ${(med / 33.3 * 100).toFixed(2)}% of a frame`,
  ];
})()
