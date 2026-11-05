// The paint dot and theme toggle. Runs in <head> so saved choices apply before the page draws.
var PAINTS = [
  { id: 'thistle', name: 'Thistle and powder blue', color: 'linear-gradient(135deg, #D8BFD8 50%, #B0E0E6 50%)' },
  { id: 'marigold', name: 'Marigold', color: '#F9C74F' },
  { id: 'rani', name: 'Rani pink', color: '#EC6AA5' },
  { id: 'neem', name: 'Neem', color: '#6CC592' }
];

function savedPaint() {
  try {
    return localStorage.getItem('paint') || 'thistle';
  } catch (e) {
    return window.paintOverride || 'thistle';
  }
}

function paintById(id) {
  return PAINTS.find(function (paint) { return paint.id === id; }) || PAINTS[0];
}

function applyPaint(id) {
  var paint = paintById(id);
  if (paint.id === 'thistle') {
    delete document.documentElement.dataset.paint;
  } else {
    document.documentElement.dataset.paint = paint.id;
  }
  document.querySelectorAll('[data-paint-dot]').forEach(function (dot) {
    dot.style.setProperty('--dot', paint.color);
    dot.title = 'Repaint: ' + paint.name;
    dot.setAttribute('aria-label', 'Repaint this site. Current color: ' + paint.name);
  });
}

function nextPaint() {
  var current = PAINTS.indexOf(paintById(savedPaint()));
  var paint = PAINTS[(current + 1) % PAINTS.length];
  applyPaint(paint.id);
  try {
    localStorage.setItem('paint', paint.id);
  } catch (e) {
    // Private windows can block storage, so keep the choice for this page only.
    window.paintOverride = paint.id;
  }
}

var THEME_ICONS = {
  // Each icon shows the mode a click switches to.
  dark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  light: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
};

function savedTheme() {
  try {
    return localStorage.getItem('theme');
  } catch (e) {
    return window.themeOverride || null;
  }
}

function currentTheme() {
  return savedTheme() || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function applyTheme() {
  var saved = savedTheme();
  if (saved) document.documentElement.dataset.theme = saved;
  var next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.querySelectorAll('[data-theme-toggle]').forEach(function (toggle) {
    toggle.innerHTML = THEME_ICONS[next];
    toggle.title = 'Switch to ' + next + ' mode';
    toggle.setAttribute('aria-label', 'Switch to ' + next + ' mode');
  });
}

function toggleTheme() {
  var next = currentTheme() === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem('theme', next);
  } catch (e) {
    window.themeOverride = next;
  }
  applyTheme();
}

// Arrows for the homepage project row. Swiping and trackpads work without them.
function setUpCarousel(row) {
  var controls = document.querySelector('[data-carousel-controls]');
  var prev = controls.querySelector('[data-carousel-prev]');
  var next = controls.querySelector('[data-carousel-next]');
  var smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function update() {
    var max = row.scrollWidth - row.clientWidth;
    controls.hidden = max <= 1;
    prev.disabled = row.scrollLeft <= 1;
    next.disabled = row.scrollLeft >= max - 1;
  }

  function move(direction) {
    var step = row.firstElementChild.offsetWidth + 16;
    row.scrollBy({ left: direction * step, behavior: smooth ? 'smooth' : 'auto' });
  }

  prev.addEventListener('click', function () { move(-1); });
  next.addEventListener('click', function () { move(1); });
  row.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

// Roughens the edges of the washes so they read as paint, not gradients.
function addWashFilter() {
  var holder = document.createElement('div');
  holder.innerHTML =
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<filter id="wash-edge" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="4" seed="7" result="warp"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="warp" scale="90" result="shape"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" seed="3"/>' +
    '<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.9 0 0 0 0.45"/>' +
    '<feComposite in="shape" operator="in"/>' +
    '<feGaussianBlur stdDeviation="0.7"/>' +
    '</filter></defs></svg>';
  document.body.appendChild(holder.firstChild);
}

applyPaint(savedPaint());
applyTheme();

document.addEventListener('DOMContentLoaded', function () {
  addWashFilter();
  document.querySelectorAll('[data-paint-dot]').forEach(function (dot) {
    dot.hidden = false;
    dot.addEventListener('click', nextPaint);
  });
  document.querySelectorAll('[data-theme-toggle]').forEach(function (toggle) {
    toggle.hidden = false;
    toggle.addEventListener('click', toggleTheme);
  });
  document.querySelectorAll('[data-carousel]').forEach(setUpCarousel);
  applyPaint(savedPaint());
  applyTheme();
});
