(() => {
  const b=(window._buzzards||[])[0]; if(!b) return {err:'none'};
  return { wx:'see title', scale:+b.g.scale.x.toFixed(3), vis:b.g.visible,
    rain:+(wx&&wx.rain||0).toFixed(2), wind:+(wx&&wx.wind||0).toFixed(2), dayF:+(typeof dayFNow!=='undefined'?dayFNow:0).toFixed(2) };
})()
