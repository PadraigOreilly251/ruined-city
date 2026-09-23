/* What is floating over a POND, precisely?
   Gates on the real water mask, not a radius circle.
   &pondd=tarn|lake   which water body (default tarn)
   &pad=0.15          how far above the water surface counts as "floating"
   Reports objects whose horizontal centre is IN the water AND whose lowest point
   sits above the waterline (i.e. nothing supports them). */
(() => {
  const h = new URLSearchParams(location.hash.slice(1));
  const pond = h.get('pondd') || 'tarn';
  const pad = +(h.get('pad') || 0.15);
  // in-water test for the chosen pond
  let inWater;
  if (pond === 'tarn') {
    inWater = (x, z) => (window.__RC_TARN__ ? window.__RC_TARN__.edge(x, z) : tarnEdge(x, z)) > 0;
  } else {
    inWater = (x, z) => ((x - LAKE_CX) / LAKE_RX) ** 2 + ((z - LAKE_CZ) / LAKE_RZ) ** 2 <= 1;
  }
  const bb = new THREE.Box3();
  const hits = [];
  const scene = window.__RC_SCENE__ || window.__RC_CAM__.scene;
  const centerOver = (x, z) => inWater(x, z);
  // who owns this object? walk up the parent chain to name the group (cathedral? reeds?)
  const lineage = (o) => {
    const parts = [];
    for (let p = o; p && p !== scene; p = p.parent) {
      if (p.name) parts.unshift(p.name);
    }
    return parts.join('/') || (o.parent && o.parent.type) || '?';
  };

  const consider = (o, label, box, mat) => {
    const cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2;
    if (!centerOver(cx, cz)) return;
    if (box.min.y < WATER_Y + pad) return;   // touching/below water = not floating
    hits.push({
      label, mat, group: lineage(o),
      at: `${cx.toFixed(0)},${cz.toFixed(0)}`,
      base: +box.min.y.toFixed(2),
      over: +(box.min.y - WATER_Y).toFixed(2),
      size: [box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z].map((v) => +v.toFixed(1)).join('x'),
    });
  };

  scene.traverse((o) => {
    if (!o.visible) return;
    if (o.isInstancedMesh) {
      const im = o.instanceMatrix.array;
      for (let i = 0; i < o.count; i++) {
        const m = im.slice(i * 16, i * 16 + 16);
        const px = m[12], py = m[13], pz = m[14];
        const sx = Math.hypot(m[0], m[1], m[2]), sy = Math.hypot(m[4], m[5], m[6]), sz = Math.hypot(m[8], m[9], m[10]);
        // instance is a unit box scaled+rotated; approximate AABB as center +/- half-diagonal per axis
        const hx = sx / 2, hy = sy / 2, hz = sz / 2;
        const box = { min: { x: px - hx, y: py - hy, z: pz - hz }, max: { x: px + hx, y: py + hy, z: pz + hz } };
        consider(o, `${o.name || 'inst'}#${i}`, box, o.material && o.material.color ? '#' + o.material.color.getHexString() : '?');
      }
      return;
    }
    if (!o.isMesh) return;
    bb.setFromObject(o);
    if (bb.isEmpty()) return;
    consider(o, o.name || o.geometry?.type || 'mesh', { min: bb.min, max: bb.max },
      o.material && o.material.color ? '#' + o.material.color.getHexString() : '?');
  });

  hits.sort((a, b) => b.over - a.over);
  const byKind = {};
  hits.forEach((x) => { const k = x.group + ' :: ' + x.label.replace(/#\d+/, '#N') + '|' + x.mat; byKind[k] = (byKind[k] || 0) + 1; });
  return [
    `WATER_Y=${WATER_Y}  pond=${pond}  pad=${pad}`,
    `FLOATING objects: ${hits.length}`,
    `grouped by owner: ` + Object.entries(byKind).map(([k, v]) => `${k} x${v}`).join('   ||  '),
    '---- top 30 by height above water ----',
  ].concat(hits.slice(0, 30).map((x) => `  [${x.group}] ${x.label} ${x.mat} at(${x.at}) base=${x.base} (+${x.over}) ${x.size}`));
})()
