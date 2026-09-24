/* Kill only the single huge white castShadow box matching x[-150..0] z[0..108] and re-shoot. */
(() => {
  const h=new URLSearchParams(location.hash.slice(1));
  const tx=+(h.get('tx')||-119), tz=+(h.get('tz')||42);
  const d=+(h.get('d')||13), hg=+(h.get('hg')||3), az=((h.get('az')||210)*Math.PI)/180;
  const G=window.__RC_GROUND__, g=G(tx,tz);
  const {camera,controls}=window.__RC_CAM__; const scene=window.__RC_CAM__.scene;
  window.__RC_FREECAM__=true;
  camera.position.set(tx+Math.sin(az)*d,g+hg,tz+Math.cos(az)*d);
  controls.target.set(tx,g+0.5,tz); camera.lookAt(controls.target); camera.updateMatrixWorld();
  const box=new THREE.Box3(), sz=new THREE.Vector3(); let k=0;
  scene.traverse(o=>{ if(!o.isMesh) return; box.setFromObject(o); box.getSize(sz);
    if(Math.abs(box.min.x+150)<2 && Math.abs(box.max.x)<2 && Math.abs(box.min.z-0)<2 && Math.abs(box.max.z-108)<2 && o.castShadow){ o.visible=false; k++; }});
  window.__K__=k;
})()
