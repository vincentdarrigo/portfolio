/* Independent teaching model. Invented records; no client code, data, or API calls. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WorkflowLab = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var copy = function (value) { return JSON.parse(JSON.stringify(value)); };
  function create(kind) {
    if (!['manual', 'rate', 'repair'].includes(kind)) throw new Error('Unknown example');
    return {
      kind: kind, stage: 'ready', attempts: 0, proposal: null, backup: null,
      source: { id: 'sample-01', status: 'ready', note: 'Template note' },
      working: { id: 'sample-01', status: kind === 'repair' ? 'reaady' : 'waiting', note: 'Call after lunch', revision: 1 },
      events: ['Loaded an invented record. No service has been contacted.']
    };
  }
  function preview(run) {
    if (run.stage === 'applied') return run;
    run.attempts++;
    if (run.kind === 'rate' && run.attempts === 1) {
      run.stage = 'rate-limited';
      run.proposal = null;
      run.events.push('Mock response: HTTP 429. No writes. Retry waits for your next action.');
      return run;
    }
    run.proposal = { revision: run.working.revision, status: run.source.status };
    run.stage = 'previewed';
    run.events.push('Dry run: propose status = ready; leave the human-owned note untouched.');
    return run;
  }
  function edit(run) {
    if (run.stage === 'applied') return run;
    run.working.note = 'Team changed this after the preview';
    run.working.revision++;
    run.events.push('A person edited the working record. Its revision changed.');
    return run;
  }
  function apply(run) {
    if (!run.proposal || run.stage === 'applied') return run;
    if (run.proposal.revision !== run.working.revision) {
      run.stage = 'conflict';
      run.proposal = null;
      run.events.push('Write refused: the preview is stale. Preview again before applying.');
      return run;
    }
    if (run.kind === 'repair') {
      run.backup = copy(run.working);
      run.events.push('Saved an in-memory backup before the repair.');
    }
    run.working.status = run.proposal.status;
    run.working.revision++;
    run.stage = 'applied';
    run.events.push('Applied the proposed status. The human-owned note was preserved.');
    return run;
  }
  function restore(run) {
    if (!run.backup || run.stage !== 'applied') return run;
    run.working = copy(run.backup);
    run.proposal = null;
    run.stage = 'restored';
    run.events.push('Restored the saved record. Fixing the upstream defect is a separate task.');
    return run;
  }
  return { create: create, preview: preview, edit: edit, apply: apply, restore: restore, copy: copy };
});
