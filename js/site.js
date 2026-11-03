// Hash router: each view is an element whose id is its route ("/", "/projects", "/projects/thinkio").
// Without JS every view simply renders in order, and #/route links still jump to the right one.
(function () {
  var views = Array.prototype.slice.call(document.querySelectorAll('.view'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var crumb = document.getElementById('crumb-here');
  var main = document.getElementById('main');
  var firstRender = true;

  function currentRoute() {
    var h = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (h === '') return '/';
    return h.charAt(0) === '/' ? h : null;
  }

  function render() {
    var route = currentRoute();
    if (route === null && !firstRender) return; // a plain in-page anchor such as #main
    var view = document.getElementById(route || '/');
    if (!view || !view.classList.contains('view')) view = document.getElementById('/');

    views.forEach(function (v) { v.hidden = v !== view; });

    var section = '/' + (view.id.split('/')[1] || '');
    navLinks.forEach(function (a) {
      if (a.getAttribute('data-nav') === section) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    var title = view.getAttribute('data-title') || 'Overview';
    if (crumb) crumb.textContent = section === '/projects' && view.id !== '/projects' ? 'Projects / ' + title : title;
    document.title = (view.id === '/' ? 'Vince Darrigo · AI-Assisted Software Engineer' : title + ' · Vince Darrigo');

    if (!firstRender) {
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
    }
    firstRender = false;
  }

  window.addEventListener('hashchange', render);
  render();

  // Keep the skip link from replacing the route in the URL.
  document.querySelector('.skip').addEventListener('click', function (e) {
    e.preventDefault();
    main.focus();
  });

  // Theme toggle (dark by default, remembered per browser).
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var toggleLabel = toggle.querySelector('.tt-label');
  function syncToggle() {
    var light = root.dataset.theme === 'light';
    toggleLabel.textContent = light ? 'Dark theme' : 'Light theme';
    toggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  }
  toggle.addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('vd-theme', root.dataset.theme); } catch (e) {}
    syncToggle();
  });
  syncToggle();
})();
