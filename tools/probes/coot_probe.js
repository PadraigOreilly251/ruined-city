(() => {
  const C = window._coots || [];
  const WY = -0.55;
  let res = 'noFn'; try { res = (typeof inReservoir==='function'); } catch(e){}
  const rows = C.map(c => {
    const edge = tarnEdge(c.g.position.x, c.g.position.z);
    const depth = WY - groundH(c.g.position.x, c.g.position.z);
    const onWater = Math.abs(c.g.position.y - (WY + 0.04)) < 0.25;
    const inRes = res ? inReservoir(c.g.position.x, c.g.position.z) : null;
    return { edge:+edge.toFixed(1), depth:+depth.toFixed(2), y:+c.g.position.y.toFixed(2), onWater, inTarn: edge>1.5, inReservoir: inRes, state:c.state,
      scale:+c.g.scale.x.toFixed(2), visible: c.g.visible };
  });
  return { n:C.length, onWater: rows.filter(r=>r.onWater).length, inTarn: rows.filter(r=>r.inTarn).length,
    inReservoir: rows.filter(r=>r.inReservoir).length,
    vis: C.filter(c=>c.g.visible && c.g.scale.x>0.4).length,
    states: rows.map(r=>r.state), season:(typeof season!=='undefined'?season:'?') };
})()
