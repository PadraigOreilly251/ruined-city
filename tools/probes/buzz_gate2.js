(async () => {
  const b=(window._buzzards||[])[0];
  const snap=()=>({ wxName:(typeof wxName!=='undefined'?wxName:'?'), scale:+b.g.scale.x.toFixed(3), vis:b.g.visible,
    rain:+(wx&&wx.rain||0).toFixed(2), wind:+(wx&&wx.wind||0).toFixed(2), dayF:+(typeof dayFNow!=='undefined'?dayFNow:0).toFixed(2) });
  const a=snap();
  await new Promise(r=>setTimeout(r,3500));
  const c=snap();
  return { early:a, later:c };
})()
