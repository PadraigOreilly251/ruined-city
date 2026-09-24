(() => {
  const G = window.__RC_GROUND__;
  const pts = [[-105,26],[-104,24],[-100,30],[-98,34],[-110,20],[-108,32],[-102,18]];
  return pts.map(([x,z]) => `${x},${z}: g=${G(x,z).toFixed(2)}`);
})()
