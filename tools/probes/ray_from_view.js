/* Frame the pond AND raycast in one shot (camera does not survive between CDP calls).
   Sets the camera like pond_view, then casts a fan of rays and reports what's hit.
   &pondd=tarn|lake  &yaw=deg  &h=height above water */
(() => {
  const h = new URLSearchParams(location.hash.slice(1));
  const pond = h.get('pondd') || 'tarn';
  const yaw = (+(h.get('yaw') || 200) * Math.PI) / 180;
  const hh = +(h.get('h') || 1.4);
  const T = window.__RC_TARN__ || { def: TARN };
  const cx = pond === 'tarn' ? T.def.x : LAKE_CX;
  const cz = pond === 'tarn' ? T.def.z : LAKE_CZ;
  const R = pond === 'tarn' ? 34 : 80;
  const { camera, controls } = window.__RC_CAM__;
  const scene = window.__RC_SCENE__ || window.__RC_CAM__.scene;
  window.__RC_FREECAM__ = true;
  const px = cx + Math.sin(yaw) * R, pz = cz + Math.cos(yaw) * R;
  camera.position.set(px, WATER_Y + hh, pz);
  controls.target.set(cx, WATER_Y + 0.4, cz);
  camera.lookAt(controls.target); controls.update();

  const cp = camera.position.clone();
  const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
  const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize();
  const up = new THREE.Vector3().crossVectors(right, dir).normalize();
  const rc = new THREE.Raycaster();
  const hits = new Map();
  // pre-filter to solid meshes; sprites / null-matrix objects throw in raycast()
  scene.updateMatrixWorld(true);
  const meshes = [];
  scene.traverse((o) => { if (o.isMesh && o.visible && o.matrixWorld) meshes.push(o); });
  for (let a = -0.1; a <= 0.1; a += 0.02)
    for (let b = -0.03; b <= 0.08; b += 0.02) {
      const d = dir.clone().addScaledVector(right, a).addScaledVector(up, b).normalize();
      rc.set(cp, d); rc.near = 0; rc.far = 500;
      for (const hit of rc.intersectObjects(meshes, false)) {
        if (!hit.object.isMesh) continue;
        const bb = new THREE.Box3().setFromObject(hit.object);
        const key = (hit.object.name || hit.object.geometry?.type || 'mesh') +
          '|' + [hit.object.position.x.toFixed(0), hit.object.position.y.toFixed(0), hit.object.position.z.toFixed(0)].join(',') +
          '|' + [+bb.min.x.toFixed(0), +bb.min.y.toFixed(0), +bb.min.z.toFixed(0)].join(',');
        if (hits.has(key)) continue;
        hits.set(key, {
          mat: hit.object.material && hit.object.material.color ? '#' + hit.object.material.color.getHexString() : '?',
          pt: [hit.point.x, hit.point.y, hit.point.z].map((v) => +v.toFixed(1)),
          base: +bb.min.y.toFixed(2), top: +bb.max.y.toFixed(2),
          size: [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z].map((v) => +v.toFixed(1)).join('x'),
          dist: +hit.distance.toFixed(1),
        });
      }
    }
  const arr = [...hits.values()].sort((a, b) => a.dist - b.dist);
  return [
    `cam=(${cp.x.toFixed(1)},${cp.y.toFixed(1)},${cp.z.toFixed(1)}) look->(${cx},${cz}) WATER_Y=${WATER_Y}`,
    `meshes hit: ${arr.length}`,
  ].concat(arr.slice(0, 40).map((x) => `  ${x.mat} hit(${x.pt}) base=${x.base} top=${x.top} ${x.size} @${x.dist}m`));
})()
