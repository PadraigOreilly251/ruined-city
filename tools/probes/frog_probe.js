(() => {
  const F = window._frogs || [];
  const RES = { x: -165, z: 255, r: 30 };   // reservoir approx (verify below)
  const WY = -0.55;
  // find spawn group
  let spawn = null; scene.traverse(o => { if (o.name === 'FROGSPAWN_GRP') spawn = o; });
  const out = {
    n: F.length,
    depths: F.map(f => +(WY - groundH(f.g.position.x, f.g.position.z)).toFixed(2)),
    scale: F.map(f => +f.g.scale.x.toFixed(2)),
    visible: F.filter(f => f.g.visible && f.g.scale.x > 0.4).length,
    distFromTarnCenter: F.map(f => +Math.hypot(f.g.position.x - (-122), (f.g.position.z - 52)/1.05).toFixed(1)),
    spawnExists: !!spawn,
    spawnVisible: spawn ? spawn.visible : null,
    spawnCount: (() => { if (!spawn) return null; let gel=0, egg=0; spawn.children.forEach(c=>{ if(c.isInstancedMesh){ if(c.geometry.type==='SphereGeometry'){ /* gel=radius0.5, egg radius0.05 */ } } });
      return { children: spawn.children.length, instanced: spawn.children.filter(c=>c.isInstancedMesh).map(c=>c.count) }; })(),
    season: (typeof season!=='undefined')?season:'?', dayF: (typeof dayFNow!=='undefined')?+dayFNow.toFixed(2):'?'
  };
  return out;
})()
