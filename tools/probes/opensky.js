/* Is a point open (no roof overhead), and what is underfoot?
   Raycasts down from y=80 over mesh children only — sprites in the scene have null
   materials and throw inside raycast(), so they are filtered out. */
(() => {
  const { scene } = window.__RC_CAM__;
  const THREE = window.__RC_THREE__, G = window.__RC_GROUND__;
  const targets = [];
  scene.traverse(o => { if (o.isMesh && o.visible !== false && o.material) targets.push(o); });
  const cands = {
    meadow_now: [-115, 20], nw_upland: [-175, -65], fair_field: [-45, -118],
    city_w_st: [-70, 45], city_w_st2: [-85, 60], city_near_cat: [-88, 40],
    city_green: [-60, 70], lee_of_city: [-100, 45], plaza_x: [-30, 30]
  };
  const rows = [];
  for (const [k, [x, z]] of Object.entries(cands)){
    const g = G(x, z);
    const ray = new THREE.Raycaster(new THREE.Vector3(x, 80, z), new THREE.Vector3(0, -1, 0), 0, 200);
    let best = null;
    for (const o of targets){
      let hits = [];
      try { hits = ray.intersectObject(o, false); } catch (e) { continue; }
      for (const h of hits) if (!best || h.distance < best.distance) best = { y: h.point.y, o };
    }
    const hitY = best ? +best.y.toFixed(1) : null;
    const name = best ? (best.o.name || best.o.geometry?.type || 'obj') : 'nothing';
    const clear = best ? (best.y - g) : 999;
    rows.push(k.padEnd(14) + ` (${String(x).padStart(4)},${String(z).padStart(3)}) ground=${g.toFixed(1).padStart(5)}`
      + ` firstHitY=${hitY === null ? '  none' : String(hitY).padStart(5)} ${String(name).padEnd(18)}`
      + ` clearance=${best ? clear.toFixed(1) + 'm' : 'open'}`
      + `  ${clear > 1.5 ? 'ROOF-OVERHEAD' : 'open'}`);
  }
  return ['meshes tested: ' + targets.length].concat(rows);
})()
