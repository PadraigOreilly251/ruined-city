(() => {
  const out = [];
  out.push('ready=' + !!window.__RC_READY__);
  out.push('tarnice=' + (window.__RC_TARNICE__ ? 'yes segs=' + window.__RC_TARNICE__.segs : 'NO'));
  const dbg = window.__RC_DEBUG__ && window.__RC_DEBUG__();
  out.push('debug=' + JSON.stringify(dbg));
  const cam = window.__RC_CAM__.camera;
  out.push('cam=' + cam.position.toArray().map(v => +v.toFixed(1)).join(',') + ' target=' + window.__RC_CAM__.controls.target.toArray().map(v => +v.toFixed(1)).join(','));
  if (window.__RC_TARNICE__){
    out.push('ice visible=' + window.__RC_TARNICE__.ice.visible + ' opacity=' + window.__RC_TARNICE__.iceMat.opacity.toFixed(2));
    out.push('cracks visible=' + window.__RC_TARNICE__.cracks.visible + ' opacity=' + window.__RC_TARNICE__.crackMat.opacity.toFixed(2));
  }
  out.push('geese home=' + (window.__RC_GEESE__ ? window.__RC_GEESE__.home : '?'));
  return out.join('\n');
})()
