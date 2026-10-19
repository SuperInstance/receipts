#!/usr/bin/env node
// THE DECK'S CENTRAL CLAIM, EXECUTED.
//
// Slide 10 says: "So we break things on purpose, 131,499 ways, and watch
// whether the number MOVES."
//
// This runs the deck's own JavaScript -- the real inline script, out of
// index.html, unmodified -- against a small DOM shim, and asserts that the
// number ACTUALLY MOVES, that it ends BELOW 131,499, and that the caption
// agrees with it.
//
// WHY THIS EXISTS. The animation used to write a CONSTANT. The counter
// showed 131,499 for the entire run and 131,499 at the end, and three dead
// variables sat beside it (caughtNow, shown, live) -- computed and never
// used. Nobody noticed because:
//
//   * check-deck.py checks the VIDEOS, and said nothing about the
//     animation;
//   * there is no browser in the build, so the script was never executed;
//   * and the one thing the deck argues for -- a check that can fail --
//     was the one thing nobody had applied to the deck itself.
//
// A number that is displayed and cannot change is decoration.
//
// USAGE: node check-animation.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(HERE, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (!scripts.length) { console.error('FAIL: no inline script found in index.html'); process.exit(1); }
const code = scripts.join('\n');

// --- the shim -------------------------------------------------------------
// requestAnimationFrame is a QUEUE we drain by hand, so the animation runs
// deterministically and the test can step it a frame at a time.
let frames = [];
const rafQueue = [];
const el = (id) => ({
  id, textContent: '', className: '',
  classList: {
    _s: new Set(),
    add(...c) { c.forEach((x) => this._s.add(x)); },
    remove(...c) { c.forEach((x) => this._s.delete(x)); },
    toggle(c, on) { if (on === undefined) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); } else if (on) this._s.add(c); else this._s.delete(c); },
    contains(c) { return this._s.has(c); },
  },
  children: [],
  style: {},
  appendChild(c) { this.children.push(c); return c; },
  querySelector() { return null; },
});
const nodes = new Map();
for (const id of ['gridbox', 'cnt', 'caught', 'bar', 'zr', 'zl']) nodes.set(id, el(id));
// The shim's slides carry the REAL ids from index.html, so the test finds
// the animation slide exactly the way the DECK does -- by id, not by index.
// (The deck used to hard-code `n===9`, and inserting a slide above it
// detached the animation from its slide, silently.)
const slideIds = [...html.matchAll(/<section class="slide"([^>]*)>/g)].map((m) => {
  const id = /id="([^"]+)"/.exec(m[1]);
  return id ? id[1] : '';
});
const slides = slideIds.map((id) => { const e = el(id || 'slide'); e.id = id; return e; });
const BREAK_SLIDE = slides.findIndex((s) => s.id === 'slide-break');
if (BREAK_SLIDE < 0) { console.error('FAIL: no slide with id="slide-break" in index.html'); process.exit(1); }

const sandbox = {
  document: {
    getElementById: (id) => nodes.get(id) || el(id),
    querySelectorAll: (sel) => (sel === '.slide' ? slides : []),
    createElement: () => el('x'),
    fullscreenElement: null,
    documentElement: { requestFullscreen() {} },
  },
  location: { hash: '#1' },
  addEventListener: () => {},
  requestAnimationFrame: (cb) => { rafQueue.push(cb); return rafQueue.length; },
  cancelAnimationFrame: () => {},
  console,
  Math, String, Number, Array, Object, JSON, parseInt, isNaN, Boolean, Set, RegExp,
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
try { vm.runInContext(code, sandbox, { filename: 'deck-inline.js' }); }
catch (e) { console.error('FAIL: the deck\'s inline script threw on load: ' + e.message); process.exit(1); }

// --- drive it -------------------------------------------------------------
// The animation slide is the one with id="slide-break" -- the deck's own
// rule. We find it the same way, so the test and the deck cannot disagree.
sandbox.show(BREAK_SLIDE);
let guard = 0;
while (rafQueue.length && guard++ < 5000) {
  const cb = rafQueue.shift();
  cb(performance_now());
}
function performance_now() { return guard; }

const cnt = nodes.get('cnt');
const caught = nodes.get('caught');
const values = [];
for (const c of cnt.children) { /* the counter is textContent, not children */ }

// The counter is a textContent, so sample it by re-running and recording.
// Simplest: re-run the animation and record the value at every frame.
const seen = [];
{
  const q = [];
  sandbox.requestAnimationFrame = (cb) => { q.push(cb); return q.length; };
  nodes.get('cnt').textContent = '';
  sandbox.show(BREAK_SLIDE);
  let g = 0;
  while (q.length && g++ < 5000) { const cb = q.shift(); cb(g); seen.push(nodes.get('cnt').textContent); }
}
const finalText = seen[seen.length - 1];
const finalNum = Number(String(finalText).replace(/,/g, ''));
const distinct = new Set(seen);

const fails = [];
if (seen.length < 100) fails.push('the animation did not run enough frames (' + seen.length + ')');
if (distinct.size < 2) fails.push('THE NUMBER NEVER MOVED — it showed the same value on every frame (' + distinct.size + ' distinct value(s))');
if (finalNum >= 131499) fails.push('the final number (' + finalNum + ') is not below 131,499, so the misses were never counted');
if (finalNum <= 0) fails.push('the final number (' + finalNum + ') is not a count');
if (!/missed/.test(caught.textContent)) fails.push('the caption does not name the misses: "' + caught.textContent + '"');
// a DIP must exist: a miss has to visibly move the number DOWN
let dips = 0;
for (let k = 1; k < seen.length; k++) {
  const a = Number(String(seen[k - 1]).replace(/,/g, ''));
  const b = Number(String(seen[k]).replace(/,/g, ''));
  if (b < a) dips++;
}
if (dips === 0) fails.push('the number never dipped — a missed mutation is supposed to be VISIBLE');

console.log('  frames            : ' + seen.length);
console.log('  distinct values   : ' + distinct.size);
console.log('  first / last      : ' + seen[0] + '  ->  ' + finalText);
console.log('  downward steps    : ' + dips);
console.log('  caption           : ' + caught.textContent);
if (fails.length) {
  console.log('');
  for (const f of fails) console.log('  FAIL: ' + f);
  console.log('\nFAIL: the number on slide 10 does not do what the slide says it does.');
  process.exit(1);
}
console.log('\nPASS: the number MOVES, it ends below 131,499, and the caption agrees.');
