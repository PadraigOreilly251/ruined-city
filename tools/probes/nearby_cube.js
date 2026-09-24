/* All non-ice meshes with a rock/cube-sized bbox near a world point. */
(() => {
  const h = new URLSearchParams(location.hash.slice(1));
  const px = +(h.get('px')||-123.5), pz = +(h.get('pz')||35.5);
  const box = new THREE.Box3(), sz = new THREE.Vector3();
  const out = [];
  window.__RC_CAM__.scene.traverse(o => {
    if (!o.isMesh || o.name === '__tarnice__' || o.name === '__tarncrack__') return;
    if (o.material && o.material.transparent) return;
    box.setFromObject(o); box.getSize(sz);
    const cx = (box.min.x+box.max.x)/2, cz = (box.min.z+box.max.z)/2;
    const dd = Math.hypot(cx-px, cz-pz);
    const maxd = Math.max(sz.x, sz.y, sz.z);
    if (dd < 6 && maxd > 0.8 && maxd < 4 && box.min.y > -4 && box.min.y < 3){
      const chain = []; let p = o.parent, d=0; while(p && d<4){ chain.push(p.name||p.type); p=p.parent; d++; }
      out.push(`@(${cx.toFixed(1)},${cz.toFixed(1)}) base=${box.min.y.toFixed(2)} top=${box.max.y.toFixed(2)} size=${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} mat=#${(o.material.color?o.material.color.getHexString():'?')} geo=${o.geometry.type} ground=${window.__RC_GROUND__(cx,cz).toFixed(2)} tarnEdge=${window.__RC_TARN__.edge(cx,cz).toFixed(2)} chain=${chain.join('<')}`);
    }
  });
  out.sort((a,b)=>{ const na=+a.match(/@\(([-\d.]+)/)[1]; return 0; });
  return out.length? out.join('\n') : 'none near that point';
})()
