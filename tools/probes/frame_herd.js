/* Frame the herd wherever it actually is. Optional override: &h=x,z,yaw degrees */
(() => {
  const h = new URLSearchParams(location.hash.slice(1));
  const H = window._herd;
  let ax = H.cx, az = H.cz;
  if (h.get('h')) { const [x, z] = h.get('h').split(',').map(Number); ax = x; az = z; }
  const g = window.__RC_GROUND__(ax, az);
  const { camera, controls } = window.__RC_CAM__;
  window.__RC_FREECAM__ = true;
  const dist = +(h.get('d') || 30);
  const azig = ((h.get('az') || 215) * Math.PI) / 180;
  camera.position.set(ax + Math.sin(azig) * dist, g + 12, az + Math.cos(azig) * dist);
  controls.target.set(ax, g + 1.4, az);
  camera.lookAt(controls.target);
  controls.update();
  return { framed: [+ax.toFixed(0), +az.toFixed(0)], ground: +g.toFixed(1), herdMoving: H.moving };
})()
