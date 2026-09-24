(() => {
  const B = window._bats || [];
  if (!B.length) return {err:'no bats'};
  const H = window._bats[0].home && typeof BAT_HOMES!=='undefined' ? null : null;
  const homes = [ {x:199,z:268}, {x:283,z:247} ];
  const inCastle = (x,z)=> Math.hypot(x-199,z-268);
  const inCircle = (x,z)=> Math.hypot(x-283,z-247);
  const vis = B.filter(b=>b.g.visible && b.g.scale.x>0.4);
  const byHome = {castle:[], circle:[]};
  for (const b of vis){
    const d = b.homeIdx===0 ? inCastle(b.g.position.x,b.g.position.z) : inCircle(b.g.position.x,b.g.position.z);
    (b.homeIdx===0?byHome.castle:byHome.circle).push(+d.toFixed(1));
  }
  const ys = vis.map(b=>+b.g.position.y.toFixed(1));
  return {
    total: B.length, visible: vis.length,
    dayF:+(typeof dayFNow!=='undefined'?dayFNow:0).toFixed(2), season:(typeof season!=='undefined'?season:'?'),
    rain:+(typeof wx!=='undefined'?(wx.rain||0):0).toFixed(2),
    castleMaxDist: byHome.castle.length?Math.max(...byHome.castle):null,
    circleMaxDist: byHome.circle.length?Math.max(...byHome.circle):null,
    yMin: ys.length?Math.min(...ys):null, yMax: ys.length?Math.max(...ys):null,
    samplePos: vis.slice(0,4).map(b=>({x:+b.g.position.x.toFixed(1),y:+b.g.position.y.toFixed(1),z:+b.g.position.z.toFixed(1),yaw:+b.faceYaw.toFixed(2)}))
  };
})()
