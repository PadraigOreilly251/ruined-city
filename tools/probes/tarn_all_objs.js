(() => {
  const box=new THREE.Box3(), sz=new THREE.Vector3(); const T=window.__RC_TARN__, G=window.__RC_GROUND__;
  const out=[]; const seen=new Set();
  window.__RC_CAM__.scene.traverse(o=>{
    if(!o.isMesh||!o.visible) return;
    if(o.name==='__tarnice__'||o.name==='__tarncrack__') return;
    box.setFromObject(o); box.getSize(sz);
    if(Math.max(sz.x,sz.y,sz.z)>12) return;   // skip planes/grounds
    if(o.material&&(o.material.transparent||o.material.opacity<0.8)) return;
    const cx=(box.min.x+box.max.x)/2, cz=(box.min.z+box.max.z)/2;
    if(T.edge(cx,cz)<=0) return;   // must be over tarn water polygon
    const col=o.material.color?o.material.color.getHexString():'?';
    // exclude the teal water palette (various blues) by requiring reddish/olive/tan (r>g>=b-ish, warm)
    const c=new THREE.Color("#"+col); if(c.g>c.r) return; if(c.b>c.g) return;   // keep warm only
    const gap=box.min.y-G(cx,cz);
    const k=`${cx.toFixed(0)},${cz.toFixed(0)},${box.min.y.toFixed(0)}`; if(seen.has(k))return; seen.add(k);
    out.push(`(${cx.toFixed(1)},${cz.toFixed(1)}) base=${box.min.y.toFixed(2)} g=${G(cx,cz).toFixed(2)} gap=${gap.toFixed(2)} edge=${T.edge(cx,cz).toFixed(1)} ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} #${col} inst=${!!o.isInstancedMesh}`);
  });
  return out.sort().join('\n')||'no warm-colored mesh over tarn';
})()
