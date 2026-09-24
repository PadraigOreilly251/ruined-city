(() => {
  const F = window._flock || [];
  return {
    n: F.length,
    visible: F.filter(a => a.g.visible && a.g.scale.x > 0.4).length,
    maxScale: +Math.max(0, ...F.map(a => a.g.scale.x)).toFixed(3),
    inRes: F.filter(a => { const x=a.g.position.x,z=a.g.position.z; return x>-179.8&&x<-150.2&&z>243.7&&z<266.3; }).length
  };
})()
