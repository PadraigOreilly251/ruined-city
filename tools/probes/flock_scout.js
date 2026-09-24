(() => {
  const F = window._flock || [];
  const RES = { x0: -178, x1: -152, z0: 245.5, z1: 264.5 };
  const inRes = (x,z) => x > RES.x0-1.8 && x < RES.x1+1.8 && z > RES.z0-1.8 && z < RES.z1+1.8;
  const sheep = F.filter(a=>!a.goat), goats = F.filter(a=>a.goat);
  const bad = F.filter(a => inRes(a.g.position.x, a.g.position.z)).length;
  let minX=9e9,maxX=-9e9,minZ=9e9,maxZ=-9e9;
  for (const a of F){ minX=Math.min(minX,a.g.position.x);maxX=Math.max(maxX,a.g.position.x);minZ=Math.min(minZ,a.g.position.z);maxZ=Math.max(maxZ,a.g.position.z); }
  return { n: F.length, sheep: sheep.length, goats: goats.length, inReservoir: bad,
    bbox: {minX:+minX.toFixed(1),maxX:+maxX.toFixed(1),minZ:+minZ.toFixed(1),maxZ:+maxZ.toFixed(1)},
    states: F.reduce((m,a)=>{m[a.state]=(m[a.state]||0)+1;return m;},{}),
    avgH: +(F.reduce((s,a)=>s+a.g.position.y,0)/(F.length||1)).toFixed(1),
    sampleGoat: goats[0]? {goat:true, sc:+goats[0].g.scale.x.toFixed(2)} : null
  };
})()
