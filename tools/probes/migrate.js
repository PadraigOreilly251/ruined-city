/* Deterministic migration proof: fast-forward the deer's own update loop and
   check the herd reaches each seasonal range, and never ends up in the water. */
(() => {
  const H = window.__RC_HERD__, D = window._deer, G = window.__RC_GROUND__;
  const WATER = -0.55;
  const snap = () => {
    const out = D.filter(d => Math.hypot(d.g.position.x - H.st.cx, d.g.position.z - H.st.cz) > H.st.r).length;
    const wet = D.filter(d => G(d.g.position.x, d.g.position.z) < WATER + 0.4).length;
    const far = D.map(d => Math.hypot(d.g.position.x - H.st.cx, d.g.position.z - H.st.cz));
    return `idx=${H.st.idx} next=${H.st.next} moving=${H.st.moving} rest=${H.st.rest.toFixed(0)}`
      + ` centre=(${H.st.cx.toFixed(0)},${H.st.cz.toFixed(0)}) walked=${H.st.walked.toFixed(0)}m`
      + ` outside=${out} wet=${wet} maxDist=${Math.max(...far).toFixed(0)}m`;
  };
  const rows = ['start                     ' + snap()];
  for (const s of [1, 2, 3, 0]){
    H.setSeason(s);
    H.fastForward(120); rows.push(`season ${s}  +120s           ` + snap());
    H.fastForward(200); rows.push(`season ${s}  +320s           ` + snap());
    H.fastForward(240); rows.push(`season ${s}  +560s           ` + snap());
  }
  rows.push('ranges: ' + H.ranges.map(r => `${r.name} (${r.x},${r.z}) r=${r.r}`).join(' | '));
  return rows;
})()
