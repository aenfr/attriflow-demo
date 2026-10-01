/* AttriFlow demo v2 — router and chrome: journey rail, back/next bar, section switch and "View as". */
(function () {
  'use strict';
  var AF = window.AF, icon = AF.icon;
  var main = document.getElementById('view');
  var stepsEl = document.getElementById('steps');
  var navbar = document.getElementById('navbar');
  var backBtn = document.getElementById('back');
  var nextBtn = document.getElementById('next');
  var hint = document.getElementById('hint');
  var roleSel = document.getElementById('role');
  var modeJourney = document.getElementById('mode-journey');
  var modeDash = document.getElementById('mode-dash');
  var route = { name: '', arg: '' };
  var lastRole = 'distributor';
  var first = true;

  function parse() {
    var p = location.hash.replace(/^#\/?/, '').split('/');
    return { name: p[0] || '', arg: p[1] || '' };
  }
  function go(path) { location.hash = '#/' + path; }
  function sceneIndex(name) { return AF.SCENES.map(function (s) { return s.id; }).indexOf(name); }

  AF.bringIntoView = function (el) {
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: AF.reduceMotion ? 'auto' : 'smooth' });
  };

  function renderSteps() {
    var idx = sceneIndex(route.name);
    if (idx < 0) { stepsEl.hidden = true; return; }
    stepsEl.hidden = false;
    var max = AF.maxStep();
    stepsEl.innerHTML = AF.SCENES.map(function (s, i) {
      var isDone = i < idx || (AF.GATES[s.id]() && i !== idx && i <= max && s.id !== 'pay' && s.id !== 'train');
      if (s.id === 'train' && idx > 0) isDone = true;
      var locked = i > max;
      var cls = 'step' + (i === idx ? ' is-current' : '') + (isDone ? ' is-done' : '') + (locked ? ' is-locked' : '');
      return '<a class="' + cls + '" href="#/' + s.id + '"' + (i === idx ? ' aria-current="step"' : '') +
        (locked ? ' aria-disabled="true" tabindex="-1"' : '') + '>' +
        '<span class="step-num" aria-hidden="true">' + (isDone ? icon('check') : i + 1) + '</span>' +
        '<span class="step-text"><b>' + s.label + '</b><small>' + s.event + '</small></span>' +
        '<span class="sr-only">' + (isDone ? ', done' : locked ? ', not yet' : '') + '</span></a>';
    }).join('');
  }

  function renderNav() {
    var idx = sceneIndex(route.name);
    if (idx < 0) { navbar.hidden = true; return; }
    navbar.hidden = false;
    var id = AF.SCENES[idx].id, ok = AF.GATES[id](), h = AF.HINTS[id];
    nextBtn.disabled = !ok;
    nextBtn.innerHTML = id === 'pay' ? 'My dashboard →' : 'Next →';
    hint.textContent = ok ? h[1] : h[0];
  }

  function renderTop() {
    var dash = route.name === 'dash';
    modeJourney.setAttribute('href', '#/' + AF.SCENES[AF.maxStep()].id);
    modeDash.setAttribute('href', '#/dash/' + lastRole);
    if (dash) { modeDash.setAttribute('aria-current', 'page'); modeJourney.removeAttribute('aria-current'); }
    else if (sceneIndex(route.name) >= 0) { modeJourney.setAttribute('aria-current', 'page'); modeDash.removeAttribute('aria-current'); }
    else { modeJourney.removeAttribute('aria-current'); modeDash.removeAttribute('aria-current'); }
    roleSel.value = dash ? route.arg : '';
  }

  AF.refreshChrome = function () { renderSteps(); renderNav(); renderTop(); };

  function render(keepScroll) {
    AF.Player.stop();
    AF.clearTimers();
    AF.closeModal();
    route = parse();
    var view;
    if (route.name === 'dash') {
      if (!AF.VIEWS[route.arg] || !AF.VIEWS[route.arg].role) { go('dash/distributor'); return; }
      lastRole = route.arg;
      view = AF.VIEWS[route.arg];
    } else {
      var idx = sceneIndex(route.name);
      if (route.name && idx < 0) { go(''); return; }
      if (idx > AF.maxStep()) { go(AF.SCENES[AF.maxStep()].id); return; }
      view = AF.VIEWS[route.name];
    }
    var y = window.scrollY;
    document.body.classList.toggle('is-dash', route.name === 'dash');
    main.innerHTML = view.html(route.arg);
    if (view.mount) view.mount(route.arg);
    AF.refreshChrome();
    AF.syncPlayButtons();
    if (keepScroll) {
      window.scrollTo(0, y);
    } else if (!first) {
      window.scrollTo(0, 0);
      var h = main.querySelector('h1');
      (h || main).focus({ preventScroll: true });
    }
    first = false;
  }
  AF.rerender = function () { render(true); };

  backBtn.addEventListener('click', function () {
    var idx = sceneIndex(route.name);
    go(idx > 0 ? AF.SCENES[idx - 1].id : '');
  });
  nextBtn.addEventListener('click', function () {
    var idx = sceneIndex(route.name);
    if (idx < 0 || !AF.GATES[AF.SCENES[idx].id]()) return;
    go(idx < AF.SCENES.length - 1 ? AF.SCENES[idx + 1].id : 'dash/user');
  });
  roleSel.addEventListener('change', function () { if (roleSel.value) go('dash/' + roleSel.value); });
  document.getElementById('reset').addEventListener('click', function () {
    AF.Player.stop();
    AF.reset();
    if (location.hash === '#/' || location.hash === '') render(); else go('');
  });
  document.addEventListener('click', function (e) {
    var p = e.target.closest('[data-play]');
    if (p) AF.Player.toggle(p.getAttribute('data-play'));
  });
  window.addEventListener('hashchange', function () { render(false); });
  render(false);
})();
