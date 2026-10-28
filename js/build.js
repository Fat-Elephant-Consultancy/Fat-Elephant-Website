// Fat Build: pick a type, a colour, a backdrop and some features, and the preview on the stage
// builds itself. The finished build can be sent to Fat Elephant as an email.
(function () {
  var device = document.getElementById('device');
  if (!device) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var TYPES = {
    web: {
      label: 'Website or web app',
      tagline: 'Built to be found, loved and shared.',
      cta: 'Get started',
      stats: { reach: 70, smarts: 30, polish: 55, scale: 50 }
    },
    mobile: {
      label: 'Mobile app',
      tagline: 'Everything you need, in your pocket.',
      cta: 'Open app',
      stats: { reach: 60, smarts: 35, polish: 65, scale: 45 }
    },
    ai: {
      label: 'AI assistant',
      tagline: 'Ask. Decide. Done.',
      cta: 'Start chatting',
      stats: { reach: 40, smarts: 85, polish: 50, scale: 55 }
    },
    dash: {
      label: 'Dashboard or internal tool',
      tagline: 'Know your numbers at a glance.',
      cta: 'View report',
      stats: { reach: 25, smarts: 55, polish: 50, scale: 70 }
    }
  };

  // Accent colours, grouped so they are easy to browse
  var FAMILIES = [
    { id: 'brand', label: 'Brand' },
    { id: 'warm', label: 'Warm' },
    { id: 'cool', label: 'Cool' },
    { id: 'soft', label: 'Soft' }
  ];

  var PALETTE = [
    { family: 'brand', name: 'Lime', hex: '#e3ef26' },
    { family: 'brand', name: 'Teal', hex: '#076653' },
    { family: 'brand', name: 'Deep teal', hex: '#0c342c' },
    { family: 'brand', name: 'Mint', hex: '#8fe3a8' },
    { family: 'brand', name: 'Fresh green', hex: '#3fbf6e' },
    { family: 'brand', name: 'Ink', hex: '#06231d' },

    { family: 'warm', name: 'Coral', hex: '#ff7a59' },
    { family: 'warm', name: 'Tangerine', hex: '#ff9f1c' },
    { family: 'warm', name: 'Sunshine', hex: '#ffd23f' },
    { family: 'warm', name: 'Rose', hex: '#f0568b' },
    { family: 'warm', name: 'Brick', hex: '#d1493f' },
    { family: 'warm', name: 'Peach', hex: '#ffb59e' },

    { family: 'cool', name: 'Sky', hex: '#4db5ff' },
    { family: 'cool', name: 'Ocean', hex: '#1f6feb' },
    { family: 'cool', name: 'Indigo', hex: '#5b4bdb' },
    { family: 'cool', name: 'Violet', hex: '#8e5cf0' },
    { family: 'cool', name: 'Aqua', hex: '#22c8c0' },
    { family: 'cool', name: 'Navy', hex: '#14307a' },

    { family: 'soft', name: 'Lilac', hex: '#c9b6f5' },
    { family: 'soft', name: 'Blush', hex: '#f7c6d0' },
    { family: 'soft', name: 'Sand', hex: '#e5d5b0' },
    { family: 'soft', name: 'Stone', hex: '#9aa39e' },
    { family: 'soft', name: 'Charcoal', hex: '#2b2f2e' },
    { family: 'soft', name: 'Snow', hex: '#f4f4ef' }
  ];

  var BACKDROPS = { cream: 'Cream', mint: 'Mint', white: 'White', midnight: 'Midnight' };
  var STYLES = { playful: 'Playful', clean: 'Clean', bold: 'Bold' };

  // Icon artwork for each feature (24 x 24, drawn with a stroke)
  var ICONS = {
    auth: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5"/>',
    security: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    notifications: '<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21h4"/>',
    languages: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.3 3.7 5.1 3.7 8.5s-1.2 6.2-3.7 8.5c-2.5-2.3-3.7-5.1-3.7-8.5s1.2-6.2 3.7-8.5z"/>',
    darkmode: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    payments: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
    bookings: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    reviews: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z"/>',
    sharing: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>',
    analytics: '<path d="M5 20v-8M12 20V5M19 20v-5"/>',
    ai: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    chat: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-5 4v-4A1.5 1.5 0 0 1 4 14.5z"/>',
    maps: '<path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 0 0-13 0c0 5 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    integrations: '<path d="M9 3v4M15 3v4M7 7h10v4a5 5 0 0 1-10 0zM12 16v5"/>',
    uploads: '<path d="M12 16V5M7.5 9.5L12 5l4.5 4.5M4 19h16"/>',
    cms: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    admin: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    offline: '<path d="M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9.5 4.3 4.3 0 0 1 17.5 18z"/><path d="M9.5 13.5l2 2 3.5-3.5"/>'
  };

  var GROUPS = [
    { id: 'essentials', label: 'Essentials', items: ['auth', 'security', 'search', 'notifications', 'languages', 'darkmode'] },
    { id: 'growth', label: 'Money & growth', items: ['payments', 'bookings', 'reviews', 'sharing', 'analytics'] },
    { id: 'smart', label: 'Smart & connected', items: ['ai', 'chat', 'maps', 'integrations'] },
    { id: 'control', label: 'Content & control', items: ['uploads', 'cms', 'admin', 'offline'] }
  ];

  // "only" limits a feature to the product types where it makes sense
  var FEATURES = {
    auth: { label: 'Sign-in & profiles', stats: { polish: 5, scale: 5 } },
    security: { label: 'Security (2-step login)', stats: { polish: 6, scale: 4 } },
    search: { label: 'Smart search', stats: { polish: 8, reach: 4 } },
    notifications: { label: 'Notifications', stats: { reach: 10 } },
    languages: { label: 'Multiple languages', stats: { reach: 12 } },
    darkmode: { label: 'Dark mode switch', stats: { polish: 8 } },
    payments: { label: 'Payments', stats: { reach: 10, scale: 5 } },
    bookings: { label: 'Bookings', stats: { reach: 6, polish: 4 } },
    reviews: { label: 'Reviews & ratings', stats: { reach: 8, polish: 3 } },
    sharing: { label: 'Sharing & referrals', stats: { reach: 10 } },
    analytics: { label: 'Analytics', stats: { smarts: 10, scale: 10 } },
    ai: { label: 'AI assistant', stats: { smarts: 20, polish: 5 } },
    chat: { label: 'Live support chat', stats: { reach: 8, polish: 6 } },
    maps: { label: 'Maps & location', stats: { reach: 8, polish: 4 } },
    integrations: { label: 'Integrations & API', stats: { scale: 8, smarts: 4 } },
    uploads: { label: 'File uploads', stats: { scale: 6, polish: 3 } },
    cms: { label: 'Content management', only: ['web'], stats: { polish: 4, scale: 4 } },
    admin: { label: 'Admin panel', stats: { scale: 12, smarts: 4 } },
    offline: { label: 'Works offline', only: ['mobile'], stats: { reach: 4, polish: 6 } }
  };

  // Features a product type already has built in, so they are not offered a second time
  var INCLUDED = { ai: ['ai'], dash: ['analytics'] };

  var STYLE_BONUS = { playful: { polish: 5 }, clean: { polish: 8 }, bold: { reach: 5 } };

  var DEFAULT_COLOUR = { name: 'Lime', hex: '#e3ef26', family: 'brand' };

  function freshState() {
    return {
      type: 'web',
      colour: { name: DEFAULT_COLOUR.name, hex: DEFAULT_COLOUR.hex, family: DEFAULT_COLOUR.family },
      backdrop: 'cream',
      style: 'playful',
      features: {},
      name: ''
    };
  }

  var state = freshState();
  var step = 0;
  var family = 'brand';

  var el = {
    name: document.getElementById('productName'),
    names: device.querySelectorAll('[data-name]'),
    logo: document.getElementById('pvLogo'),
    url: document.getElementById('pvUrl'),
    tagline: document.getElementById('pvTagline'),
    cta: document.getElementById('pvCta'),
    chips: document.getElementById('hudChips'),
    count: document.getElementById('featureCount'),
    total: document.getElementById('featureTotal'),
    live: document.getElementById('liveSummary'),
    steps: document.querySelectorAll('.step'),
    panes: document.querySelectorAll('.pane'),
    back: document.getElementById('back'),
    next: document.getElementById('next'),
    reset: document.getElementById('reset'),
    dice: document.getElementById('randomise'),
    send: document.getElementById('sendBuild'),
    stageView: document.getElementById('stageView'),
    tabs: document.getElementById('paletteTabs'),
    grid: document.getElementById('paletteGrid'),
    dot: document.getElementById('swatchDot'),
    swName: document.getElementById('swatchName'),
    swHex: document.getElementById('swatchHex'),
    custom: document.getElementById('customColour'),
    featGroups: document.getElementById('featGroups'),
    included: document.getElementById('includedNote')
  };

  // ---- helpers ----
  function displayName() {
    return state.name.trim() || 'Your Product';
  }

  function slug() {
    var s = state.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return (s || 'your-product') + '.com';
  }

  // is this feature on offer for the product type that is picked?
  function available(k) {
    if ((INCLUDED[state.type] || []).indexOf(k) > -1) return false;
    var only = FEATURES[k].only;
    return !only || only.indexOf(state.type) > -1;
  }

  function availableKeys() {
    return Object.keys(FEATURES).filter(available);
  }

  function pruneFeatures() {
    Object.keys(state.features).forEach(function (k) {
      if (!available(k)) delete state.features[k];
    });
  }

  function featureList() {
    return Object.keys(FEATURES).filter(function (k) { return state.features[k] && available(k); });
  }

  function scopeLabel(n) {
    if (n === 0) return 'Just the shell';
    if (n <= 3) return 'Lean';
    if (n <= 7) return 'Solid';
    return 'Ambitious';
  }

  // Dark ink on light colours, light ink on dark colours
  function inkFor(hex) {
    var c = hex.replace('#', '');
    var ch = [0, 2, 4].map(function (i) {
      var v = parseInt(c.substr(i, 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    var lum = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
    return lum > 0.4 ? '#06231d' : '#fffdee';
  }

  function stats() {
    var s = {};
    var base = TYPES[state.type].stats;
    Object.keys(base).forEach(function (k) { s[k] = base[k]; });

    featureList().forEach(function (f) {
      var d = FEATURES[f].stats;
      Object.keys(d).forEach(function (k) { s[k] += d[k]; });
    });

    var b = STYLE_BONUS[state.style];
    Object.keys(b).forEach(function (k) { s[k] += b[k]; });

    Object.keys(s).forEach(function (k) { s[k] = Math.max(8, Math.min(100, s[k])); });
    return s;
  }

  // lower-case a label but keep "AI" as AI
  function lower(text) {
    return text.toLowerCase().replace(/\bai\b/g, 'AI');
  }

  function withArticle(text) {
    return (/^[aeiou]/i.test(text) ? 'an ' : 'a ') + text;
  }

  function sentence(list) {
    if (!list.length) return 'no extras yet';
    if (list.length === 1) return list[0];
    return list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
  }

  function swapAnimation() {
    if (reduceMotion) return;
    device.classList.remove('is-swapping');
    void device.offsetWidth;
    device.classList.add('is-swapping');
  }

  // ---- features pane ----
  function buildFeatures() {
    el.featGroups.innerHTML = '';
    GROUPS.forEach(function (g) {
      var wrap = document.createElement('div');
      wrap.className = 'feat-group';
      wrap.setAttribute('data-fgroup', g.id);

      var label = document.createElement('p');
      label.className = 'feat-group-label';
      label.textContent = g.label;
      wrap.appendChild(label);

      var grid = document.createElement('div');
      grid.className = 'feats';

      g.items.forEach(function (k) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'feat';
        b.setAttribute('aria-pressed', 'false');
        b.setAttribute('data-feature-opt', k);
        b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[k] + '</svg>';
        b.appendChild(document.createTextNode(FEATURES[k].label));
        grid.appendChild(b);
      });

      wrap.appendChild(grid);
      el.featGroups.appendChild(wrap);
    });
  }

  function syncFeatures() {
    Array.prototype.forEach.call(el.featGroups.querySelectorAll('[data-feature-opt]'), function (b) {
      b.hidden = !available(b.getAttribute('data-feature-opt'));
    });

    Array.prototype.forEach.call(el.featGroups.querySelectorAll('.feat-group'), function (g) {
      g.hidden = !g.querySelector('.feat:not([hidden])');
    });

    var built = INCLUDED[state.type] || [];
    if (built.length) {
      el.included.hidden = false;
      el.included.textContent = built.map(function (k) { return FEATURES[k].label; }).join(', ') +
        ' comes built in with this product type, so it is not listed.';
    } else {
      el.included.hidden = true;
    }
  }

  // ---- palette ----
  function buildPalette() {
    el.tabs.innerHTML = '';
    FAMILIES.forEach(function (f) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ptab';
      b.setAttribute('role', 'tab');
      b.setAttribute('data-family', f.id);
      b.textContent = f.label;
      el.tabs.appendChild(b);
    });

    el.grid.innerHTML = '';
    PALETTE.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sw';
      b.setAttribute('role', 'radio');
      b.setAttribute('data-family', p.family);
      b.setAttribute('data-name', p.name);
      b.setAttribute('data-hex', p.hex);
      b.setAttribute('aria-label', p.name + ' ' + p.hex.toUpperCase());
      b.title = p.name;
      b.style.setProperty('--c', p.hex);
      el.grid.appendChild(b);
    });
  }

  function renderPalette() {
    Array.prototype.forEach.call(el.tabs.children, function (t) {
      var on = t.getAttribute('data-family') === family;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });

    var chosen = null;
    Array.prototype.forEach.call(el.grid.children, function (s) {
      var show = s.getAttribute('data-family') === family;
      s.hidden = !show;
      var on = s.getAttribute('data-hex') === state.colour.hex && s.getAttribute('data-name') === state.colour.name;
      s.classList.toggle('is-on', on);
      s.setAttribute('aria-checked', on ? 'true' : 'false');
      if (on && show) chosen = s;
      s.tabIndex = -1;
    });

    // roving tabindex: the chosen swatch, or else the first one on show
    var first = el.grid.querySelector('.sw:not([hidden])');
    (chosen || first).tabIndex = 0;

    el.dot.style.background = state.colour.hex;
    el.swName.textContent = state.colour.name;
    el.swHex.textContent = state.colour.hex.toUpperCase();
    el.custom.value = state.colour.hex;
  }

  function chooseColour(name, hex, fam) {
    state.colour = { name: name, hex: hex, family: fam || '' };
    if (fam) family = fam;
    render();
  }

  el.tabs.addEventListener('click', function (e) {
    var t = e.target.closest('.ptab');
    if (!t) return;
    family = t.getAttribute('data-family');
    renderPalette();
  });

  el.tabs.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var ids = FAMILIES.map(function (f) { return f.id; });
    var i = ids.indexOf(family) + (e.key === 'ArrowRight' ? 1 : -1);
    family = ids[(i + ids.length) % ids.length];
    renderPalette();
    el.tabs.querySelector('[data-family="' + family + '"]').focus();
    e.preventDefault();
  });

  el.grid.addEventListener('click', function (e) {
    var s = e.target.closest('.sw');
    if (!s) return;
    chooseColour(s.getAttribute('data-name'), s.getAttribute('data-hex'), s.getAttribute('data-family'));
  });

  // arrow keys walk the palette, like a game's colour picker
  el.grid.addEventListener('keydown', function (e) {
    var keys = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 6, ArrowUp: -6 };
    if (!(e.key in keys)) return;
    var shown = Array.prototype.slice.call(el.grid.querySelectorAll('.sw:not([hidden])'));
    var i = shown.indexOf(document.activeElement);
    if (i < 0) return;
    var next = shown[Math.max(0, Math.min(shown.length - 1, i + keys[e.key]))];
    next.focus();
    next.click();
    e.preventDefault();
  });

  el.custom.addEventListener('input', function () {
    chooseColour('Custom', el.custom.value.toLowerCase(), '');
  });

  // ---- render everything ----
  function render(opts) {
    var t = TYPES[state.type];
    var feats = featureList();
    var labels = feats.map(function (k) { return FEATURES[k].label; });

    device.setAttribute('data-type', state.type);
    device.setAttribute('data-backdrop', state.backdrop);
    device.setAttribute('data-style', state.style);
    device.style.setProperty('--pv-accent', state.colour.hex);
    device.style.setProperty('--pv-accent-ink', inkFor(state.colour.hex));

    Array.prototype.forEach.call(el.names, function (n) { n.textContent = displayName(); });
    el.logo.textContent = displayName().charAt(0).toUpperCase();
    el.url.textContent = slug();
    el.tagline.textContent = t.tagline;
    el.cta.textContent = t.cta;

    Object.keys(FEATURES).forEach(function (k) {
      Array.prototype.forEach.call(device.querySelectorAll('[data-feature="' + k + '"]'), function (m) {
        var on = !!state.features[k];
        if (on && !m.classList.contains('is-on') && !reduceMotion) {
          m.classList.remove('is-popping');
          void m.offsetWidth;
          m.classList.add('is-popping');
        }
        m.classList.toggle('is-on', on);
      });
    });

    // option buttons
    Array.prototype.forEach.call(document.querySelectorAll('[data-group]'), function (b) {
      var on = state[b.getAttribute('data-group')] === b.getAttribute('data-value');
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-feature-opt]'), function (b) {
      b.setAttribute('aria-pressed', state.features[b.getAttribute('data-feature-opt')] ? 'true' : 'false');
    });

    el.count.textContent = feats.length;
    el.total.textContent = availableKeys().length;
    syncFeatures();
    renderPalette();

    // stats
    var s = stats();
    Object.keys(s).forEach(function (k) {
      var bar = document.querySelector('[data-stat="' + k + '"] .stat-fill');
      if (bar) bar.style.setProperty('--v', s[k] + '%');
    });

    // HUD + summary
    var scope = scopeLabel(feats.length);
    var lookText = state.colour.name + ' on ' + BACKDROPS[state.backdrop].toLowerCase() + ', ' + STYLES[state.style].toLowerCase();

    el.chips.innerHTML = '';
    [t.label, state.colour.name, scope].forEach(function (text, i) {
      var c = document.createElement('span');
      c.textContent = text;
      if (i === 1) {
        c.className = 'has-dot';
        c.style.setProperty('--dot', state.colour.hex);
      }
      el.chips.appendChild(c);
    });

    document.getElementById('summaryLead').textContent =
      displayName() + ': ' + withArticle(lower(t.label)) + ' in ' + lower(state.colour.name) + ' on a ' +
      lower(BACKDROPS[state.backdrop]) + ' backdrop, with a ' + lower(STYLES[state.style]) + ' feel, and ' +
      sentence(labels.map(lower)) + '.';
    document.getElementById('sumType').textContent = t.label;
    document.getElementById('sumLook').textContent = state.colour.name + ' (' + state.colour.hex.toUpperCase() + '), ' +
      BACKDROPS[state.backdrop] + ' backdrop, ' + STYLES[state.style];
    document.getElementById('sumFeatures').textContent = labels.length ? labels.join(', ') : 'None yet';
    document.getElementById('sumScope').textContent = scope;

    el.live.textContent = displayName() + ', ' + t.label + ', ' + lookText + ', ' + feats.length + ' features on.';

    if (opts && opts.swap) swapAnimation();
  }

  // ---- steps ----
  function showStep(n) {
    step = Math.max(0, Math.min(el.panes.length - 1, n));
    Array.prototype.forEach.call(el.panes, function (p, i) { p.hidden = i !== step; });
    Array.prototype.forEach.call(el.steps, function (b, i) {
      b.classList.toggle('is-current', i === step);
      b.classList.toggle('is-done', i < step);
      if (i === step) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
    el.back.disabled = step === 0;
    el.next.hidden = step === el.panes.length - 1;
  }

  Array.prototype.forEach.call(el.steps, function (b) {
    b.addEventListener('click', function () { showStep(parseInt(b.getAttribute('data-step'), 10)); });
  });
  el.back.addEventListener('click', function () { showStep(step - 1); });
  el.next.addEventListener('click', function () { showStep(step + 1); });

  // ---- choices ----
  document.addEventListener('click', function (e) {
    var opt = e.target.closest('[data-group]');
    if (opt) {
      var group = opt.getAttribute('data-group');
      var value = opt.getAttribute('data-value');
      if (state[group] !== value) {
        state[group] = value;
        if (group === 'type') pruneFeatures();
        render({ swap: group === 'type' });
      }
      return;
    }

    var feat = e.target.closest('[data-feature-opt]');
    if (feat) {
      var k = feat.getAttribute('data-feature-opt');
      state.features[k] = !state.features[k];
      render();
    }
  });

  el.name.addEventListener('input', function () {
    state.name = el.name.value;
    render();
  });

  // ---- surprise me / start over ----
  function pick(obj) {
    var keys = Object.keys(obj);
    return keys[Math.floor(Math.random() * keys.length)];
  }

  el.dice.addEventListener('click', function () {
    var p = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    state.type = pick(TYPES);
    state.colour = { name: p.name, hex: p.hex, family: p.family };
    family = p.family;
    state.backdrop = pick(BACKDROPS);
    state.style = pick(STYLES);
    state.features = {};
    availableKeys().forEach(function (k) { state.features[k] = Math.random() < 0.3; });
    render({ swap: true });
  });

  el.reset.addEventListener('click', function () {
    state = freshState();
    family = 'brand';
    el.name.value = '';
    document.getElementById('yourName').value = '';
    document.getElementById('yourNotes').value = '';
    render({ swap: true });
    showStep(0);
  });

  // ---- send the build as an email ----
  el.send.addEventListener('click', function () {
    var feats = featureList().map(function (k) { return FEATURES[k].label; });
    var who = document.getElementById('yourName').value.trim();
    var notes = document.getElementById('yourNotes').value.trim();

    var body = [
      'Hi Fat Elephant,',
      '',
      'I built this with Fat Build on your website:',
      '',
      'Product name: ' + displayName(),
      'Type: ' + TYPES[state.type].label,
      'Colour: ' + state.colour.name + ' (' + state.colour.hex.toUpperCase() + ')',
      'Backdrop: ' + BACKDROPS[state.backdrop],
      'Style: ' + STYLES[state.style],
      'Features: ' + (feats.length ? feats.join(', ') : 'None yet'),
      'Size: ' + scopeLabel(feats.length),
      ''
    ];
    if (notes) body.push('Notes: ' + notes, '');
    body.push(who ? 'Thanks, ' + who : 'Thanks');

    window.location.href = 'mailto:hello@fatelephant.co.in' +
      '?subject=' + encodeURIComponent('Fat Build: ' + displayName()) +
      '&body=' + encodeURIComponent(body.join('\n'));
  });

  // ---- the stage tilts towards the cursor ----
  if (finePointer && !reduceMotion && el.stageView) {
    var queued = false;
    var tx = 0;
    var ty = 0;

    var apply = function () {
      queued = false;
      device.style.setProperty('--rx', ty.toFixed(2) + 'deg');
      device.style.setProperty('--ry', tx.toFixed(2) + 'deg');
    };

    el.stageView.addEventListener('pointermove', function (e) {
      var r = el.stageView.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 12;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 8;
      if (!queued) {
        queued = true;
        requestAnimationFrame(apply);
      }
    });

    el.stageView.addEventListener('pointerleave', function () {
      tx = 0;
      ty = 0;
      apply();
    });
  }

  buildPalette();
  buildFeatures();
  render();
  showStep(0);
})();
