/* Stand the camera in the trail: take a print out of the pool, back up along its
   own heading, and look forward down the line.  &i=fraction into the pool
   &h=eye height  &back=how far back from the print  &leg=nudge along the heading */
(() => {
  const T = window.__RC_TRACKS__;
  const hp = new URLSearchParams(location.hash.slice(1));
  const i = Math.max(1, Math.floor(T.count * (+(hp.get('i') || 0.4))));
  const m = T.mesh.instanceMatrix.array.slice(i * 16, i * 16 + 16);
  const ry = Math.atan2(-m[8], m[10]);              /* heading baked in the matrix */
  const px = m[12], pz = m[14];
  const h = +(hp.get('h') || 2.0), back = +(hp.get('back') || 4.5), fwd = +(hp.get('fwd') || 7);
  const sx = px - Math.sin(ry) * back, sz = pz - Math.cos(ry) * back;
  const tx = px + Math.sin(ry) * fwd, tz = pz + Math.cos(ry) * fwd;
  const { camera, controls } = window.__RC_CAM__;
  window.__RC_FREECAM__ = true;
  camera.up.set(0, 1, 0);
  camera.position.set(sx, groundH(sx, sz) + h, sz);
  controls.target.set(tx, groundH(tx, tz) + 0.05, tz);
  camera.lookAt(controls.target);
  controls.update();
  return [`prints=${T.count} @i=${i} heading=${(ry * 57.3).toFixed(0)}deg`];
})()
