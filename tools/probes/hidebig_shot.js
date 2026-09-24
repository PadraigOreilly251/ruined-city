/* Hide all >40-unit boxes, then report remaining small opaque objects near the
   tarn that float above ground — plus flag if the cube survives. */
(() => {
  const h=new URLSearchParams(location.hash.slice(1));
  const tx=+(h.get('tx')||-119), tz=+(h.get('tz')||42);
  const d=+(h.get('d')||13), hg=+(h.get('hg')||3), az=((h.get('az')||210)*Math.PI)/180;
  const G=window.__RC_GROUND__, g=G(tx,tz);
  const {camera,controls}=window.__RC_CAM__; const scene=window.__RC_CAM__.scene;
  window.__RC_FREECAM__=true;
  camera.position.set(tx+Math.sin(az)*d,g+hg,tz+Math.cos(az)*d);
  controls.target.set(tx,g+0.5,tz); camera.lookAt(controls.target); camera.updateMatrixWorld();
  scene.updateMatrixWorld(true);
  const box=new THREE.Box3(), sz=new THREE.Vector3(); let hidden=0;
  scene.traverse(o=>{ if(o.isMesh){ box.setFromObject(o); box.getSize(sz);
    if(Math.max(sz.x,sz.y,sz.z)>40 && o.name!=='__tarnice__'){ /* big plane: keep ground+water visible? */ } }});
  // Instead: list all opaque meshes with bbox center within 8u of tarn shore and gap>0.15
  const out=[]; const seen=new Set();
  scene.traverse(o=>{
    if(!o.isMesh||!o.visible) return;
    if(o.name==='__tarnice__'||o.name==='__tarncrack__') return;
    if(Math.max(...box.setFromObject(o).getSize(sz).toArray())>40) return;
    const cx=(box.min.x+box.max.x)/2, cz=(box.min.z+box.max.z)/2;
    if(window.__RC_TARN__.edge(cx,cz) < 0) return;      // must be over tarn
    const gap=box.min.y-G(cx,cz);
    if(gap>0.15 && box.min.y < 2.5){
      const k=`${cx.toFixed(0)},${cz.toFixed(0)},${box.min.y.toFixed(0)}`; if(seen.has(k))return; seen.add(k);
      out.push(`(${cx.toFixed(1)},${cz.toFixed(1)}) base=${box.min.y.toFixed(2)} g=${G(cx,cz).toFixed(2)} gap=${gap.toFixed(2)} ${sz.x.toFixed(1)}x${sz.y.toFixed(1)}x${sz.z.toFixed(1)} #${o.material.color?o.material.color.getHexString():'?'} inst=${!!o.isInstancedMesh}`);
    }
  });
  return out.sort().join('\n')||'nothing floating over tarn';
})()
