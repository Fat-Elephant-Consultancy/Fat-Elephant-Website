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
