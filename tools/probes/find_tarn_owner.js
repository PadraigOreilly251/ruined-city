/* Locate which InstancedMesh owns the tarn floaters and report how many of its
   instances fall inside the water footprint, so I can find the code that built it. */
(async () => {
  const T = window.__RC_TARN__;
  const scene = window.__RC_CAM__.scene;
  const m4 = new THREE.Matrix4(), v = new THREE.Vector3();
  const report = [];
  let mi = 0;
  scene.traverse(o => {
    if (!o.isInstancedMesh) return;
    const geo = o.geometry.type;
    let inside = 0, worstSit = 0, sample = [];
    for (let i = 0; i < o.count; i++){
      o.getMatrixAt(i, m4); m4.decompose(v, new THREE.Quaternion(), new THREE.Vector3());
      const edge = T.edge(v.x, v.z);
      if (edge > 0.2){
        const g = window.__RC_GROUND__(v.x, v.z);
        const sit = v.y - g;
        if (sit > 0.25){ inside++; if (sit > worstSit) worstSit = sit;
          if (sample.length < 3) sample.push(`(${v.x.toFixed(0)},${v.z.toFixed(0)}) y=${v.y.toFixed(2)} sit=${sit.toFixed(2)}`); }
      }
    }
    if (inside > 0){
      report.push(`meshIdx=${mi} geo=${geo} count=${o.count} name='${o.name||'?'}' insideTarn=${inside} worstSit=${worstSit.toFixed(2)} sample=${sample.join(' ')}`);
    }
    mi++;
  });
  return report.length ? report.join('\n') : 'none found';
})()
