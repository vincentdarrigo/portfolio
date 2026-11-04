// Systems Map: choosing a problem highlights its path on the diagram and shows its notes.
// The diagram and every scenario's notes are plain markup, so without JS they all simply show.
(function () {
  'use strict';
  var map = document.getElementById('systems-map');
  if (!map) return;
  var radios = Array.prototype.slice.call(map.querySelectorAll('input[name="map-scenario"]'));
  var panels = Array.prototype.slice.call(map.querySelectorAll('.map-detail'));
  var parts = Array.prototype.slice.call(map.querySelectorAll('[data-node], [data-edge]'));
  var status = document.getElementById('map-status');

  function show(id, announce) {
    var panel = document.getElementById('map-' + id);
    if (!panel) return;
    var on = (panel.getAttribute('data-nodes') + ' ' + panel.getAttribute('data-edges')).split(' ');
    panels.forEach(function (p) { p.hidden = p !== panel; });
    parts.forEach(function (el) {
      var key = el.getAttribute('data-node') || el.getAttribute('data-edge');
      el.classList.toggle('is-on', on.indexOf(key) !== -1);
    });
    map.classList.add('has-path');
    if (announce) status.textContent = panel.getAttribute('data-summary');
  }

  radios.forEach(function (radio) {
    radio.addEventListener('change', function () { if (radio.checked) show(radio.value, true); });
  });
  var checked = radios.filter(function (r) { return r.checked; })[0] || radios[0];
  if (checked) show(checked.value, false);
})();
