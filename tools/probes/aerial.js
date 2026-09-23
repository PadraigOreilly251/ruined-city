/* Aerial straight down-ish over a point to see floating objects cleanly. */
(() => {
  const h = new URLSearchParams(location.hash.slice(1));
  const [ax, az] = (h.get('a') || '145,198').split(',').map(Number);
  const alt = +(h.get('alt') || 60);
  const tilt = +(h.get('tilt') || 35); // degrees from straight-down toward horizon
  const yaw = (+(h.get('yaw') || 210) * Math.PI) / 180;
  const { camera, controls } = window.__RC_CAM__;
  window.__RC_FREECAM__ = true;
  const horiz = alt * Math.tan(tilt * Math.PI / 180) * 0.6;
  camera.position.set(ax + Math.sin(yaw) * horiz, alt, az + Math.cos(yaw) * horiz);
  controls.target.set(ax, WATER_Y, az);
  camera.lookAt(controls.target); controls.update();
  return { cam: camera.position.toArray().map((v) => +v.toFixed(0)), look: [ax, az] };
})()
