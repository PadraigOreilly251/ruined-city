/* Herd state, compact: range, movement, spread, overlap. */
(() => {
  const H = window._herd, D = window._deer;
  const adults = D.filter(d => d.target === d);
  let minPair = 1e9, who = '';
  for (let i = 0; i < D.length; i++) for (let j = i + 1; j < D.length; j++){
    const d = Math.hypot(D[i].g.position.x - D[j].g.position.x, D[i].g.position.z - D[j].g.position.z);
    if (d < minPair){ minPair = d; who = i + '/' + j; }
  }
  const dist = D.map(d => Math.hypot(d.g.position.x - H.cx, d.g.position.z - H.cz));
  const st = {};
  for (const d of D) st[d.state] = (st[d.state] || 0) + 1;
  const s = window.__RC_DEBUG__();
  return [
    `season=${s.season} (${s.seasonName || ''}) day=${s.simDay} hour=${s.hour}`,
    `range idx=${H.idx} next=${H.next} moving=${H.moving} rest=${H.rest.toFixed(0)} centre=(${H.cx.toFixed(0)},${H.cz.toFixed(0)}) r=${H.r.toFixed(0)} walked=${H.walked.toFixed(0)}m`,
    `animals=${D.length} adults=${adults.length} states=${JSON.stringify(st)}`,
    `distToCentre=[${dist.map(d => d.toFixed(0)).join(',')}] outside=${dist.filter(d => d > H.r).length}`,
    `minPair=${minPair.toFixed(2)}m (${who})  spread=${(Math.max(...dist) - Math.min(...dist)).toFixed(0)}m`,
    `pos=[${D.map(d => `${d.g.position.x.toFixed(0)},${d.g.position.z.toFixed(0)}`).join(' ')}]`,
  ];
})()
