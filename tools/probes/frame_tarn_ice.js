/* Frame the tarn from wide and pin it frozen solid for a clean winter shot.
   hash: &az &d &hg ; &thaw=1 to leave it open (control shot) */
(() => {
  const h = new URLSearchParams(location.hash.slice(1));
  const G = window.__RC_GROUND__;
  const cx = -122, cz = 52;
  const azig = ((h.get('az') || 205) * Math.PI) / 180;
  const dist = +(h.get('d') || 40), hg = +(h.get('hg') || 22);
  const g = G(cx, cz);
  const { camera, controls } = window.__RC_CAM__;
  window.__RC_FREECAM__ = true;
  camera.position.set(cx + Math.sin(azig) * dist, g + hg, cz + Math.cos(azig) * dist);
  controls.target.set(cx, g + 0.5, cz);
  camera.lookAt(controls.target); controls.update();
  if (window.__RC_TARNICE__) window.__RC_TARNICE__.freeze = (h.get('thaw') ? 0 : 1);
  return { pinned: h.get('thaw') ? 0 : 1 };
})()
