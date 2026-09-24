/* Generic float check across the tarn, the big lake, and the river channel.
   Reports any instanced box whose base sits above the local ground while over
   open water (excluding the ice lid + crack overlay). 0 = clean. */
(async () => {
  const v = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(), m = new THREE.Matrix4();
  const scene = window.__RC_CAM__.scene;
  let n = 0, samp = [];
  scene.traverse(o => {
    if (!o.isInstancedMesh || o.name === '__tarnice__' || o.name === '__tarncrack__') return;
    for (let i = 0; i < o.count; i++){
      o.getMatrixAt(i, m); m.decompose(v, q, s); if (s.x < 1e-4) continue;
      const ww = window.waterHalfWidth(v.z);
      const overChan = ww > 0.5 && Math.abs(v.x - window.waterCenterX(v.z)) < ww;
      const overTarn = window.tarnEdge(v.x, v.z) > 0;
      const overLake = (() => { const CX=114, CZ=245, RX=50, RZ=78; const ex=(v.x-CX)/RX, ez=(v.z-CZ)/RZ; return ex*ex+ez*ez < 0.96; })();
      if (!(overChan || overTarn || overLake)) continue;
      const g = window.__RC_GROUND__(v.x, v.z);
      const submergedBed = g < -0.55;   /* ground here is under the water surface */
      if ((v.y > g + 0.14 || submergedBed) && v.y < -0.55 + 8){
        n++; if (samp.length < 8) samp.push(`(${v.x.toFixed(0)},${v.z.toFixed(0)}) y=${v.y.toFixed(2)} g=${g.toFixed(2)}${submergedBed?' DROWNED-BED':''}${overTarn?' tarn':overLake?' LAKE':' chan'}`);
      }
    }
  });
  return 'remaining water-floaters=' + n + (n ? '\n' + samp.join('\n') : '  (clean)');
})()
