(() => {
  const P=new THREE.Vector3(-122.7, 0.1, 36.7);
  const box=new THREE.Box3(), sz=new THREE.Vector3(); const out=[];
  window.__RC_CAM__.scene.traverse(o=>{
    if(!o.isMesh) return;
    box.setFromObject(o); box.getSize(sz);
    if(Math.max(sz.x,sz.y,sz.z)<=40) return;
    if(box.containsPoint(P) || (box.min.x<-121&&box.max.x>-124&&box.min.z<38&&box.max.z>35&&box.min.y<2&&box.max.y>0)){
      out.push(`name='${o.name||''}' bbox=[${box.min.x.toFixed(0)},${box.min.y.toFixed(0)},${box.min.z.toFixed(0)} .. ${box.max.x.toFixed(0)},${box.max.y.toFixed(0)},${box.max.z.toFixed(0)}] contains(P)=${box.containsPoint(P)} #${o.material&&o.material.color?o.material.color.getHexString():'?'} transparent=${o.material?o.material.transparent:'?'} visible=${o.visible} castShadow=${o.castShadow} geo=${o.geometry.type}`);
    }
  });
  return out.join('\n')||'none contains region';
})()
