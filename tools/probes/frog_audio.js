(() => {
  const A = window.__audio;
  if (!A) return { err: 'no audio (startAudio not called)' };
  const st = A.state;
  // sample baseline energy
  const base = A.energy;
  // fire a few croaks directly through the same function the game uses
  try {
    for (let i = 0; i < 5; i++) frogCroak(0.5, 100 + i * 13);
  } catch (e) { return { err: 'frogCroak threw: ' + String(e) }; }
  return { ctxState: st, muted: A.muted, masterGain: A.masterGainValue,
    baseEnergy: base, croakFired: true, hasFn: (typeof frogCroak === 'function') };
})()
