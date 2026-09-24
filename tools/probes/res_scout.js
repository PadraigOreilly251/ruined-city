(() => {
  const G = window.__RC_GROUND__;
  const cand = [[-165,240],[-150,243],[-148,255],[-150,270],[-165,270],[-182,255],[-160,268],[-150,262],[-155,266],[-145,255],[-165,275],[-152,248]];
  const out = {};
  for (const [x,z] of cand) out[`${x},${z}`] = { h: +G(x,z).toFixed(1), ring: +Math.max(Math.abs(x+165)-13, Math.abs(z-255)-9.5).toFixed(1) };
  return out;
})()
