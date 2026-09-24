(() => {
  const box=new THREE.Box3(), sz=new THREE.Vector3(); const T=window.__RC_TARN__, G=window.__RC_GROUND__;
  const out=[]; const seen=new Set();
  window.__RC_CAM__.scene.traverse(o=>{
    if(!o.isMesh||!o.visible) return;
    if(o.name==='__tarnice__'||o.name==='__tarncrack__') return;
    box.setFromObject(o); box.getSize(sz);
    if(Math.max(sz.x,sz.y,sz.z)>14) return;
    if(o.material&&(o.material.transparent||o.material.opacity<0.8)) return;
    const cx=(box.min.x+box.max.x)/2, cz=(box.min.z+box.max.z)/2;
    if(T.edge(cx,cz)<=0) return;
    const col=o.material.color?o.material.color.getHexString():'?'; const c=new THREE.Color('#'+col);
    if(c.b>c.r) return;                       // drop pure blues (water)
    if(sz.x<0.2&&sz.z<0.2) return;           // drop tiny sticks
    const gap=box.min.y-G(cx,cz);
    const k=`${cx.toFixed(1)},${cz.toFixed(1)},${box.min.y.toFixed(1)},${sz.x.toFixed(0)}`; if(seen.has(k))return; seen.add(k);
    out.push(`base=${box.min.y.toFixed(2)} top=${box.max.y.toFixed(2)} gap=${gap.toFixed(2)} (${cx.toFixed(1)},${cz.toFixed(1)}) e=${T.edge(cx,cz).toFixed(1)} ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} #${col}`);
  });
  out.sort(); return out.join('\n')||'nothing';
})()
