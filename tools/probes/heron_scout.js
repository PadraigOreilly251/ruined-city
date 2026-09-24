(() => {
  const H = window._herons || [];
  const WY = -0.55;
  return {
    n: H.length,
    states: H.map(h => h.state),
    spots: H.map(h => ({ x:+h.g.position.x.toFixed(1), z:+h.g.position.z.toFixed(1), groundY:+h.g.position.y.toFixed(2), depth:+(WY - h.g.position.y).toFixed(2) })),
    visible: H.filter(h => h.g.visible && h.g.scale.x > 0.4).length,
    distFromTarnCenter: H.map(h => +Math.hypot(h.g.position.x - (-122), (h.g.position.z - 52)/1.05).toFixed(1))
  };
})()
