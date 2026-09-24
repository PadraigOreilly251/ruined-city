/* Broad sweep: any non-ice, opaque mesh whose base sits above the ground while
   its centre is near/below the water surface, over a wide box around the tarn.
   Ignore size entirely so a big cube is not missed. */
(() => {
  const box = new THREE.Box3(), sz = new THREE.Vector3();
  const G = window.__RC_GROUND__, T = window.__RC_TARN__;
  const out = [], seen = new Set();
  window.__RC_CAM__.scene.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh) return;
    if (o.name === '__tarnice__' || o.name === '__tarncrack__') return;
    if (o.material && (o.material.transparent || o.material.opacity < 0.9)) return;
    box.setFromObject(o); box.getSize(sz);
    const cx=(box.min.x+box.max.x)/2, cz=(box.min.z+box.max.z)/2;
    if (cx<-150||cx>-100||cz<24||cz>80) return;
    const maxd=Math.max(sz.x,sz.z); if (maxd<0.5||maxd>12) return;
    const g=G(cx,cz), gap=box.min.y-g;
    /* base floats above ground AND is near the waterline (in the water band) */
    if (gap>0.18 && box.min.y>-2.5 && box.min.y<1.5){
      const key=`${cx.toFixed(0)},${cz.toFixed(0)},${box.min.y.toFixed(1)},${sz.x.toFixed(0)}`;
      if(seen.has(key))return; seen.add(key);
      const chain=[];let p=o.parent,d=0;while(p&&d<3){chain.push(p.name||p.type);p=p.parent;d++;}
      out.push(`(${cx.toFixed(1)},${cz.toFixed(1)}) base=${box.min.y.toFixed(2)} ground=${g.toFixed(2)} gap=${gap.toFixed(2)} edge=${T.edge(cx,cz).toFixed(1)} ${sz.x.toFixed(1)}x${sz.y.toFixed(1)}x${sz.z.toFixed(1)} #${o.material.color?o.material.color.getHexString():'?'} ${o.geometry.type} [${chain.join('<')}]`);
    }
  });
  out.sort();
  return out.join('\n') || 'NONE';
})()
