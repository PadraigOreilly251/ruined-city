(() => {
  const dfs = window._dragonflies || [];
  return {
    n: dfs.length,
    visible: dfs.filter(d => d.g.visible && d.g.scale.x > 0.5).length,
    maxScale: +Math.max(...dfs.map(d => d.g.scale.x)).toFixed(3),
    overWater: dfs.filter(d => Math.hypot((d.g.position.x - (-122)), (d.g.position.z - 52)/1.05) < 14).length
  };
})()
