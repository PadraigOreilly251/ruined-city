/* Feature C: trail decay under new snowfall.
   Proves an old print sinks into the fresh sheet (shrinks + bleaches to snow and is
   culled) while a print made AFTER the fall stays crisp — so a clean trail crossing
   the new snow reads as "made after the storm". */
(async () => {
  const T = window.__RC_TRACKS__;
  const im = T.mesh.instanceMatrix.array;
  const col = () => (T.mesh.instanceColor ? T.mesh.instanceColor.array : null);
  const foot = (i) => Math.hypot(im[i * 16], im[i * 16 + 1], im[i * 16 + 2]);   /* x-basis length, rot-independent */
  const cstr = (i) => { const c = col(); return `[${c[i * 3].toFixed(2)},${c[i * 3 + 1].toFixed(2)},${c[i * 3 + 2].toFixed(2)}]`; };
  const out = [];

  T.frostLevel = 0;
  T.decayDepth = 1.0;
  T.clear();

  /* an old trail, made before the storm: frost 0 */
  T.stamp(40, 40, 0.3, 'fox');
  const iOld = 0;
  out.push(`old print @frost0 : foot=${foot(iOld).toFixed(3)} frost=${T.frost[iOld].toFixed(2)} color=${cstr(iOld)} gone=${T.gone[iOld]}`);

  /* half a fall of new snow on top of it */
  T.frostLevel = 0.5; T.decay();
  out.push(`old print @frost0.5: foot=${foot(iOld).toFixed(3)} color=${cstr(iOld)} gone=${T.gone[iOld]}  (want foot smaller, color lighter)`);

  /* the full fall buries it */
  T.frostLevel = 1.2; T.decay();
  out.push(`old print @frost1.2: foot=${foot(iOld).toFixed(3)} gone=${T.gone[iOld]}  (want gone=1, foot=0)`);

  /* a fresh animal crosses AFTER the storm: stamp with frost already high */
  const iNew = T.count;
  T.stamp(60, 60, 0.9, 'fox');
  out.push(`new print @frost1.2: foot=${foot(iNew).toFixed(3)} frost=${T.frost[iNew].toFixed(2)} color=${cstr(iNew)} gone=${T.gone[iNew]}  (want crisp, foot ~0.08)`);

  /* running decay again with frost unchanged must NOT eat the fresh print */
  T.decay();
  out.push(`new print re-decay: foot=${foot(iNew).toFixed(3)} gone=${T.gone[iNew]}  (want unchanged, gone=0)`);

  out.push(`visible=${T.count} drawn=${T.mesh.count}`);
  return out.join('\n');
})()
