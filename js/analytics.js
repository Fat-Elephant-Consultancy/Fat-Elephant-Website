// Google Analytics 4 with Consent Mode v2 and a simple cookie banner.
//
// To switch it on, paste the GA4 measurement ID below (it looks like G-XXXXXXXXXX).
// Until an ID is set, this file loads nothing, shows no banner and sets no cookies,
// and window.feTrack() quietly does nothing, so the rest of the site can call it freely.
(function () {
  var GA_MEASUREMENT_ID = '';

  var STORE_KEY = 'fe_consent';
  var enabled = false;
  var banner = null;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  // Safe to call anywhere. Sends a GA4 event once analytics is on.
  window.feTrack = function (name, params) {
    if (!enabled) return;
    gtag('event', name, params || {});
  };

  function readChoice() {
    try { return window.localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }

  function saveChoice(value) {
    try { window.localStorage.setItem(STORE_KEY, value); } catch (e) { /* private mode: the choice just lasts for this visit */ }
  }

  function applyConsent(granted) {
    gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }

  function hideBanner() {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
  }

  function showBanner() {
    if (banner) return;

    banner = document.createElement('div');
    banner.className = 'consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<p>We use Google Analytics cookies to see how the site is used. Nothing is switched on unless you accept. ' +
      'See our <a href="/privacy">Privacy Policy</a>.</p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="consent-btn consent-btn--accept" data-consent="granted">Accept</button>' +
      '<button type="button" class="consent-btn" data-consent="denied">Decline</button>' +
      '</div>';

    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-consent]');
      if (!btn) return;
      var granted = btn.getAttribute('data-consent') === 'granted';
      saveChoice(granted ? 'granted' : 'denied');
      applyConsent(granted);
      hideBanner();
    });

    document.body.appendChild(banner);
  }

  // A "Cookie settings" link in the footer so people can change their mind
  function addFooterLink() {
    var list = document.querySelector('.footer-legal');
    if (!list || list.querySelector('[data-cookie-settings]')) return;

    var a = document.createElement('a');
    a.href = '#';
    a.textContent = 'Cookie settings';
    a.setAttribute('data-cookie-settings', '');
    a.addEventListener('click', function (e) {
      e.preventDefault();
      showBanner();
    });
    list.appendChild(a);
  }

  // Click events that are not tied to a form
  function trackClicks() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;

      var href = a.getAttribute('href') || '';

      if (a.classList.contains('btn')) {
        var label = a.textContent.trim();
        if (/start a project|try fat build/i.test(label)) {
          var area = a.closest('header, footer, section, .page-header');
          var where = area ? (area.id || area.tagName.toLowerCase()) : 'page';
          window.feTrack('cta_click', { cta_text: label, location: where });
        }
      }

      if (/linkedin\.com|instagram\.com/i.test(href)) {
        window.feTrack('outbound_social', { network: /linkedin/i.test(href) ? 'linkedin' : 'instagram' });
      }

      if (/^mailto:/i.test(href)) {
        window.feTrack('email_click', { link_location: a.closest('footer') ? 'footer' : 'page' });
      }
    }, true);
  }

  function init(id) {
    if (enabled || !id) return;
    enabled = true;

    // Consent Mode v2: everything starts denied until the visitor chooses
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });

    var choice = readChoice();
    if (choice === 'granted') applyConsent(true);

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);

    gtag('js', new Date());
    gtag('config', id);

    trackClicks();
    addFooterLink();
    if (!choice) showBanner();
  }

  window.feAnalytics = { init: init };

  init(GA_MEASUREMENT_ID);
})();
