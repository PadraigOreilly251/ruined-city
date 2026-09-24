/* Same framing as look_at, then raycast the lower-centre screen where the big
   cube sits, and report the first hit's world pos + how the model reads it. */
(() => {
  const h = new URLSearchParams(location.hash.slice(1));
  const tx = +(h.get('tx')||-119), tz = +(h.get('tz')||42);
  const d = +(h.get('d')||13), hg = +(h.get('hg')||3), az = ((h.get('az')||210)*Math.PI)/180;
  const G = window.__RC_GROUND__, g = G(tx, tz);
  const { camera, controls } = window.__RC_CAM__;
  const scene = window.__RC_CAM__.scene;
  window.__RC_FREECAM__ = true;
  camera.position.set(tx + Math.sin(az)*d, g + hg, tz + Math.cos(az)*d);
  controls.target.set(tx, g + 0.5, tz); camera.lookAt(controls.target); controls.update();
  scene.updateMatrixWorld(true);
  const meshes = []; scene.traverse(o => { if (o.isMesh && o.visible) meshes.push(o); });
  const rc = new THREE.Raycaster();
  const out = [];
  // sample lower-centre-right of screen (the cube) via NDC
  for (const [nx, ny] of [[0.10,-0.59],[0.13,-0.52],[0.16,-0.46],[0.08,-0.62],[0.18,-0.55],[0.15,-0.35]]){
    rc.setFromCamera(new THREE.Vector2(nx, ny), camera);
    const hits = rc.intersectObjects(meshes, false).filter(x => x.object.material && !x.object.material.transparent).slice(0,3);
    if (!hits.length){ out.push(`ndc(${nx},${ny}) -> only transparent`); continue; }
    for (const hh of hits){ const o = hh.object;
    const bb = new THREE.Box3().setFromObject(o);
    const cx = (bb.min.x+bb.max.x)/2, cz = (bb.max.z+bb.min.z)/2;
    out.push(`ndc(${nx},${ny}) mat=#${(o.material.color?o.material.color.getHexString():'?')} geo=${o.geometry.type} hit(${hh.point.x.toFixed(1)},${hh.point.y.toFixed(1)},${hh.point.z.toFixed(1)}) center=(${cx.toFixed(1)},${cz.toFixed(1)}) base=${bb.min.y.toFixed(2)} top=${bb.max.y.toFixed(2)} size=${(bb.max.x-bb.min.x).toFixed(1)}x${(bb.max.y-bb.min.y).toFixed(1)}x${(bb.max.z-bb.min.z).toFixed(1)} ground@cxz=${G(cx,cz).toFixed(2)} tarnEdge=${window.__RC_TARN__.edge(cx,cz).toFixed(2)} WATER_Y=${WATER_Y} dist=${hh.distance.toFixed(1)}`);
    }
  }
  return out;
})()
