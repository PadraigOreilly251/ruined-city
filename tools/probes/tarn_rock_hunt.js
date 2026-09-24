/* List non-ice Meshes over the tarn whose base floats above ground, biggest first.
   Attach ancestor chain so I can trace the building code that placed them. */
(() => {
  const scene = window.__RC_CAM__.scene;
  const box = new THREE.Box3(), sz = new THREE.Vector3();
  const rows = [];
  scene.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh) return;
    if (o.name === '__tarnice__' || o.name === '__tarncrack__') return;
    box.setFromObject(o); box.getSize(sz);
    const c = new THREE.Vector3(); box.getCenter(c);
    if (window.__RC_TARN__.edge(c.x, c.z) <= 0) return;
    const g = window.__RC_GROUND__(c.x, c.z);
    const gap = box.min.y - g;
    if (gap > 0.15 && box.min.y < -0.55 + 3 && Math.max(sz.x,sz.y,sz.z) < 4 && Math.max(sz.x,sz.z) > 0.2){
      const chain = []; let p = o.parent, d = 0;
      while (p && d < 4){ chain.push(p.name || p.type); p = p.parent; d++; }
      rows.push({ size:[+sz.x.toFixed(2),+sz.y.toFixed(2),+sz.z.toFixed(2)], pos:[+c.x.toFixed(1),+box.min.y.toFixed(2),+c.z.toFixed(1)], gap:+gap.toFixed(2), mat:'#'+(o.material.color?o.material.color.getHexString():'?'), geo:o.geometry.type, chain:chain.join('<') });
    }
  });
  rows.sort((a,b) => (b.size[0]*b.size[2]) - (a.size[0]*a.size[2]));
  return rows.slice(0, 12);
})()
