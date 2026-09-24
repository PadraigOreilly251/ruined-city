(() => {
  const B = window._buzzards || [];
  if(!B.length) return {err:'no buzzard'};
  const b=B[0], th=b.therm;
  const groundAt = groundH(b.g.position.x,b.g.position.z);
  const distC = Math.hypot(b.g.position.x-th.x, b.g.position.z-th.z);
  let res=null; try{ res=inReservoir(b.g.position.x,b.g.position.z);}catch(e){}
  return {
    state:b.state, y:+b.g.position.y.toFixed(1), baseH:Math.round(b.baseH), topH:Math.round(b.topH),
    groundBelow:+groundAt.toFixed(1), clearanceAboveGround:+(b.g.position.y-groundAt).toFixed(1),
    distFromTherm:+distC.toFixed(1), radius:+b.radius.toFixed(1), bank:+b.bank.toFixed(2),
    vis:b.g.visible, scale:+b.g.scale.x.toFixed(2), inReservoir:res, dayF:+(typeof dayFNow!=='undefined'?dayFNow:0).toFixed(2),
    wingZ:+b.wl.rotation.z.toFixed(2)
  };
})()
