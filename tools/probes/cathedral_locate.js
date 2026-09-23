/* Settle it: WHERE is the cathedral, and is ANY of it floating over water?
   Scans for the cathedral's stone color family and reports XZ bounds + min Y.
   The cream stone palette is 0xb3a78f .. 0xdcd2b8 (lit). A hue window catches
   those and excludes brown deer, green foliage, white water tiles. */
(() => {
  const h = new URLSearchParams(location.hash.slice(1));
  const scene = window.__RC_SCENE__ || window.__RC_CAM__.scene;
  const inTarn = (x, z) => (window.__RC_TARN__ || { edge: () => -99 }).edge(x, z) > 0;
  const inLake = (x, z) => ((x - LAKE_CX) / LAKE_RX) ** 2 + ((z - LAKE_CZ) / LAKE_RZ) ** 2 <= 1;
  const c = new THREE.Color();

  // classify a color: is it cathedral cream/tan stone?
  const isCath = (hex) => {
    c.set(hex);
    const hsl = {}; c.getHSL(hsl);
    // cream/tan: hue ~0.08-0.13 (yellow-ish), moderate sat, high-ish light
    return hsl.h > 0.055 && hsl.h < 0.155 && hsl.s > 0.08 && hsl.s < 0.45 && hsl.l > 0.5;
  };

  const cath = [];  // cathedral-cream instances
  const floatsOverWater = [];
  const consider = (o, label, cx, cz, baseY, sizeStr) => {
    if (!isCath(label.matHex)) return;
    cath.push({ at: `${cx.toFixed(0)},${cz.toFixed(0)}`, base: +baseY.toFixed(2), size: sizeStr, mat: label.matHex });
    const overW = inTarn(cx, cz) ? 'TARN' : inLake(cx, cz) ? 'LAKE' : null;
    if (overW && baseY > WATER_Y + 0.1) {
      floatsOverWater.push(`  [${overW}] ${o.name || 'inst'} ${label.matHex} at(${cx.toFixed(1)},${cz.toFixed(1)}) base=${baseY.toFixed(2)} (+${(baseY - WATER_Y).toFixed(2)}) ${sizeStr}`);
    }
  };

  const boxOf = (o) => { const b = new THREE.Box3().setFromObject(o); return b; };
  const instBox = (m) => {
    const px = m[12], py = m[13], pz = m[14];
    const sx = Math.hypot(m[0], m[1], m[2]), sy = Math.hypot(m[4], m[5], m[6]), sz = Math.hypot(m[8], m[9], m[10]);
    return { x: px, z: pz, base: py - sy / 2, size: [sx, sy, sz].map((v) => +v.toFixed(1)).join('x') };
  };

  scene.traverse((o) => {
    if (!o.visible) return;
    if (o.isInstancedMesh) {
      const hex = o.material && o.material.color ? '#' + o.material.color.getHexString() : '#000000';
      // per-instance colors (instanceColor) too
      const im = o.instanceMatrix.array;
      for (let i = 0; i < o.count; i++) {
        const b = instBox(im.slice(i * 16, i * 16 + 16));
        let mh = hex;
        if (o.instanceColor) {
          const arr = o.instanceColor.array;
          mh = '#' + new THREE.Color(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]).getHexString();
        }
        consider(o, { matHex: mh }, b.x, b.z, b.base, b.size);
      }
      return;
    }
    if (!o.isMesh) return;
    const hex = o.material && o.material.color ? '#' + o.material.color.getHexString() : '#000000';
    const b = boxOf(o);
    if (b.isEmpty()) return;
    consider(o, { matHex: hex }, (b.min.x + b.max.x) / 2, (b.min.z + b.max.z) / 2, b.min.y,
      [b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z].map((v) => +v.toFixed(1)).join('x'));
  });

  // overall cathedral footprint
  const xs = cath.map((p) => +p.at.split(',')[0]), zs = cath.map((p) => +p.at.split(',')[1]);
  const bbox = cath.length ? `X ${Math.min(...xs)}..${Math.max(...xs)}  Z ${Math.min(...zs)}..${Math.max(...zs)}` : 'none found';
  return [
    `cathedral-cream pieces found: ${cath.length}`,
    `cathedral XZ footprint: ${bbox}`,
    `  (tarn centre -122,52 r~15; big lake centre ${LAKE_CX},${LAKE_CZ} rx${LAKE_RX} rz${LAKE_RZ})`,
    `FLOATING over water (base > waterline): ${floatsOverWater.length}`,
  ].concat(floatsOverWater.slice(0, 40));
})()
