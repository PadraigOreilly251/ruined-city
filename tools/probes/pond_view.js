/* Look AT the goose home pond from just above the water, scanning shore clutter.
   &pondd=tarn|lake  &yaw=camera compass around the pond  &h=height above water
   Frames the far shore so floating rocks read against the water band. */
(() => {
  const h = new URLSearchParams(location.hash.slice(1));
  const pond = h.get('pondd') || 'tarn';
  const yaw = (+(h.get('yaw') || 0) * Math.PI) / 180;
  const hh = +(h.get('h') || 1.2);
  const cx = pond === 'tarn' ? (window.__RC_TARN__ ? window.__RC_TARN__.def.x : TARN.x) : LAKE_CX;
  const cz = pond === 'tarn' ? (window.__RC_TARN__ ? window.__RC_TARN__.def.z : TARN.z) : LAKE_CZ;
  const R = pond === 'tarn' ? 34 : 80;
  const { camera, controls } = window.__RC_CAM__;
  window.__RC_FREECAM__ = true;
  const px = cx + Math.sin(yaw) * R, pz = cz + Math.cos(yaw) * R;
  camera.position.set(px, WATER_Y + hh, pz);
  controls.target.set(cx, WATER_Y + 0.4, cz);
  camera.lookAt(controls.target); controls.update();
  return { pond, cam: `${px.toFixed(0)},${WATER_Y + hh},${pz.toFixed(0)}`, look: `${cx},${cz}`, geese_home: window.__RC_GEESE__ ? window.__RC_GEESE__.st.home : '?' };
})()
