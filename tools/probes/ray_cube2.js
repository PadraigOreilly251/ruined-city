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
  const box=new THREE.Box3(), sz=new THREE.Vector3();
  const meshes=[]; scene.traverse(o=>{ if(o.isMesh&&o.visible) meshes.push(o); });
  const rc=new THREE.Raycaster();
  const out=[];
  for(const [nx,ny] of [[0.107,-0.500],[0.107,-0.55],[0.09,-0.50],[0.13,-0.50],[0.107,-0.45]]){
    rc.setFromCamera(new THREE.Vector2(nx,ny),camera);
    const hits=rc.intersectObjects(meshes,false);
    let picked=null;
    for(const hh of hits){ const o=hh.object; box.setFromObject(o); box.getSize(sz);
      if(Math.max(sz.x,sz.y,sz.z)>40) continue;
      if(o.material&&(o.material.transparent||o.material.opacity<0.85)) continue;
      picked={hh,o}; break; }
    if(picked){ const {hh,o}=picked; const cx=(box.min.x+box.max.x)/2, cz=(box.min.z+box.max.z)/2;
      out.push(`(${nx},${ny})→#${o.material.color?o.material.color.getHexString():'?'} ${o.geometry.type} sz=${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} center=(${cx.toFixed(1)},${cz.toFixed(1)}) base=${box.min.y.toFixed(2)} top=${box.max.y.toFixed(2)} ground=${G(cx,cz).toFixed(2)} tarnEdge=${window.__RC_TARN__.edge(cx,cz).toFixed(1)} dist=${hh.distance.toFixed(1)} inst=${!!o.isInstancedMesh}`);
    } else { out.push(`(${nx},${ny})→ only fog/big/transparent`); }
  }
  return out.join('\n');
})()
