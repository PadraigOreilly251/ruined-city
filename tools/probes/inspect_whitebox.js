/* Find meshes whose bbox is enormous (>50 units) OR that the ray hit as white,
   report geometry params + scale + position + material to identify the culprit. */
(() => {
  const box = new THREE.Box3(), sz = new THREE.Vector3(), out = [];
  window.__RC_CAM__.scene.traverse(o => {
    if (!o.isMesh) return;
    box.setFromObject(o); box.getSize(sz);
    const maxd = Math.max(sz.x, sz.y, sz.z);
    if (maxd > 40 && o.name !== '__tarnice__' && o.name !== '__tarncrack__'){
      const p = o.geometry.parameters || {};
      out.push(`name='${o.name||''}' geo=${o.geometry.type} params=W${(p.width||0).toFixed(1)}xH${(p.height||0).toFixed(1)}xD${(p.depth||0).toFixed(1)} scale=(${o.scale.x.toFixed(2)},${o.scale.y.toFixed(2)},${o.scale.z.toFixed(2)}) pos=(${o.position.x.toFixed(1)},${o.position.y.toFixed(1)},${o.position.z.toFixed(1)}) bbox=${sz.x.toFixed(0)}x${sz.y.toFixed(0)}x${sz.z.toFixed(0)} mat=#${o.material.color?o.material.color.getHexString():'?'} transparent=${o.material.transparent} visible=${o.visible}`);
    }
  });
  return out.join('\n') || 'no >40 meshes';
})()
