/* What named objects live near a point? Dumps every named mesh/group whose bounding
   box is within R of (x,z), so an "what IS this sand structure" is answered by
   the scene graph, not comments. &a=x,z &R= */
(() => {
  const h = new URLSearchParams(location.hash.slice(1));
  const [ax, az] = (h.get('a') || '-110,78').split(',').map(Number);
  const R = +(h.get('R') || 40);
  const scene = window.__RC_SCENE__ || window.__RC_CAM__.scene;
  const out = [];
  const seen = new Set();
  scene.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    const b = new THREE.Box3().setFromObject(o);
    if (b.isEmpty()) return;
    const cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2;
    const d = Math.hypot(cx - ax, cz - az);
    // also catch big objects that merely span the area
    const spans = b.min.x <= ax + R && b.max.x >= ax - R && b.min.z <= az + R && b.max.z >= az - R;
    if (d > R && !spans) return;
    let name = '';
    for (let p = o; p && p !== scene; p = p.parent) if (p.name) { name = p.name + (name ? '/' + name : ''); }
    const mat = o.material && o.material.color ? '#' + o.material.color.getHexString() : '?';
    const key = `${name}|${mat}|${cx.toFixed(0)},${cz.toFixed(0)}`;
    if (seen.has(key)) return; seen.add(key);
    out.push({ name: name || '(unnamed)', mat, c: [ +cx.toFixed(1), +cz.toFixed(1) ], base: +b.min.y.toFixed(2), top: +b.max.y.toFixed(2), d: +d.toFixed(1), inst: !!o.isInstancedMesh, n: o.count || 1 });
  });
  out.sort((a, b) => a.d - b.d);
  return [`near (${ax},${az}) R=${R}  found ${out.length}`, ...out.slice(0, 45).map((o) => `  [${o.name}] ${o.mat} c=(${o.c}) y=${o.base}..${o.top} d=${o.d}${o.inst ? ' INST' : ''}`)];
})()
