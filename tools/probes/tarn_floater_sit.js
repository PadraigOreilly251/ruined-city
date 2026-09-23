/* For each reported tarn floater, compare the object's base to the LOCAL ground there.
   A rock on a shallow bank is grounded even if it pokes above WATER_Y. */
(async () => {
  const G = window.__RC_GROUND__, T = window.__RC_TARN__;
  const floaters = [
    [-123.5, 58.9, -0.19], [-132.4, 65.8, -0.34], [-130.2, 58.6, -0.39],
    [-123.5, 54.4, -0.41], [-119.1, 42.6, 0.39], [-119.0, 41.7, -0.26],
  ];
  const out = [];
  for (const [x, z, base] of floaters){
    const g = G(x, z), edge = T.edge(x, z);
    const sitOnGround = base - g;          /* ~0 or slightly negative = seated; large positive = floating */
    out.push(`(${x},${z}) base=${base} ground=${g.toFixed(2)} tarnEdge=${edge.toFixed(2)}  sitOnGround=${sitOnGround.toFixed(2)}  ${sitOnGround > 0.25 ? 'FLOATING' : 'grounded'}`);
  }
  return out.join('\n');
})()
