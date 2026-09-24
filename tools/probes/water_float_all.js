/* Broad float sweep: EVERY mesh/instance whose base sits above the local ground
   while over open water (tarn / big lake / river channel). Report candidates
   with material colour + size so a real floater can be eyeballed vs reeds/waders. */
(async () => {
  const scene = window.__RC_CAM__.scene;
  const box = new THREE.Box3(), sz = new THREE.Vector3();
  const out = [];
  const tarnX = -122, tarnZ = 52;
  function over(x, z){
    if (window.tarnEdge && window.tarnEdge(x, z) > 0) return 'tarn';
    const ww = window.waterHalfWidth ? window.waterHalfWidth(z) : 0;
    if (ww > 0.5 && Math.abs(x - window.waterCenterX(z)) < ww) return 'chan';
    const ex = (x - 114)/50, ez = (z - 245)/78; if (ex*ex + ez*ez < 0.96) return 'LAKE';
    return null;
  }
  scene.traverse(o => {
    if (o.name === '__tarnice__' || o.name === '__tarncrack__') return;
    for (let a = o; a; a = a.parent) if (a.userData && a.userData.waterLife) return;   /* lily pads/scum are meant to float */
    if (o.isInstancedMesh){
      const m = new THREE.Matrix4(), v = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
      for (let i = 0; i < o.count; i++){
        o.getMatrixAt(i, m); m.decompose(v, q, s); if (s.x < 1e-4) continue;
        const w = over(v.x, v.z); if (!w) continue;
        const g = window.__RC_GROUND__(v.x, v.z);
        const gap = v.y - g;
        /* ground-hugging floater only: near the surface, not a bird in flight */
        if (gap > 0.15 && gap < 2.5 && v.y < -0.55 + 2.5){
          out.push(`INST ${w} (${v.x.toFixed(1)},${v.z.toFixed(1)}) base=${v.y.toFixed(2)} ground=${g.toFixed(2)} gap=${(v.y-g).toFixed(2)} s=${s.x.toFixed(2)}x${s.y.toFixed(2)}x${s.z.toFixed(2)} mat=${('#'+o.material.color.getHexString())}`);
        }
      }
    } else if (o.isMesh){
      box.setFromObject(o); box.getSize(sz);
      const c = new THREE.Vector3(); box.getCenter(c);
      const w = over(c.x, c.z); if (!w) return;
      const g = window.__RC_GROUND__(c.x, c.z);
      const base = box.min.y;
      const gap = base - g;
      if (gap > 0.15 && gap < 2.5 && base < -0.55 + 2.5 && sz.length() < 30){   /* ground-hugging, not birds/planes */
        out.push(`MESH ${w} (${c.x.toFixed(1)},${c.z.toFixed(1)}) base=${base.toFixed(2)} ground=${g.toFixed(2)} gap=${(base-g).toFixed(2)} size=${sz.x.toFixed(1)}x${sz.y.toFixed(1)}x${sz.z.toFixed(1)} geo=${o.geometry.type} mat=${('#'+(o.material.color?o.material.color.getHexString():'?'))} name='${o.name||''}'`);
      }
    }
  });
  return out.length ? out.join('\n') : 'none';
})()
