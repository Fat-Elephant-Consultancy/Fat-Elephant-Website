// Footer year
document.querySelectorAll('#year').forEach(function (el) {
  el.textContent = new Date().getFullYear();
});

var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Nav dropdown menu
var navMenuTrigger = document.getElementById('navMenuTrigger');
var navDropdown = document.getElementById('navDropdown');

if (navMenuTrigger && navDropdown) {
  var closeNavDropdown = function () {
    navDropdown.classList.remove('open');
    navMenuTrigger.setAttribute('aria-expanded', 'false');
  };

  navMenuTrigger.addEventListener('click', function (e) {
    e.stopPropagation();
    var isOpen = navDropdown.classList.contains('open');

    if (isOpen) {
      closeNavDropdown();
    } else {
      navDropdown.classList.add('open');
      navMenuTrigger.setAttribute('aria-expanded', 'true');
    }
  });

  navDropdown.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      closeNavDropdown();
    });
  });

  document.addEventListener('click', function (e) {
    if (!navMenuTrigger.contains(e.target) && !navDropdown.contains(e.target)) {
      closeNavDropdown();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeNavDropdown();
    }
  });
}

// Reveal-on-scroll animations (staggered per sibling group for a cascade effect)
var revealEls = document.querySelectorAll('.reveal');

if (!prefersReducedMotion) {
  var groupCounts = new Map();

  revealEls.forEach(function (el) {
    var parent = el.parentElement;
    var indexInGroup = groupCounts.get(parent) || 0;
    groupCounts.set(parent, indexInGroup + 1);
    el.style.transitionDelay = Math.min(indexInGroup * 70, 420) + 'ms';
  });
}

if ('IntersectionObserver' in window && revealEls.length && !prefersReducedMotion) {
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
} else {
  revealEls.forEach(function (el) {
    el.classList.add('in-view');
  });
}

// Contact form -> mailto handoff
var contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = contactForm.name.value.trim();
    var email = contactForm.email.value.trim();
    var project = contactForm.project.value;
    var message = contactForm.message.value.trim();

    var subject = 'New project inquiry: ' + project;
    var body =
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Project type: ' + project + '\n\n' +
      message;

    var mailto =
      'mailto:trunklink@fatelephant.co.in' +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    window.location.href = mailto;
  });
}

// Services page: as the next card slides over a card, that card shrinks and dims a little,
// so the deck reads as layers. The stacking itself is plain CSS (position: sticky).
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.stack-card'));
  if (cards.length < 2 || prefersReducedMotion) return;

  var ticking = false;

  function stuckTop(card) {
    return parseFloat(getComputedStyle(card).top) || 0;
  }

  function update() {
    ticking = false;

    for (var i = 0; i < cards.length - 1; i++) {
      var current = cards[i];
      var next = cards[i + 1];

      // 0 while the next card is still below this one, 1 once it has fully covered it
      var touch = stuckTop(current) + current.offsetHeight;
      var settled = stuckTop(next);
      var progress = (touch - next.getBoundingClientRect().top) / (touch - settled);

      current.style.setProperty('--p', Math.min(1, Math.max(0, progress)).toFixed(3));
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

// Hero blob parallax on scroll
var heroEl = document.querySelector('.hero');

if (heroEl && !prefersReducedMotion) {
  var parallaxTicking = false;

  window.addEventListener(
    'scroll',
    function () {
      if (parallaxTicking) return;
      parallaxTicking = true;

      requestAnimationFrame(function () {
        var y = window.scrollY;
        heroEl.style.setProperty('--blob-shift-1', Math.min(y * 0.15, 60) + 'px');
        heroEl.style.setProperty('--blob-shift-2', Math.min(y * 0.1, 40) + 'px');
        parallaxTicking = false;
      });
    },
    { passive: true }
  );
}

// "What We Do" scroll stage (desktop with motion). Everywhere else the section
// stays a plain stacked list, so nothing here is needed for the content itself.
(function () {
  var section = document.getElementById('services');
  var track = document.getElementById('stageTrack');
  var stage = document.getElementById('stage');
  if (!section || !track || !stage) return;

  var items = Array.prototype.slice.call(stage.querySelectorAll('.service-item'));
  var steps = Array.prototype.slice.call(stage.querySelectorAll('.stage-step'));
  var counter = document.getElementById('stageCurrent');
  var total = items.length;
  var wide = window.matchMedia('(min-width: 900px) and (min-height: 560px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var enabled = false;
  var active = -1;
  var ticking = false;
  var sweepTimer = null;

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function stickyTop() {
    return parseFloat(getComputedStyle(stage).top) || 0;
  }

  function pinnedLength() {
    return Math.max(track.offsetHeight - stage.offsetHeight, 1);
  }

  function indexFromScroll() {
    var travelled = stickyTop() - track.getBoundingClientRect().top;
    var clamped = Math.min(Math.max(travelled, 0), pinnedLength());
    return Math.min(total - 1, Math.floor((clamped / pinnedLength()) * total));
  }

  function clearTransition() {
    stage.classList.remove('is-sweeping');
    items.forEach(function (item) {
      var art = item.querySelector('.service-art');
      art.classList.remove('is-entering', 'is-leaving');
    });
  }

  function setActive(next) {
    if (next === active) return;

    var prev = active;
    var dir = prev === -1 || next > prev ? 'fwd' : 'back';
    active = next;

    stage.setAttribute('data-active', String(next));
    stage.setAttribute('data-dir', dir);

    items.forEach(function (item, i) {
      var d = i - next;
      var art = item.querySelector('.service-art');

      item.style.setProperty('--d', String(d));
      item.classList.toggle('is-active', d === 0);
      item.classList.toggle('is-prev', d === -1);

      art.classList.remove('is-entering', 'is-leaving');
      if (prev !== -1 && i === next) art.classList.add('is-entering');
      if (prev !== -1 && i === prev) art.classList.add('is-leaving');
    });

    steps.forEach(function (btn, i) {
      btn.classList.toggle('is-active', i === next);
      if (i === next) {
        btn.setAttribute('aria-current', 'step');
      } else {
        btn.removeAttribute('aria-current');
      }
    });

    if (counter) counter.textContent = pad(next + 1);

    if (prev !== -1) {
      stage.classList.remove('is-sweeping');
      void stage.offsetWidth;
      stage.classList.add('is-sweeping');
      clearTimeout(sweepTimer);
      sweepTimer = setTimeout(clearTransition, 950);
    }
  }

  function update() {
    ticking = false;
    if (enabled) setActive(indexFromScroll());
  }

  function onScroll() {
    if (!enabled || ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function enable() {
    enabled = true;
    active = -1;
    section.classList.add('has-stage');
    setActive(indexFromScroll());
  }

  function disable() {
    enabled = false;
    active = -1;
    clearTimeout(sweepTimer);
    clearTransition();
    section.classList.remove('has-stage');
    items.forEach(function (item) {
      item.style.removeProperty('--d');
      item.classList.remove('is-active', 'is-prev');
    });
  }

  function evaluate() {
    var shouldEnable = wide.matches && !reduced.matches;
    if (shouldEnable && !enabled) enable();
    if (!shouldEnable && enabled) disable();
  }

  steps.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      var trackTop = track.getBoundingClientRect().top + window.scrollY;
      var target = trackTop - stickyTop() + pinnedLength() * ((i + 0.5) / total);
      window.scrollTo({ top: target, behavior: reduced.matches ? 'auto' : 'smooth' });
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    evaluate();
    onScroll();
  });
  wide.addEventListener('change', evaluate);
  reduced.addEventListener('change', evaluate);

  evaluate();
})();

// Interactive doodle headline: each letter / full stop swaps its pen-doodle style when
// hovered or tapped, and one changes on its own every so often so the headline feels alive.
(function () {
  var title = document.querySelector('.doodle-title');
  if (!title) return;

  var parts = Array.prototype.slice.call(title.querySelectorAll('[data-doodle]'));
  var VARIANTS = 4;
  var lastAuto = -1;
  var onScreen = true;

  function bump(el) {
    var next = (parseInt(el.getAttribute('data-v'), 10) + 1) % VARIANTS;
    el.setAttribute('data-v', String(next));

    if (!prefersReducedMotion) {
      el.classList.remove('is-drawing');
      void el.offsetWidth;
      el.classList.add('is-drawing');
    }
  }

  parts.forEach(function (el) {
    el.addEventListener('pointerenter', function () {
      bump(el);
    });
  });

  if (prefersReducedMotion) return;

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
    }).observe(title);
  }

  setInterval(function () {
    if (document.hidden || !onScreen) return;

    var idx;
    do {
      idx = Math.floor(Math.random() * parts.length);
    } while (idx === lastAuto && parts.length > 1);

    lastAuto = idx;
    bump(parts[idx]);
  }, 1800);
})();

// Ambient lime glow that follows the cursor (fine-pointer, hover-capable devices only)
var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (canHover && !prefersReducedMotion) {
  var cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  cursorGlow.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursorGlow);

  var glowTicking = false;
  var glowX = 0;
  var glowY = 0;

  window.addEventListener(
    'mousemove',
    function (e) {
      glowX = e.clientX;
      glowY = e.clientY;
      cursorGlow.classList.add('is-visible');

      if (glowTicking) return;
      glowTicking = true;

      requestAnimationFrame(function () {
        cursorGlow.style.transform = 'translate(' + glowX + 'px, ' + glowY + 'px) translate(-50%, -50%)';
        glowTicking = false;
      });
    },
    { passive: true }
  );

  document.addEventListener('mouseleave', function () {
    cursorGlow.classList.remove('is-visible');
  });
}

// About page: a faint pixel field behind the content. Pixels form around the cursor and
// fade away again. It sits behind everything, so text and cards are never covered.
(function () {
  if (!document.body.classList.contains('page-about')) return;

  var field = document.createElement('div');
  field.className = 'pixel-field';
  field.setAttribute('aria-hidden', 'true');
  document.body.appendChild(field);

  // Touch devices and reduced-motion users just get the static faint grid
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!finePointer || prefersReducedMotion) return;

  var canvas = document.createElement('canvas');
  field.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  var CELL = 16;
  var RADIUS = 96;
  var LIFE = 1700;
  var MAX_CELLS = 700;
  var cells = new Map();
  var rafId = 0;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawCell(c, now) {
    var age = now - c.born;
    var grow = Math.min(1, age / 160);
    var size = c.size * (1 - Math.pow(1 - grow, 3));
    var fade = 1 - Math.max(0, (age - 220) / (c.life - 220));
    var cx = (c.x + 0.5) * CELL;
    var cy = (c.y + 0.5) * CELL;

    ctx.fillStyle = (c.tone ? 'rgba(12, 52, 44, ' : 'rgba(7, 102, 83, ') + (c.max * fade).toFixed(3) + ')';

    if (c.plus) {
      var arm = size * 1.5;
      ctx.fillRect(cx - arm / 2, cy - 0.75, arm, 1.5);
      ctx.fillRect(cx - 0.75, cy - arm / 2, 1.5, arm);
    } else {
      ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
    }
  }

  function frame(now) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    cells.forEach(function (c, key) {
      if (now - c.born >= c.life) {
        cells.delete(key);
      } else {
        drawCell(c, now);
      }
    });

    rafId = cells.size ? requestAnimationFrame(frame) : 0;
  }

  function stamp(px, py) {
    var now = performance.now();
    var gx = Math.floor(px / CELL);
    var gy = Math.floor(py / CELL);
    var reach = Math.ceil(RADIUS / CELL);

    for (var dy = -reach; dy <= reach; dy++) {
      for (var dx = -reach; dx <= reach; dx++) {
        var x = gx + dx;
        var y = gy + dy;
        var dist = Math.hypot((x + 0.5) * CELL - px, (y + 0.5) * CELL - py);
        if (dist > RADIUS) continue;

        var closeness = 1 - dist / RADIUS;
        if (Math.random() > Math.pow(closeness, 1.6) * 0.5) continue;

        var key = x + ',' + y;
        var existing = cells.get(key);
        if (existing && now - existing.born < existing.life * 0.5) continue;

        cells.delete(key);
        cells.set(key, {
          x: x,
          y: y,
          born: now,
          life: LIFE * (0.7 + Math.random() * 0.8),
          plus: Math.random() < 0.28,
          tone: Math.random() < 0.4 ? 1 : 0,
          max: 0.16 + 0.22 * closeness,
          size: CELL * (0.28 + Math.random() * 0.3)
        });
      }
    }

    while (cells.size > MAX_CELLS) {
      cells.delete(cells.keys().next().value);
    }
  }

  window.addEventListener(
    'pointermove',
    function (e) {
      if (e.pointerType !== 'mouse') return;
      stamp(e.clientX, e.clientY);
      if (!rafId) rafId = requestAnimationFrame(frame);
    },
    { passive: true }
  );

  window.addEventListener('resize', resize);
  resize();
})();
