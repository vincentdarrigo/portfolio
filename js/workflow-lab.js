(function () {
  'use strict';
  var lab = document.getElementById('workflow-lab');
  if (!lab || !window.WorkflowLab) return;
  var engine = window.WorkflowLab;
  var run = engine.create('manual');
  var before = engine.copy(run.working);
  var labels = {
    ready: 'Ready to preview. Nothing has changed.',
    'rate-limited': 'The mock API returned 429. No write is available.',
    previewed: 'Proposal ready. Inspect it before applying.',
    conflict: 'The record changed after preview. The write was refused.',
    applied: 'Change applied in browser memory. The note is unchanged.',
    restored: 'Backup restored. The original defect is visible again.'
  };
  function text(id, value) { document.getElementById(id).textContent = value; }
  function render() {
    text('lab-status', labels[run.stage]);
    text('lab-before', JSON.stringify(before, null, 2));
    text('lab-current', JSON.stringify(run.working, null, 2));
    text('lab-proposal', run.proposal ? JSON.stringify(run.proposal, null, 2) : 'No pending write.');
    var events = document.getElementById('lab-events');
    events.replaceChildren();
    run.events.forEach(function (event) {
      var li = document.createElement('li'); li.textContent = event; events.appendChild(li);
    });
    document.getElementById('lab-preview').textContent = run.stage === 'rate-limited' ? 'Retry mock request' : 'Preview the change';
    document.getElementById('lab-preview').disabled = run.stage === 'applied';
    document.getElementById('lab-apply').disabled = !run.proposal || run.stage === 'applied';
    document.getElementById('lab-edit').disabled = !run.proposal || run.stage === 'applied';
    document.getElementById('lab-restore').hidden = run.kind !== 'repair';
    document.getElementById('lab-restore').disabled = !run.backup || run.stage !== 'applied';
  }
  lab.querySelectorAll('input[name="lab-case"]').forEach(function (radio) {
    radio.addEventListener('change', function () { run = engine.create(radio.value); before = engine.copy(run.working); render(); });
  });
  [['lab-preview', 'preview'], ['lab-apply', 'apply'], ['lab-edit', 'edit'], ['lab-restore', 'restore']].forEach(function (action) {
    document.getElementById(action[0]).addEventListener('click', function () { engine[action[1]](run); render(); });
  });
  document.getElementById('lab-reset').addEventListener('click', function () { run = engine.create(run.kind); before = engine.copy(run.working); render(); });
  document.getElementById('lab-download').addEventListener('click', function () {
    var artifact = { description: 'Independent synthetic workflow example; not a production trace.', before: before, run: run };
    var url = URL.createObjectURL(new Blob([JSON.stringify(artifact, null, 2)], { type: 'application/json' }));
    var link = document.createElement('a'); link.href = url; link.download = 'synthetic-workflow-run.json'; link.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });
  render();
})();
