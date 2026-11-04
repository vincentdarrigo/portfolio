(function () {
  'use strict';
  var trigger = document.getElementById('gateway-trigger');
  var dialog = document.getElementById('gateway-dialog');
  if (!trigger || !dialog || typeof dialog.showModal !== 'function') return;
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', dialog.id);
  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', function (event) {
    event.preventDefault();
    if (dialog.open) return;
    dialog.showModal();
    document.documentElement.classList.add('gateway-open');
    trigger.setAttribute('aria-expanded', 'true');
  });
  document.getElementById('gateway-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('gateway-open');
    trigger.setAttribute('aria-expanded', 'false');
  });
  window.addEventListener('hashchange', function () { if (dialog.open) dialog.close(); });
})();
