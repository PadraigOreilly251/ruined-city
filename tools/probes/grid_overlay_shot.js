/* Normal camera + a 5-unit grid + axes over the tarn so cube location is readable. */
(() => {
  const h=new URLSearchParams(location.hash.slice(1));
  const tx=+(h.get('tx')||-119), tz=+(h.get('tz')||42);
  const d=+(h.get('d')||13), hg=+(h.get('hg')||3), az=((h.get('az')||210)*Math.PI)/180;
  const G=window.__RC_GROUND__, g=G(tx,tz);
  const {camera,controls}=window.__RC_CAM__; const scene=window.__RC_CAM__.scene;
  window.__RC_FREECAM__=true;
  camera.position.set(tx+Math.sin(az)*d,g+hg,tz+Math.cos(az)*d);
  controls.target.set(tx,g+0.5,tz); camera.lookAt(controls.target); camera.updateMatrixWorld();
  const grid=new THREE.GridHelper(80, 80, 0xff0000, 0x00ccff); // 1-unit divisions, 80 wide
  grid.position.set(-120, 0.35, 46);
  grid.material.transparent=true; grid.material.opacity=0.9; grid.material.depthTest=true;
  scene.add(grid);
  const ax=new THREE.AxesHelper(12); ax.position.set(-120, 0.6, 46); scene.add(ax);
  // add 10-unit tick cubes as color refs at known coords: red at x=-120, blue at z=50
  const mk=(x,z,c)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(0.3,8,8), new THREE.MeshBasicMaterial({color:c})); m.position.set(x,1.2,z); scene.add(m);};
  mk(-122,40,0xff2200); // near shore marker
  mk(-122,44,0x00ff44);
  mk(-118,40,0x0088ff);
})()
