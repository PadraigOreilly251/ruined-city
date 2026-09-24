(() => {
  const box=new THREE.Box3(), sz=new THREE.Vector3(); const T=window.__RC_TARN__, G=window.__RC_GROUND__;
  const out=[]; const seen=new Set();
  window.__RC_CAM__.scene.traverse(o=>{
    if(!o.isMesh||!o.visible) return;
    if(o.name==='__tarnice__'||o.name==='__tarncrack__') return;
    box.setFromObject(o); box.getSize(sz);
    const hx=Math.max(sz.x,sz.z), mn=Math.min(sz.x,sz.z);
    // blocky cube-ish: near-equal footprint 0.8..3.5, height comparable
    if(hx<0.8||hx>3.6) return;
    if(sz.y<0.7||sz.y>3.6) return;
    if(mn < hx*0.45) return;
    const cx=(box.min.x+box.max.x)/2, cz=(box.min.z+box.max.z)/2;
    if(cx<-135||cx>-105||cz<30||cz>62) return;
    const gap=box.min.y-G(cx,cz);
    const k=`${cx.toFixed(1)},${cz.toFixed(1)},${box.min.y.toFixed(1)}`; if(seen.has(k))return; seen.add(k);
    const anyOver = T.edge(cx,cz)>0 || T.edge(box.min.x,cz)>0 || T.edge(box.max.x,cz)>0 || T.edge(cx,box.min.z)>0 || T.edge(cx,box.max.z)>0;
    out.push(`base=${box.min.y.toFixed(2)} top=${box.max.y.toFixed(2)} g=${G(cx,cz).toFixed(2)} gap=${gap.toFixed(2)} (${cx.toFixed(1)},${cz.toFixed(1)}) e=${T.edge(cx,cz).toFixed(1)} ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} #${o.material.color?o.material.color.getHexString():'?'} anyCornerOverTarn=${anyOver}`);
  });
  out.sort(); return out.join('\n')||'none';
})()
