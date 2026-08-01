// Footer year
document.querySelectorAll('#year').forEach(function (el) {
  el.textContent = new Date().getFullYear();
});

// Mobile nav toggle
var navToggle = document.getElementById('navToggle');
var navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', function () {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
    });
  });
}

// Reveal-on-scroll animations
var revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && revealEls.length) {
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
