(() => {
  const THREE = window.__RC_THREE__, scene = window.__RC_SCENE__;
  let g = null;
  scene.traverse(o => { if (o.isGroup && o.children.some(c => c.isInstancedMesh && c.geometry.parameters && Math.abs((c.geometry.parameters.radiusTop||0) - 0.34) < 1e-6)) g = o; });
  if (!g) return { err: 'tarnLife group not found' };
  const counts = g.children.map(c => `${c.geometry.type}(r=${c.geometry.parameters.radiusTop}) x${c.count}`);
  const m = new THREE.Matrix4();
  g.children[0].getMatrixAt(0, m);
  const p = new THREE.Vector3().setFromMatrixPosition(m);
  const G = window.__RC_GROUND__;
  return { visible: g.visible, parts: counts, samplePad: [+p.x.toFixed(1), +p.y.toFixed(2), +p.z.toFixed(1)], bedAtSample: +G(p.x, p.z).toFixed(2) };
})()
