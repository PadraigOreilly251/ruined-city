/* qa_all.js — one-shot audit of every creature/system transform.
   Reports per-system: total, visible, NaN count, world-bounds violations,
   underground sinks. Run under any condition; compares vs __RC_DEBUG__. */
(() => {
  const dbg = (window.__RC_DEBUG__ ? window.__RC_DEBUG__() : {});
  const GH = (window.__RC_GROUND__) ? ((x, z) => window.__RC_GROUND__(x, z)) : (() => 0);
  const LIMIT = 332;           // world is SIZE 660 centred -> +-330; small margin
  const SYSTEAMS = {
    deer: window._deer, rabbits: window._rabbits, foxes: window._foxes,
    squirrels: window._squirrels, cat: window._cat, birds: window._birds,
    gulls: window._gulls, bats: window._bats, flock: window._flock,
    herons: window._herons, frogs: window._frogs, coots: window._coots,
    buzzards: window._buzzards, dragonflies: window._dragonflies,
    pollinators: window._pollinators, geese: window.__RC_GEESE__,
  };
  const rows = {};
  for (const [name, arr] of Object.entries(SYSTEAMS)) {
    if (!Array.isArray(arr)) { rows[name] = { present: false }; continue; }
    let vis = 0, nan = 0, oob = 0, under = 0, hi = 0;
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, minZ = 1e9, maxZ = -1e9;
    for (const it of arr) {
      const g = it && it.g; if (!g) continue;
      const p = g.position, s = g.scale;
      const bad = [p.x, p.y, p.z, s.x, s.y, s.z].some(v => !isFinite(v));
      if (bad) { nan++; continue; }
      const visible = s.x > 0.05 && s.y > 0.05 && s.z > 0.05 && g.visible !== false;
      if (!visible) continue;
      vis++;
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
      minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
      if (Math.abs(p.x) > LIMIT || Math.abs(p.z) > LIMIT) oob++;
      const gy = GH(p.x, p.z);
      if (p.y < gy - 1.5) under++;              // sunk well below terrain
      if (p.y > 140) hi++;                     // absurd altitude
    }
    rows[name] = {
      total: arr.length, vis,
      issues: (nan || oob || under || hi) ? { nan, oob, under, hi } : null,
      box: vis ? {
        x: [+minX.toFixed(0), +maxX.toFixed(0)],
        y: [+minY.toFixed(1), +maxY.toFixed(1)],
        z: [+minZ.toFixed(0), +maxZ.toFixed(0)]
      } : null
    };
  }
  return { cond: dbg, systems: rows };
})()
