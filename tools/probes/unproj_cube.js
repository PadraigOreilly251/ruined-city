/* Unproject the cube's screen NDC onto the water-surface plane (y=-0.55) and the
   ground, report world x,z and tarn edge at those, to locate the cube exactly. */
(() => {
  const h=new URLSearchParams(location.hash.slice(1));
  const tx=+(h.get('tx')||-119), tz=+(h.get('tz')||42);
  const d=+(h.get('d')||13), hg=+(h.get('hg')||3), az=((h.get('az')||210)*Math.PI)/180;
  const G=window.__RC_GROUND__, T=window.__RC_TARN__, g=G(tx,tz);
  const {camera,controls}=window.__RC_CAM__;
  window.__RC_FREECAM__=true;
  camera.position.set(tx+Math.sin(az)*d,g+hg,tz+Math.cos(az)*d);
  controls.target.set(tx,g+0.5,tz); camera.lookAt(controls.target); camera.updateMatrixWorld();
  const rc=new THREE.Raycaster();
  const planeY=new THREE.Plane(new THREE.Vector3(0,1,0), 0.55); // normal +y, constant: y=-0.55 => plane: dot(n,p)+c=0 -> c=0.55
  const out=[];
  for(const [nx,ny] of [[0.107,-0.50],[0.08,-0.55],[0.14,-0.52],[0.107,-0.47]]){
    rc.setFromCamera(new THREE.Vector2(nx,ny),camera);
    const p=new THREE.Vector3(); rc.ray.intersectPlane(planeY,p);
    if(p) out.push(`ndc(${nx},${ny})→waterplane(${p.x.toFixed(1)},${p.y.toFixed(2)},${p.z.toFixed(1)}) ground=${G(p.x,p.z).toFixed(2)} edge=${T.edge(p.x,p.z).toFixed(1)}`);
  }
  return out.join('\n');
})()
