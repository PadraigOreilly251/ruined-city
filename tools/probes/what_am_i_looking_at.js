/* Where am I and WHAT is that mesh? Cast rays from the current camera and report
   world position + object identity + base height of everything hit, so a
   'floating rock' claim is pinned to a real mesh, not a guess.
   Uses whatever camera the last probe left behind. */
(() => {
  const { camera } = window.__RC_CAM__;
  const scene = window.__RC_SCENE__ || window.__RC_CAM__.scene;
  const cp = camera.position.clone();
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  const rc = new THREE.Raycaster(cp, dir.clone(), 0, 400);
  // fan a small grid of rays so we catch the mass, not a one-pixel sliver
  const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize();
  const up = new THREE.Vector3().crossVectors(right, dir).normalize();
  const hits = new Map();
  for (let a = -0.08; a <= 0.08; a += 0.02) {
    for (let b = -0.05; b <= 0.05; b += 0.02) {
      const d = dir.clone().addScaledVector(right, a).addScaledVector(up, b).normalize();
      for (const h of rc.set(cp, d).intersectObject(scene, true)) {
        if (!h.object.isMesh) continue;
        const bb = new THREE.Box3().setFromObject(h.object);
        const key = (h.object.name || h.object.geometry?.type || 'mesh') + '@' +
          [h.object.position.x.toFixed(0), h.object.position.y.toFixed(0), h.object.position.z.toFixed(0)].join(',');
        if (hits.has(key)) continue;
        hits.set(key, {
          key,
          mat: h.object.material && h.object.material.color ? '#' + h.object.material.color.getHexString() : '?',
          point: [h.point.x, h.point.y, h.point.z].map((v) => +v.toFixed(1)),
          baseY: +bb.min.y.toFixed(2), topY: +bb.max.y.toFixed(2),
          size: [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z].map((v) => +v.toFixed(1)).join('x'),
          dist: +h.distance.toFixed(1),
        });
      }
    }
  }
  const arr = [...hits.values()].sort((a, b) => a.dist - b.dist);
  return [
    `cam=(${cp.x.toFixed(1)},${cp.y.toFixed(1)},${cp.z.toFixed(1)}) dir=(${dir.x.toFixed(2)},${dir.y.toFixed(2)},${dir.z.toFixed(2)})`,
    `WATER_Y=${WATER_Y}`,
    `meshes hit: ${arr.length}`,
  ].concat(arr.slice(0, 30).map((x) => `  ${x.key} ${x.mat} hit=${x.point} base=${x.baseY} top=${x.topY} ${x.size} @${x.dist}m`));
})()
