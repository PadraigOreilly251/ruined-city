/* Ground truth: EVERY object over the tarn with a real floating gap.
   No color filtering. Flags objects whose BASE is above WATER_Y+pad while their
   centre is over water, then buckets by shape so water tiles / cattails /
   half-submerged rocks can be told apart from genuine floating debris.
   &pad=gap above water to count as floating (default 0.25)
   &r=override scan radius from tarn centre (default 26) */
(() => {
  const h = new URLSearchParams(location.hash.slice(1));
  const pad = +(h.get('pad') || 0.25);
  const R = +(h.get('r') || 26);
  const T = window.__RC_TARN__ || { def: TARN, edge: () => -99 };
  const scene = window.__RC_SCENE__ || window.__RC_CAM__.scene;
  const pond = h.get('pondd') || 'tarn';
  const strict = h.get('strict') !== '0';
  const lo = +(h.get('lo') || 0.1);   // near-water band: gap from here
  const hi = +(h.get('hi') || 6.0);   // ...to here (above hi = cloud, ignore)
  const overWater = (x, z) => {
    if (pond === 'lake') return ((x - LAKE_CX) / LAKE_RX) ** 2 + ((z - LAKE_CZ) / LAKE_RZ) ** 2 <= 1;
    return T.edge(x, z) > 0 || (!strict && Math.hypot(x - T.def.x, z - T.def.z) <= R);
  };
  const rows = [];
  const chain = (o) => {
    const parts = [];
    for (let p = o; p && p.parent; p = p.parent) { if (p.name) parts.unshift(p.name); }
    return parts.join('/') || '(unnamed)';
  };
  const push = (name, mat, x, z, baseY, size) => {
    if (!overWater(x, z)) return;
    if (baseY <= WATER_Y + lo) return;   // touching/below = grounded
    if (baseY > WATER_Y + hi) return;   // high = cloud, ignore
    const [sx, sy, sz] = size;
    let tag = 'DEBRIS?';
    if (mat === '#ffffff' && sy <= 0.2) tag = 'water-tile (thin, ignore)';
    else if (sy <= 0.2) tag = 'thin-flake';
    else if (sx <= 0.5 && sy >= 0.3 && (mat === '#8d7155' || mat === '#a38364' || mat === '#14100a')) tag = 'cattail/plant';
    rows.push({ name, mat, tag, x: +x.toFixed(1), z: +z.toFixed(1), base: +baseY.toFixed(2), gap: +(baseY - WATER_Y).toFixed(2), size: size.map((v) => +v.toFixed(2)).join('x') });
  };
  scene.traverse((o) => {
    if (!o.visible) return;
    if (o.isInstancedMesh) {
      const hex = o.material && o.material.color ? '#' + o.material.color.getHexString() : '#000000';
      const im = o.instanceMatrix.array;
      for (let i = 0; i < o.count; i++) {
        const m = im.slice(i * 16, i * 16 + 16);
        const px = m[12], py = m[13], pz = m[14];
        const sx = Math.hypot(m[0], m[1], m[2]), sy = Math.hypot(m[4], m[5], m[6]), sz = Math.hypot(m[8], m[9], m[10]);
        let mh = hex;
        if (o.instanceColor) { const a = o.instanceColor.array; mh = '#' + new THREE.Color(a[i * 3], a[i * 3 + 1], a[i * 3 + 2]).getHexString(); }
        push(`${o.name || 'inst'}#${i} {${o.geometry.type}}`, mh, px, pz, py - sy / 2, [sx, sy, sz]);
      }
      return;
    }
    if (!o.isMesh) return;
    const b = new THREE.Box3().setFromObject(o); if (b.isEmpty()) return;
    const x = (b.min.x + b.max.x) / 2, z = (b.min.z + b.max.z) / 2;
    const hex = o.material && o.material.color ? '#' + o.material.color.getHexString() : '#000000';
    push(`${o.name || o.geometry?.type || 'mesh'} ⟨${chain(o)}⟩`, hex, x, z, b.min.y, [b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z]);
  });
  rows.sort((a, b) => b.gap - a.gap);
  const bucket = {};
  rows.forEach((r) => { bucket[r.tag] = (bucket[r.tag] || 0) + 1; });
  return [
    `pad=${pad}  R=${R}  WATER_Y=${WATER_Y}`,
    `things over tarn with a floating gap: ${rows.length}`,
    `buckets: ` + Object.entries(bucket).map(([k, v]) => `${k} x${v}`).join('   |   '),
    '---- likely REAL floating debris (non-water, non-cattail) ----',
  ].concat(rows.filter((r) => r.tag === 'DEBRIS?').slice(0, 40).map((r) => `  ${r.name} ${r.mat} (${r.x},${r.z}) base=${r.base} gap=+${r.gap} ${r.size}`));
})()
