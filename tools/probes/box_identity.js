(() => {
  const P=new THREE.Vector3(-122.7, 0.3, 36.7);
  const box=new THREE.Box3(); const out=[];
  window.__RC_CAM__.scene.traverse(o=>{
    if(!o.isMesh) return;
    box.setFromObject(o);
    if(!box.containsPoint(P)) return;
    const s=Math.max(...box.getSize(new THREE.Vector3()).toArray());
    if(s<40) return;
    const chain=[]; let p=o,d=0; while(p&&d<5){ chain.push((p.name||p.type)+(p===o?'*':'')); p=p.parent; d++; }
    const m=o.material;
    out.push(`bb=[${box.min.x.toFixed(0)},${box.min.y.toFixed(0)},${box.min.z.toFixed(0)}..${box.max.x.toFixed(0)},${box.max.y.toFixed(0)},${box.max.z.toFixed(0)}] side=${m&&m.side} (0=Front,1=Back,2=Double) #${m&&m.color?m.color.getHexString():'?'} transp=${m?m.transparent:'?'} cast=${o.castShadow} name='${o.name||''}' chain=${chain.join('<')}`);
  });
  return out.join('\n')||'none';
})()
