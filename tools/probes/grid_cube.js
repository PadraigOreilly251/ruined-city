/* Scan the whole tarn region for cube/rock-sized non-ice non-transparent meshes
   whose base floats above the ground. Report each with coords + how the model reads it. */
(() => {
  const box = new THREE.Box3(), sz = new THREE.Vector3();
  const seen = new Set(), out = [];
  const G = window.__RC_GROUND__, T = window.__RC_TARN__;
  window.__RC_CAM__.scene.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh) return;
    if (o.name === '__tarnice__' || o.name === '__tarncrack__') return;
    if (o.material && (o.material.transparent || o.material.opacity < 0.9)) return;
    box.setFromObject(o); box.getSize(sz);
    const cx = (box.min.x+box.max.x)/2, cz = (box.min.z+box.max.z)/2;
    const maxd = Math.max(sz.x, sz.y, sz.z), mind = Math.min(sz.x, sz.z);
    if (maxd > 3.5 || mind < 0.25) return;                // rock/cube sized only
    if (cx < -142 || cx > -102 || cz < 28 || cz > 76) return;   // tarn region
    const g = G(cx, cz), gap = box.min.y - g;
    if (gap > 0.18 && box.min.y < -0.55 + 1.8){          // floats, near surface
      const chain = []; let p=o.parent, d=0; while(p&&d<3){chain.push(p.name||p.type);p=p.parent;d++;}
      const key = `${cx.toFixed(1)},${cz.toFixed(1)},${box.min.y.toFixed(1)}`;
      if (seen.has(key)) return; seen.add(key);
      out.push({x:+cx.toFixed(1),z:+cz.toFixed(1),base:+box.min.y.toFixed(2),size:[+sz.x.toFixed(2),+sz.y.toFixed(2),+sz.z.toFixed(2)],mat:'#'+(o.material.color?o.material.color.getHexString():'?'),geo:o.geometry.type,ground:+g.toFixed(2),edge:+T.edge(cx,cz).toFixed(1),chain:chain.join('<')});
    }
  });
  out.sort((a,b)=>b.base-a.base);
  return out.map(r=>`(${r.x},${r.z}) base=${r.base} ground=${r.ground} edge=${r.edge} ${r.size.join('x')} #${r.mat.replace('#','')} ${r.geo} [${r.chain}]`).join('\n') || 'none';
})()
