(() => {
  const f = window._foxes && window._foxes[1];
  if (!f) return { err: 'no fox[1]' };
  return {
    den: f.den || null,
    pos: [+f.g.position.x.toFixed(1), +f.g.position.y.toFixed(1), +f.g.position.z.toFixed(1)],
    distToDen: f.den ? +Math.hypot(f.g.position.x - f.den.x, f.g.position.z - f.den.z).toFixed(2) : null,
    visible: f.g.visible,
    hour: window.__RC_DEBUG__().hour,
  };
})()
