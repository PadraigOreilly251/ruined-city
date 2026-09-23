#!/usr/bin/env node
/* cdp.mjs — dependency-free Chrome DevTools Protocol driver for the ruined-city harness.
   Lives in the repo because /tmp gets wiped and this thing took a day to build once.

   usage:
     node tools/cdp.mjs shot   out.png  [hash]      [waitMs] [setupJsFile]
     node tools/cdp.mjs eval   probe.js [hash]      [waitMs] [setupJsFile]
     node tools/cdp.mjs perf   [hash] [frames]

   hash    : URL hash params, e.g. "#time=18.9&day=3&wx=storm&cam=meadow"
   waitMs  : wall-clock to let the sim run before measuring (default 2500)
   setup   : optional JS file evaluated BEFORE the wait (e.g. teleport the camera,
             force a hunt). May be an expression returning a value.

   The page exposes the hooks this drives:
     __RC_READY__ __RC_CAM__ {camera,controls,scene} __RC_GROUND__(x,z)
     __RC_DEBUG__() __RC_WX__.jumpDay(d) __RC_RENDERER__
     _deer _rabbits _foxes _birds _gulls _bats _hunt

   examples:
     node tools/cdp.mjs eval /tmp/states.js "#time=7" 3000
     node tools/cdp.mjs shot /tmp/mig.png "#day=3&time=7" 4000 /tmp/teleport.js
*/
import { spawn } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PAGE = path.join(HERE, '..', 'ruined-city.html');
const CHROME = process.env.CHROME_BIN || path.join(
  os.homedir(), '.cache/puppeteer/chrome-headless-shell/linux-148.0.7778.167/chrome-headless-shell-linux64/chrome-headless-shell');
const PORT = 9333 + (process.pid % 50);

if (!existsSync(CHROME)) { console.error('no chrome at ' + CHROME + ' (set CHROME_BIN)'); process.exit(2); }
if (!existsSync(PAGE)) { console.error('no page at ' + PAGE); process.exit(2); }

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
/* process.exit() truncates piped stdout, so every line goes out synchronously. */
const say = (...s) => writeFileSync(1, s.join(' ') + '\n');

async function waitFor(fn, timeout, step = 250, label = '') {
  const t0 = Date.now();
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() - t0 > timeout) throw new Error('timeout waiting [' + (typeof label === 'function' ? label() : label) + ']');
    await sleep(step);
  }
}

async function cdpConnect() {
  const proc = spawn(CHROME, [
    `--remote-debugging-port=${PORT}`,
    /* headless software GL: --disable-gpu alone gives "could not create a WebGL
       context" on this box; Chrome 148 wants angle+swiftshader named explicitly,
       plus --enable-unsafe-swiftshader or it refuses the software path outright */
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--disable-gpu-sandbox', '--no-sandbox', '--window-size=1600,900',
    '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required',
    '--allow-file-access-from-files',
    '--force-device-scale-factor=1',
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  proc.stderr.on('data', d => { stderr += d.toString(); });

  const base = `http://127.0.0.1:${PORT}`;
  const list = await waitFor(async () => {
    try { const r = await fetch(base + '/json/list'); return await r.json(); } catch { return null; }
  }, 20000, 300, () => 'chrome /json/list');
  const pg = list.find(t => t.type === 'page') || list[0];
  const ws = new WebSocket(pg.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws fail: ' + stderr.slice(-400))); });

  let id = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id); pending.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result);
    } else if (m.method) events.push(m);
  };
  const send = (method, params = {}) => new Promise((res, rej) => {
    const mid = ++id; pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  return { proc, send, events, close: () => { try { ws.close(); } catch {} try { proc.kill('SIGKILL'); } catch {} } };
}

async function evaluate(c, expr, awaitIt = false) {
  const r = await c.send('Runtime.evaluate', {
    expression: expr, returnByValue: true, awaitPromise: awaitIt,
  });
  if (r.exceptionDetails) {
    throw new Error('JS: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text || 'err')
      .split('\n').slice(0, 4).join(' | '));
  }
  return r.result.value;
}

async function openPage(c, hash) {
  const url = 'file://' + PAGE + (hash || '');
  await c.send('Page.enable');
  await c.send('Runtime.enable');
  await c.send('Page.navigate', { url });
  let lastErr = '';
  await waitFor(() => evaluate(c, '!!(window.__RC_READY__ && window.__RC_GROUND__ && window.__RC_CAM__)')
    .catch(e => { lastErr = e.message; return false; }), 45000, 400,
    /* if the page never comes up, the reason is almost always a JS exception at boot,
       so print the exceptions we caught in the failure message */
    () => 'page __RC_READY__' + (lastErr ? ' :: ' + lastErr : '') + ' :: ' + readErrors(c).slice(0, 3).join(' | '));
}

/* Collect console + exception events so "no errors" is a real claim, not a vibe. */
function readErrors(c) {
  const errs = [];
  for (const e of c.events) {
    if (e.method === 'Runtime.exceptionThrown')
      errs.push('EXC ' + (e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text || '').split('\n')[0]);
    if (e.method === 'Runtime.consoleAPICalled' && (e.params.type === 'error' || e.params.type === 'warning'))
      errs.push(e.params.type.toUpperCase() + ' ' + (e.params.args || []).map(a => a.value ?? a.description ?? '').join(' ').slice(0, 200));
  }
  return errs;
}

const [cmd, ...a] = process.argv.slice(2);
const c = await cdpConnect();
try {
  if (cmd === 'shot') {
    const [out, hash = '', wait = '2500', setup = ''] = a;
    await openPage(c, hash);
    if (setup && existsSync(setup)) await evaluate(c, readFileSync(setup, 'utf8'), true);
    await sleep(+wait);
    await c.send('Runtime.evaluate', { expression: 'window.dispatchEvent(new Event("resize"))' });
    await sleep(150);
    const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(data, 'base64');
    if (out !== '-') { const abs = path.resolve(out); mkdirSync(path.dirname(abs), { recursive: true }); writeFileSync(abs, buf); }
    const errs = readErrors(c);
    say('shot -> ' + out + ' (' + (buf.length / 1024 | 0) + ' KB)' + (errs.length ? ' ERRS:\n' + errs.join('\n') : ' no errors'));
  } else if (cmd === 'eval') {
    const [file, hash = '', wait = '2500', setup = ''] = a;
    await openPage(c, hash);
    if (setup && existsSync(setup)) await evaluate(c, readFileSync(setup, 'utf8'), true);
    await sleep(+wait);
    const val = await evaluate(c, readFileSync(file, 'utf8'), true);
    say(JSON.stringify(val, null, 1));
    const errs = readErrors(c);
    if (errs.length) say('ERRS:\n' + errs.join('\n'));
  } else if (cmd === 'perf') {
    const [hash = '', frames = '120'] = a;
    await openPage(c, hash);
    await sleep(1500);
    const res = await evaluate(c, `new Promise(res => {
      const ts = []; let n = 0, last = performance.now();
      const tick = () => {
        const now = performance.now(); ts.push(now - last); last = now; n++;
        if (n < ${+frames}) requestAnimationFrame(tick);
        else { ts.sort((x, y) => x - y);
          res({ frames: n, min: +ts[0].toFixed(2), med: +ts[ts.length >> 1].toFixed(2),
                p95: +ts[Math.floor(ts.length * 0.95)].toFixed(2), max: +ts[ts.length - 1].toFixed(2),
                fps: +(1000 / ts[ts.length >> 1]).toFixed(1),
                instanced: (window.__RC_RENDERER__ && window.__RC_RENDERER__.info) ? window.__RC_RENDERER__.info.instance : null }); }
      };
      requestAnimationFrame(tick);
    })`, true);
    say(JSON.stringify(res, null, 1));
    const errs = readErrors(c);
    if (errs.length) say('ERRS:\n' + errs.join('\n'));
  } else if (cmd === 'diag') {
    const [hash = ''] = a;
    const url = 'file://' + PAGE + (hash || '');
    await c.send('Page.enable'); await c.send('Runtime.enable');
    await c.send('Page.navigate', { url });
    await sleep(6000);
    say(JSON.stringify(await evaluate(c, `({
      ready: document.readyState,
      href: location.href.slice(-60),
      keys: Object.keys(window).filter(k => k.startsWith('__RC')).sort(),
      hasDeer: typeof window._deer,
      canvases: document.querySelectorAll('canvas').length,
      bodyLen: (document.body ? document.body.innerHTML.length : -1),
      scriptErr: window.__RC_BOOT_ERR__ || null
    })`), null, 1));
    const errs = readErrors(c);
    say('EVENTS: ' + (errs.length ? '\n' + errs.slice(0, 12).join('\n') : 'none'));
  } else {
    say('unknown cmd: ' + cmd);
  }
} catch (e) {
  say('FAIL: ' + e.message);
  c.close();
  process.exit(1);
} finally {
  c.close();
}
