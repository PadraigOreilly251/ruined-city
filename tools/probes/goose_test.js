/* Migration + formation proof. Deterministic: drives updateGeese at fixed dt. */
(() => {
  const G = window.__RC_GEESE__, S = G.st, out = [];
  const snap = (tag) => out.push(`${tag}: home=${S.home} mode=${S.mode} pos=(${S.x.toFixed(0)},${S.z.toFixed(0)}) alt=${S.alt.toFixed(1)}`);
  G.birds.forEach((b) => { b.g.position.set(S.x, -0.44, S.z); });
  snap('start');
  G.setSeason(3);
  let departed = false, arrivedAt = -1;
  const flySamples = [];
  for (let t = 0; t < 240; t += 0.05) {
    G.fastForward(0.05);
    if (S.mode === 'takeoff' && !departed) { departed = true; snap('autumn takeoff'); }
    if (departed && S.mode === 'fly' && flySamples.length < 6 && Math.abs((t % 8) - 0.05) < 0.03) flySamples.push([t, S.x, S.z, S.alt]);
    if (arrivedAt < 0 && S.home === 'lake' && S.mode === 'float') arrivedAt = t;
  }
  snap('after 240s of autumn');
  out.push('autumn arrival at t=' + (arrivedAt < 0 ? 'NEVER' : arrivedAt.toFixed(1) + 's'));
  const fm = flySamples[2];
  if (fm) out.push(`flight sample t=${fm[0].toFixed(0)} pos=(${fm[1].toFixed(0)},${fm[2].toFixed(0)}) alt=${fm[3].toFixed(1)}`);
  const lead = G.birds[0];
  const gaps = G.birds.map((b, i) => (i === 0 ? 'lead' : `#${i} ${Math.hypot(b.g.position.x - lead.g.position.x, b.g.position.z - lead.g.position.z).toFixed(1)}m`));
  out.push('slots after arrival: ' + gaps.join(' '));
  G.setSeason(0);
  let retArrived = -1;
  for (let t = 0; t < 240; t += 0.05) {
    G.fastForward(0.05);
    if (retArrived < 0 && S.home === 'tarn' && S.mode === 'float') retArrived = t;
  }
  snap('after 240s of spring');
  out.push('spring arrival at t=' + (retArrived < 0 ? 'NEVER' : retArrived.toFixed(1) + 's'));
  /* formation check while airborne: re-depart and measure the wedge */
  return out;
})()
