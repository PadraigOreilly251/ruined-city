/* Enumerate EVERY InstancedMesh instance over the tarn, report its world box + gap.
   Do NOT assume the kill-list; find every offender by geometry. */
(() => {
  const tmp=new THREE.Matrix4(), pos=new THREE.Vector3(), scl=new THREE.Vector3(), q=new THREE.Quaternion();
  const T=window.__RC_TARN__, G=window.__RC_GROUND__; const out=[];
  window.__RC_CAM__.scene.traverse(o=>{
    if(!o.isInstancedMesh) return;
    const col=o.material&&o.material.color?o.material.color.getHexString():'?';
    let geoSz=null; if(o.geometry.boundingBox) geoSz=o.geometry.boundingBox;
    for (let i=0;i<o.count;i++){
      o.getMatrixAt(i,tmp); tmp.decompose(pos,q,scl);
      const e=T.edge(pos.x,pos.z); if(e<=0) continue;
      const g=G(pos.x,pos.z), gap=pos.y-g;
      if(gap>0.16 && pos.y<3){
        out.push(`${o.name||'inst'}#${i} pos=(${pos.x.toFixed(1)},${pos.y.toFixed(2)},${pos.z.toFixed(1)}) g=${g.toFixed(2)} gap=${gap.toFixed(2)} e=${e.toFixed(1)} scl=(${scl.x.toFixed(2)},${scl.y.toFixed(2)},${scl.z.toFixed(2)}) #${col} geoBB=${geoSz?`[${geoSz.min.x.toFixed(1)},${geoSz.min.y.toFixed(1)},${geoSz.min.z.toFixed(1)}..${geoSz.max.x.toFixed(1)},${geoSz.max.y.toFixed(1)},${geoSz.max.z.toFixed(1)}]`:'?'}`);
      }
    }
  });
  return out.sort().join('\n')||'no floating instances over tarn';
})()
