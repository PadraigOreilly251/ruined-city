(() => {
  const h = new URLSearchParams(location.hash.slice(1));
  const tx = +(h.get('tx')||-119), tz = +(h.get('tz')||42);
  const d = +(h.get('d')||14), hg = +(h.get('hg')||3.5), az = ((h.get('az')||210)*Math.PI)/180;
  const G = window.__RC_GROUND__, g = G(tx, tz);
  const { camera, controls } = window.__RC_CAM__;
  window.__RC_FREECAM__ = true;
  camera.position.set(tx + Math.sin(az)*d, g + hg, tz + Math.cos(az)*d);
  controls.target.set(tx, g + 0.5, tz);
  camera.lookAt(controls.target); controls.update();
  if (h.get('nofog') === '1'){ const f = window.__RC_CAM__.scene.fog; if (f){ if ('near' in f){ f.near = 90000; f.far = 90001; } if ('density' in f) f.density = 0; } camera.far = 4000; camera.updateProjectionMatrix(); }
  // what meshes are within 3u of this point, and are they instanced?
  const near = [];
  window.__RC_CAM__.scene.traverse(o => {
    if (o.isInstancedMesh) return;
    if (!o.isMesh) return;
    const c = new THREE.Vector3(); o.getWorldPosition(c);
    const dd = Math.hypot(c.x-tx, c.z-tz);
    if (dd < 3 && c.y > -3 && c.y < 4) near.push(`mat=#${o.material.color.getHexString()} sz=${(o.geometry.parameters?.width||0).toFixed(2)}x${(o.geometry.parameters?.height||0).toFixed(2)}x${(o.geometry.parameters?.depth||0).toFixed(2)} y=${c.y.toFixed(2)}`);
  });
  return { at:[tx,tz], ground:g.toFixed(2), fog: (window.scene?.fog ? (window.scene.fog.density ?? (1/window.scene.fog.far)).toFixed(3):0), nearCount: near.length, near: near.slice(0,14) };
})()
