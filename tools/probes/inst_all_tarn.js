(() => {
  const tmp=new THREE.Matrix4(), pos=new THREE.Vector3(), scl=new THREE.Vector3(), q=new THREE.Quaternion();
  const T=window.__RC_TARN__, G=window.__RC_GROUND__; const out=[];
  window.__RC_CAM__.scene.traverse(o=>{
    if(!o.isInstancedMesh) return;
    const col=o.material&&o.material.color?o.material.color.getHexString():'?';
    const gbb=o.geometry.boundingBox?`${(o.geometry.boundingBox.min.y).toFixed(2)}..${(o.geometry.boundingBox.max.y).toFixed(2)}`:'?';
    for(let i=0;i<o.count;i++){
      o.getMatrixAt(i,tmp); tmp.decompose(pos,q,scl);
      const e=T.edge(pos.x,pos.z); if(e<=0) continue;
      const gap=pos.y-G(pos.x,pos.z);
      out.push(`mesh[${o.name||'inst'}]#${i} pos=(${pos.x.toFixed(1)},${pos.y.toFixed(2)},${pos.z.toFixed(1)}) gap=${gap.toFixed(2)} e=${e.toFixed(1)} scl=(${scl.x.toFixed(2)},${scl.y.toFixed(2)},${scl.z.toFixed(2)}) #${col} geoY=${gbb}`);
    }
  });
  out.sort(); return out.length+'\n'+out.slice(0,60).join('\n');
})()
