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
      'mailto:hello@fatelephant.co.in' +
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

// Home page, "How we work": paper notes you can pick up and move around the desk, and a
// question note whose answer is sent to us once an email address is given. Dragging is for wide screens
// with a mouse; elsewhere the notes just stack.
(function () {
  var board = document.querySelector('.desk-board');
  if (!board) return;

  var notes = Array.prototype.slice.call(board.querySelectorAll('.note'));
  var form = board.querySelector('#askForm');
  var noteEl = board.querySelector('.note--ask');

  var dialog = document.getElementById('shipDialog');

  if (form && dialog) {
    var status = form.querySelector('#askStatus');
    var textarea = form.querySelector('#askNote');
    var stamp = noteEl.querySelector('.stamp');
    var shipForm = document.getElementById('shipForm');
    var emailInput = document.getElementById('shipEmail');
    var shipError = document.getElementById('shipError');
    var shipGo = document.getElementById('shipGo');
    var shipDone = document.getElementById('shipDone');
    var pending = null;

    var shipped = function (on, label) {
      if (label) stamp.textContent = label;
      noteEl.classList.toggle('is-shipped', on);
    };

    form.addEventListener('change', function () { shipped(false); });
    textarea.addEventListener('input', function () { shipped(false); });

    var resetDialog = function () {
      shipForm.hidden = false;
      shipDone.hidden = true;
      shipGo.disabled = false;
      shipGo.textContent = 'Think Fat';
      shipError.textContent = '';
      emailInput.removeAttribute('aria-invalid');
    };

    // Step one: check there is something to ship, then ask for an email address
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var picked = form.querySelector('input[name="holdback"]:checked');
      var note = textarea.value.trim();

      if (!picked && !note) {
        status.className = 'ask-status is-error';
        status.textContent = 'Pick an answer or write us a note first.';
        return;
      }

      status.className = 'ask-status';
      status.textContent = '';
      pending = { answer: picked ? picked.value : '', note: note };

      resetDialog();
      dialog.showModal();
      emailInput.focus();
    });

    // Step two: an email address is required before anything is shipped
    var deliver = function (email) {
      var lines = [
        'Hi Fat Elephant,',
        '',
        'Here is my answer from your website.',
        '',
        "What's holding your idea back? " + (pending.answer || '(no answer picked)')
      ];
      if (pending.note) lines.push('', 'Note: ' + pending.note);
      lines.push('', 'Reply to: ' + email);

      // an online form service can be wired in by setting data-endpoint on the dialog
      var endpoint = (dialog.getAttribute('data-endpoint') || '').trim();

      if (endpoint) {
        return fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            email: email,
            answer: pending.answer,
            note: pending.note,
            source: 'home-desk'
          })
        }).then(function (res) {
          if (!res.ok) throw new Error('send failed');
          return 'online';
        });
      }

      window.location.href = 'mailto:hello@fatelephant.co.in' +
        '?subject=' + encodeURIComponent('Feedback from the website') +
        '&body=' + encodeURIComponent(lines.join('\n'));
      return Promise.resolve('email');
    };

    var celebrate = function (mode, email) {
      var online = mode === 'online';
      document.getElementById('shipDoneTitle').textContent = online ? 'Shipped.' : 'Nearly there.';
      document.getElementById('shipDoneText').textContent = online
        ? "We've got your note and we'll write back to " + email + '.'
        : "Your email app is opening with your note ready. Press send and it's with us.";

      shipForm.hidden = true;
      shipDone.hidden = false;

      window.setTimeout(function () {
        if (dialog.open) dialog.close();
        shipped(true, online ? 'Shipped!' : 'Ready!');
        form.reset();
        pending = null;
      }, online ? 2200 : 3200);
    };

    shipForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = emailInput.value.trim();

      // the hidden field is only ever filled in by bots
      if (shipForm.elements.website && shipForm.elements.website.value) return;

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        emailInput.setAttribute('aria-invalid', 'true');
        shipError.textContent = 'Please enter a valid email address.';
        emailInput.focus();
        return;
      }

      emailInput.removeAttribute('aria-invalid');
      shipError.textContent = '';
      shipGo.disabled = true;
      shipGo.textContent = 'Shipping...';

      deliver(email).then(function (mode) {
        celebrate(mode, email);
      }).catch(function () {
        shipGo.disabled = false;
        shipGo.textContent = 'Think Fat';
        shipError.textContent = "That didn't go through. Please try again, or email hello@fatelephant.co.in.";
      });
    });

    dialog.addEventListener('click', function (e) {
      if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
    });

    dialog.addEventListener('close', function () {
      emailInput.value = '';
      resetDialog();
    });
  }

  var canDrag = window.matchMedia('(min-width: 861px) and (hover: hover) and (pointer: fine)');
  var top = 10;

  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }

  notes.forEach(function (note) {
    var x = 0;
    var y = 0;
    var grab = null;

    function place() {
      note.style.setProperty('--dx', x + 'px');
      note.style.setProperty('--dy', y + 'px');
    }

    // keep the note on the desk (offsetLeft/Top ignore transforms, so they are its resting spot)
    function keepOnDesk() {
      x = clamp(x, -note.offsetLeft, board.clientWidth - note.offsetLeft - note.offsetWidth);
      y = clamp(y, -note.offsetTop, board.clientHeight - note.offsetTop - note.offsetHeight);
    }

    note.addEventListener('pointerdown', function (e) {
      if (!canDrag.matches || e.button !== 0) return;
      if (e.target.closest('input, textarea, label, a, button')) return;

      grab = { px: e.clientX, py: e.clientY, x: x, y: y };
      note.setPointerCapture(e.pointerId);
      note.classList.add('is-held');
      note.style.zIndex = ++top;
      e.preventDefault();
    });

    note.addEventListener('pointermove', function (e) {
      if (!grab) return;
      x = grab.x + e.clientX - grab.px;
      y = grab.y + e.clientY - grab.py;
      keepOnDesk();
      place();
    });

    function drop() {
      grab = null;
      note.classList.remove('is-held');
    }

    note.addEventListener('pointerup', drop);
    note.addEventListener('pointercancel', drop);

    function refit() {
      if (!canDrag.matches) {
        x = 0;
        y = 0;
      } else {
        keepOnDesk();
      }
      place();
    }

    window.addEventListener('resize', refit);
  });
})();

// Home page, Fat Build teaser: the little product rebuilds itself in new colours and with
// different features, a taste of what the full builder does. It only runs while on screen.
(function () {
  var dev = document.getElementById('fbDevice');
  if (!dev || prefersReducedMotion) return;

  var looks = [
    ['#e3ef26', '#06231d', 'Fatwheels'],
    ['#ff7a59', '#06231d', 'Pawfect'],
    ['#4db5ff', '#06231d', 'Zing'],
    ['#8e5cf0', '#fffdee', 'Orbit'],
    ['#3fbf6e', '#06231d', 'Tidy']
  ];

  var names = dev.querySelectorAll('.fb-name');
  var logo = dev.querySelector('.fb-logo');
  var url = dev.querySelector('.fb-url');
  var cards = dev.querySelectorAll('.fb-card');
  var n = 0;
  var timer = 0;

  function show(i) {
    var look = looks[i % looks.length];
    dev.style.setProperty('--fb-accent', look[0]);
    dev.style.setProperty('--fb-ink', look[1]);

    Array.prototype.forEach.call(names, function (el) { el.textContent = look[2]; });
    logo.textContent = look[2].charAt(0);
    url.textContent = look[2].toLowerCase() + '.com';

    // one, two or three feature cards, so parts keep dropping in and out
    var count = 1 + (i % 3);
    Array.prototype.forEach.call(cards, function (c, k) { c.classList.toggle('is-on', k < count); });
  }

  function start() {
    if (timer) return;
    timer = window.setInterval(function () { show(++n); }, 2400);
  }

  function stop() {
    window.clearInterval(timer);
    timer = 0;
  }

  show(0);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.25 }).observe(dev);
  } else {
    start();
  }
})();
