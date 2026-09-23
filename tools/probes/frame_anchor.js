/* Frame a candidate range anchor from the air. Pass it in the hash: &a=x,y
   Usage: node tools/cdp.mjs shot out.png "#time=9&a=-175,-65" 1200 tools/probes/frame_anchor.js */
(() => {
  const h = new URLSearchParams(location.hash.slice(1));
  const [ax, az] = (h.get('a') || '-115,20').split(',').map(Number);
  const g = window.__RC_GROUND__(ax, az);
  const { camera, controls } = window.__RC_CAM__;
  window.__RC_FREECAM__ = true;
  camera.position.set(ax + 26, g + 24, az + 30);
  controls.target.set(ax, g + 1, az);
  camera.lookAt(controls.target);
  controls.update();
  return { framed: [ax, az], ground: +g.toFixed(1) };
})()
