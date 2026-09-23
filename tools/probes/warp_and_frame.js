/* Warp the herd to wherever its season has taken it, then frame it.
   &s   sim seconds to fast-forward (default 900, enough for any migration)
   &to  if set, flip the season first so the migration actually runs on camera
   &az  camera azimuth deg   &d distance   &hg camera height above ground */
(() => {
  const h = new URLSearchParams(location.hash.slice(1));
  const H = window._herd;
  H.rest = 0;
  if (h.get('to') !== null) window.__RC_HERD__.setSeason(+h.get('to'));
  window.__RC_HERD__.fastForward(+(h.get('s') || 900));
  const { camera, controls } = window.__RC_CAM__;
  const dist = +(h.get('d') || 34), hg = +(h.get('hg') || 11);
  const azig = ((h.get('az') || 215) * Math.PI) / 180;
  const g = window.__RC_GROUND__(H.cx, H.cz);
  window.__RC_FREECAM__ = true;
  camera.position.set(H.cx + Math.sin(azig) * dist, g + hg, H.cz + Math.cos(azig) * dist);
  controls.target.set(H.cx, g + 1.2, H.cz);
  camera.lookAt(controls.target);
  controls.update();
  const d = window._deer.map(a => +Math.hypot(a.g.position.x - H.cx, a.g.position.z - H.cz).toFixed(1));
  const heading = Math.atan2(H.cx - (-115), H.cz - 20) * 180 / Math.PI;
  return {
    centre: [+H.cx.toFixed(0), +H.cz.toFixed(0)], ground: +g.toFixed(1),
    idx: H.idx, moving: H.moving, walked: +H.walked.toFixed(0),
    deerSpread: `${Math.min(...d)}..${Math.max(...d)}m`,
    states: [...new Set(window._deer.map(a => a.state))].join(','),
  };
})()
