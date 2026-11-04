// Systems Map markup: every scenario has a selector, notes, a status label, and a path that exists on both diagrams.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = html.indexOf('id="/work/systems-map"');
const end = html.indexOf('<!-- ===================== How I work');
assert.ok(start > 0 && end > start, 'Systems Map view not found');
const view = html.slice(start, end);

const between = (text, from, to) => {
  const i = text.indexOf(from);
  assert.ok(i >= 0, `missing ${from}`);
  return text.slice(i, text.indexOf(to, i));
};
const values = (text, attr) => new Set([...text.matchAll(new RegExp(` ${attr}="([^"]+)"`, 'g'))].map((m) => m[1]));

const svg = between(view, '<svg class="map-svg"', '</svg>');
const stack = between(view, 'class="map-stack"', '<figcaption');
const nodes = values(svg, 'data-node');
const edges = values(svg, 'data-edge');
assert.ok(nodes.has('python') && nodes.has('ai'), 'Python and the optional AI branch must be on the map');
assert.deepEqual([...values(stack, 'data-node')].sort(), [...nodes].sort(), 'The phone diagram must show the same nodes');

const radios = [...view.matchAll(/name="map-scenario" value="([^"]+)"/g)].map((m) => m[1]);
assert.equal(radios.length, 5, 'Five scenarios');
assert.equal((view.match(/name="map-scenario"[^>]*\bchecked\b/g) || []).length, 1, 'Exactly one scenario starts selected');
assert.equal((view.match(/class="map-detail"/g) || []).length, radios.length, 'One set of notes per scenario');

for (const id of radios) {
  const open = view.match(new RegExp(`<article class="map-detail" id="map-${id}" data-nodes="([^"]+)" data-edges="([^"]+)" data-summary="([^"]+)"`));
  assert.ok(open, `Scenario ${id} needs notes with a path and a summary`);
  for (const n of open[1].split(' ')) assert.ok(nodes.has(n), `${id}: unknown node ${n}`);
  for (const e of open[2].split(' ')) assert.ok(edges.has(e), `${id}: unknown edge ${e}`);
  const body = between(view, `id="map-${id}"`, '</article>');
  assert.match(body, /class="pill pill-[a-z]+"/, `${id}: needs a production/prototype/illustrative label`);
  assert.match(body, /<dt>Where AI fits<\/dt>/, `${id}: must say where AI fits`);
  const usesAI = open[1].split(' ').includes('ai');
  assert.equal(usesAI, body.includes('map-verdict-ai'), `${id}: the verdict must match whether the path uses AI`);
  if (usesAI) assert.ok(open[1].includes('review'), `${id}: an AI path must go through a person`);
}
console.log(`PASS: ${radios.length} Systems Map scenarios use known nodes and edges, label their status, and route AI through a person.`);
