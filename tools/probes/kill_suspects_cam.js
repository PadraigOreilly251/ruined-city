/* Combined: set camera + kill huge near-white boxes, for a post-kill screenshot. */
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
  const box=new THREE.Box3(), sz=new THREE.Vector3(); let k=0;
  scene.traverse(o=>{ if(!o.isMesh) return; box.setFromObject(o); box.getSize(sz);
    const nw=o.material&&o.material.color&&o.material.color.r>0.9&&o.material.color.g>0.9&&o.material.color.b>0.9;
    if(Math.max(sz.x,sz.z)>60&&nw&&o.name!=='__tarnice__'){ o.visible=false; k++; }});
  window.__KILLED__=k;
})()
