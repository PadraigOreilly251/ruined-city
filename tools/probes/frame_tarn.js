/* Frame the tarn. &az azimuth deg, &d distance, &hg height */
(() => {
  const h = new URLSearchParams(location.hash.slice(1));
  const G = window.__RC_GROUND__;
  const cx = -122, cz = 52;
  const azig = ((h.get('az') || 210) * Math.PI) / 180;
  const dist = +(h.get('d') || 30), hg = +(h.get('hg') || 9);
  const g = G(cx, cz);
  const { camera, controls } = window.__RC_CAM__;
  window.__RC_FREECAM__ = true;
  camera.position.set(cx + Math.sin(azig) * dist, g + hg, cz + Math.cos(azig) * dist);
  controls.target.set(cx, g + 0.6, cz);
  camera.lookAt(controls.target); controls.update();
  /* consistency: every point the shore model calls water must be carved below the surface */
  let wetNotCarved = 0, dryAbove = 0, n = 0;
  for (let x = cx - 26; x <= cx + 26; x += 1) for (let z = cz - 26; z <= cz + 26; z += 1){
    const e = window.__RC_TARN__.edge(x, z), gh = G(x, z); n++;
    if (e > 0 && gh > -0.55) wetNotCarved++;
    if (e <= 0 && e > -7 && gh < -0.55) dryAbove++;
  }
  return { framed: [cx, cz], bankGround: +g.toFixed(2), samples: n, wetButNotCarved: wetNotCarved, bankBelowWater: dryAbove };
})()
