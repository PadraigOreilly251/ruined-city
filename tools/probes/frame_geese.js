/* Fly the flock, measure the wedge, then freeze the drift and frame it from below.
   &ff=sim seconds to fly, &o=camera offset to the right, &hg=height above/below,
   &spd=0.25 nearly-freezes the flock so the shot holds */
(() => {
  const G = window.__RC_GEESE__, S = G.st;
  const h = new URLSearchParams(location.hash.slice(1));
  S.home = 'tarn';
  G.depart();
  G.fastForward(+(h.get('ff') || 22));
  const dir = S.dir, fwd = { x: Math.sin(dir), z: Math.cos(dir) }, right = { x: Math.cos(dir), z: -Math.sin(dir) };
  const lead = G.birds[0].g.position;
  const rows = [];
  for (let k = 1; k < G.birds.length; k++) {
    const b = G.birds[k].g.position;
    const dx = b.x - lead.x, dz = b.z - lead.z;
    const back = -(dx * fwd.x + dz * fwd.z), out = dx * right.x + dz * right.z;
    const rank = Math.ceil(k / 2), side = (k % 2 === 0 ? 1 : -1);
    rows.push(`#${k} back=${back.toFixed(1)} (want ${(3.2 * rank).toFixed(1)})  out=${out.toFixed(1)} (want ${(2.4 * rank * side).toFixed(1)})`);
  }
  S.spd = +(h.get('spd') || 0.25);
  const { camera, controls } = window.__RC_CAM__;
  window.__RC_FREECAM__ = true;
  const o = +(h.get('o') || 17), hg = +(h.get('hg') || -9);
  camera.position.set(lead.x + right.x * o, lead.y + hg, lead.z + right.z * o);
  controls.target.set(lead.x, lead.y, lead.z);
  camera.lookAt(controls.target); controls.update();
  return [`mode=${S.mode} alt=${S.alt.toFixed(1)} pos=(${S.x.toFixed(0)},${S.z.toFixed(0)}) dir=${(dir * 57.3).toFixed(0)}deg`].concat(rows);
})()
