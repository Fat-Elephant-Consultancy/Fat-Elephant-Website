"""Builds the individual service pages (services/<slug>.html) from scripts/service_content.py.

Run from the project folder:   python scripts/build_service_pages.py

The pages reuse the site's header and footer from about.html, so if the navigation or footer
changes, update it there and run this again. This folder is not published (see .vercelignore).
"""
import html as htmllib
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from service_content import SERVICES  # noqa: E402

ORIGIN = 'https://fatelephant.co.in'


def esc(s):
    return htmllib.escape(s, quote=False)


def attr(s):
    return htmllib.escape(s, quote=True).replace('&#x27;', "'")


def read(path):
    with open(os.path.join(ROOT, path), encoding='utf-8', newline='') as f:
        return f.read().replace('\r\n', '\n')


# ---------------------------------------------------------------- shared chrome
about = read('about.html')
HEADER = re.search(r'<header class="navbar">.*?</header>', about, re.S).group(0).replace(' class="active"', '')
HEADER = HEADER.replace('<li><a href="/services">Services</a></li>', '<li><a href="/services" class="active">Services</a></li>', 1)
FOOTER = re.search(r'<footer class="site-footer">.*?</footer>', about, re.S).group(0)

HEAD = '''<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Fat Elephant">
<meta property="og:locale" content="en_IN">
<meta property="og:image" content="{origin}/og/services-{slug}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{h1}, Fat Elephant">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#fffdee">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<script type="application/ld+json">
{jsonld}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&family=Caveat:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
</head>
<body class="page-service">

'''

TAIL = '''

<script src="/js/analytics.js"></script>
<script src="/js/main.js"></script>
</body>
</html>
'''


def jsonld(s, url):
    graph = [
        {
            '@type': 'Service',
            '@id': url + '#service',
            'name': s['h1'],
            'serviceType': s['label'],
            'description': s['desc'],
            'url': url,
            'provider': {'@id': ORIGIN + '/#organization'},
            'areaServed': [{'@type': 'Country', 'name': 'India'}, {'@type': 'Country', 'name': 'United Kingdom'}],
        },
        {
            '@type': 'BreadcrumbList',
            'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': ORIGIN + '/'},
                {'@type': 'ListItem', 'position': 2, 'name': 'Services', 'item': ORIGIN + '/services'},
                {'@type': 'ListItem', 'position': 3, 'name': s['label']},
            ],
        },
        {
            '@type': 'FAQPage',
            'mainEntity': [
                {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}}
                for q, a in s['faq']
            ],
        },
    ]
    return json.dumps({'@context': 'https://schema.org', '@graph': graph}, indent=2, ensure_ascii=False)


def body(s):
    out = []
    out.append('''<nav class="breadcrumb" aria-label="Breadcrumb">
  <div class="container">
    <ol>
      <li><a href="/">Home</a></li>
      <li><a href="/services">Services</a></li>
      <li aria-current="page">%s</li>
    </ol>
  </div>
</nav>
''' % esc(s['label']))

    out.append('''<div class="page-header svc-header">
  <div class="container">
    <span class="eyebrow">%s</span>
    <h1>%s</h1>
    <p class="svc-lede">%s</p>
    <div class="svc-actions">
      <a href="/contact" class="btn btn-primary">Start a Project</a>
      <a href="/build" class="btn btn-outline">Try <span class="fat-build"><span class="sr-only">Fat Build</span></span></a>
    </div>
  </div>
</div>
''' % (esc(s['label']), esc(s['h1']), esc(s['lede'])))

    out.append('''<section class="svc-glance">
  <div class="container">
    <div class="glance-card">
      <span class="glance-label">In short</span>
      <p>%s</p>
    </div>
  </div>
</section>
''' % esc(s['glance']))

    offers = '\n'.join('''        <article class="offer">
          <h3>%s</h3>
          <p>%s</p>
        </article>''' % (esc(t), esc(p)) for t, p in s['offers'])
    out.append('''<section class="svc-offer">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">What We Do</span>
      <h2>%s</h2>
      <p>%s</p>
    </div>
    <div class="offer-grid">
%s
    </div>
  </div>
</section>
''' % (esc(s['offer_h2']) + ': ' + esc(s['label']), esc(s['offer_intro']), offers))

    steps = '\n'.join('''        <li class="how-step">
          <span class="how-num" aria-hidden="true">%02d</span>
          <h3>%s</h3>
          <p>%s</p>
        </li>''' % (i + 1, esc(t), esc(p)) for i, (t, p) in enumerate(s['steps']))
    out.append('''<section class="svc-how">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">The Process</span>
      <h2>%s</h2>
      <p>%s</p>
    </div>
    <ol class="how-steps">
%s
    </ol>
  </div>
</section>
''' % (esc(s['how_h2']), esc(s['how_intro']), steps))

    good = '\n'.join('        <li>%s</li>' % esc(x) for x in s['fit_for'])
    bad = '\n'.join('        <li>%s</li>' % esc(x) for x in s['fit_not'])
    out.append('''<section class="svc-fit">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Honest Fit</span>
      <h2>%s</h2>
    </div>
    <div class="fit-grid">
      <div class="fit-card fit-card--yes">
        <h3>A good fit if you are</h3>
        <ul>
%s
        </ul>
      </div>
      <div class="fit-card fit-card--no">
        <h3>Probably not for</h3>
        <ul>
%s
        </ul>
      </div>
    </div>
  </div>
</section>
''' % (esc(s['fit_h2']), good, bad))

    faqs = '\n'.join('''      <details class="faq-item">
        <summary>%s</summary>
        <div class="faq-a"><p>%s</p></div>
      </details>''' % (esc(q), esc(a)) for q, a in s['faq'])
    out.append('''<section class="svc-faq">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">FAQ</span>
      <h2>%s</h2>
    </div>
    <div class="faq">
%s
    </div>
  </div>
</section>
''' % (esc(s['faq_h2']), faqs))

    out.append('''<section id="cta">
  <div class="container">
    <div class="cta-banner">
      <div>
        <h2>Have an idea worth building?</h2>
        <p>Tell us what you are trying to build, and we will suggest the right place to start.</p>
      </div>
      <div class="cta-actions">
        <a href="/contact" class="btn btn-primary">Start a Project</a>
        <a href="/build" class="btn btn-outline">Try <span class="fat-build"><span class="sr-only">Fat Build</span></span></a>
      </div>
    </div>
  </div>
</section>
''')

    related = '\n'.join('''      <a href="%s" class="related-card">
        <h3>%s</h3>
        <p>%s</p>
        <span class="related-more">Learn more &rarr;</span>
      </a>''' % (href, esc(label), esc(blurb)) for label, href, blurb in s['related'])
    out.append('''<section class="svc-related">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Related Services</span>
      <h2>Often paired with %s</h2>
      <p>See <a href="/services">all six services</a> or <a href="/contact">talk to us</a> about where to start.</p>
    </div>
    <div class="related-grid">
%s
    </div>
  </div>
</section>''' % (esc(s['label']), related))
    return '\n'.join(out)


problems = []
for s in SERVICES:
    url = '%s/services/%s' % (ORIGIN, s['slug'])
    assert len(s['title']) <= 60, (s['slug'], 'title', len(s['title']))
    assert len(s['desc']) <= 155, (s['slug'], 'description', len(s['desc']))

    main = body(s)
    page = (HEAD.format(title=attr(s['title']), desc=attr(s['desc']), url=url, origin=ORIGIN, slug=s['slug'],
                        h1=attr(s['h1']), jsonld=jsonld(s, url))
            + HEADER + '\n\n' + main + '\n\n' + FOOTER + TAIL)

    if '—' in page:
        problems.append('%s: em dash found' % s['slug'])

    os.makedirs(os.path.join(ROOT, 'services'), exist_ok=True)
    with open(os.path.join(ROOT, 'services', s['slug'] + '.html'), 'w', encoding='utf-8', newline='') as f:
        f.write(page)

    words = len(re.sub(r'<[^>]+>', ' ', main).split())
    print('%-18s %4d words in the body | title %d chars | description %d chars' % (s['slug'], words, len(s['title']), len(s['desc'])))
    if words < 800:
        problems.append('%s: only %d words (target 800 to 1,200)' % (s['slug'], words))

if problems:
    print('\nTo fix:')
    for p in problems:
        print(' -', p)
