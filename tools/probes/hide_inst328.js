(() => {
  const h=new URLSearchParams(location.hash.slice(1));
  const tx=+(h.get('tx')||-119), tz=+(h.get('tz')||42);
  const d=+(h.get('d')||13), hg=+(h.get('hg')||3), az=((h.get('az')||210)*Math.PI)/180;
  const G=window.__RC_GROUND__, g=G(tx,tz);
  const {camera,controls}=window.__RC_CAM__; const scene=window.__RC_CAM__.scene;
  window.__RC_FREECAM__=true;
  camera.position.set(tx+Math.sin(az)*d,g+hg,tz+Math.cos(az)*d);
  controls.target.set(tx,g+0.5,tz); camera.lookAt(controls.target); camera.updateMatrixWorld();
  let done='';
  scene.traverse(o=>{
    if(!o.isInstancedMesh || o.name==='__tarncrack__') return;
    const tmp=new THREE.Matrix4(),p=new THREE.Vector3(),s=new THREE.Vector3(),q=new THREE.Quaternion();
    o.getMatrixAt(328,tmp); tmp.decompose(p,q,s);
    if(Math.abs(p.x+123.2)<0.2 && Math.abs(p.z-35.7)<0.2){
      tmp.makeScale(0,0,0).setPosition(0,-999,0); o.setMatrixAt(328,tmp); o.instanceMatrix.needsUpdate=true;
      done=o.name||'inst';
    }
  });
  window.__H__=done;
})()
