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

// Service accordion (services.html)
var accordionItems = document.querySelectorAll('.service-accordion-item');

if (accordionItems.length) {
  var openAccordionItem = function (item) {
    var header = item.querySelector('.service-accordion-header');
    var panel = item.querySelector('.service-accordion-panel');
    var label = item.querySelector('.toggle-label');

    item.classList.add('is-open');
    header.setAttribute('aria-expanded', 'true');
    label.textContent = 'Show Less';
    panel.style.maxHeight = panel.scrollHeight + 'px';
  };

  var closeAccordionItem = function (item) {
    var header = item.querySelector('.service-accordion-header');
    var panel = item.querySelector('.service-accordion-panel');
    var label = item.querySelector('.toggle-label');

    item.classList.remove('is-open');
    header.setAttribute('aria-expanded', 'false');
    label.textContent = 'Learn More';
    panel.style.maxHeight = '0px';
  };

  accordionItems.forEach(function (item) {
    var header = item.querySelector('.service-accordion-header');

    header.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      accordionItems.forEach(function (other) {
        if (other !== item && other.classList.contains('is-open')) {
          closeAccordionItem(other);
        }
      });

      if (isOpen) {
        closeAccordionItem(item);
      } else {
        openAccordionItem(item);
      }
    });
  });

  window.addEventListener('resize', function () {
    accordionItems.forEach(function (item) {
      if (item.classList.contains('is-open')) {
        var panel = item.querySelector('.service-accordion-panel');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  if (window.location.hash) {
    var targetItem = document.getElementById(window.location.hash.slice(1));

    if (targetItem && targetItem.classList.contains('service-accordion-item')) {
      openAccordionItem(targetItem);
      setTimeout(function () {
        targetItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }
}

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

// Subtle depth tilt on service cards (fine-pointer, hover-capable devices only)
var canHoverTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (canHoverTilt && !prefersReducedMotion) {
  document.querySelectorAll('.service-card').forEach(function (card) {
    var maxTiltDeg = 5;

    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty('--tilt-x', (-py * maxTiltDeg * 2) + 'deg');
      card.style.setProperty('--tilt-y', (px * maxTiltDeg * 2) + 'deg');
    });

    card.addEventListener('mouseleave', function () {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

// Ambient lime glow that follows the cursor (fine-pointer, hover-capable devices only)
if (canHoverTilt && !prefersReducedMotion) {
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
