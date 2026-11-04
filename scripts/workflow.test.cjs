const assert = require('node:assert/strict');
const model = require('../js/workflow-engine.js');

let run = model.create('manual');
model.preview(run);
assert.equal(run.working.status, 'waiting', 'A dry run must not write');
model.apply(run);
assert.equal(run.working.status, 'ready');
assert.equal(run.working.note, 'Call after lunch', 'The source must not overwrite a human-owned field');
const revision = run.working.revision;
model.apply(run);
assert.equal(run.working.revision, revision, 'A repeated apply must do nothing');

run = model.create('manual');
model.preview(run); model.edit(run); model.apply(run);
assert.equal(run.stage, 'conflict');
assert.equal(run.working.status, 'waiting', 'Stale proposals must not write');
model.preview(run); model.apply(run);
assert.equal(run.working.note, 'Team changed this after the preview');

run = model.create('rate');
model.preview(run); model.apply(run);
assert.equal(run.stage, 'rate-limited');
assert.equal(run.working.status, 'waiting');
assert.equal(run.proposal, null);
model.preview(run); model.apply(run);
assert.equal(run.working.status, 'ready');

run = model.create('repair');
const before = model.copy(run.working);
model.preview(run); model.apply(run);
assert.deepEqual(run.backup, before);
assert.notEqual(run.backup, run.working, 'Backup must be independent');
model.restore(run);
assert.deepEqual(run.working, before);
assert.equal(run.stage, 'restored');
assert.throws(() => model.create('unknown'));
console.log('PASS: dry-run isolation, field ownership, stale write refusal, retry boundary, repeat apply, independent backup and restore.');
