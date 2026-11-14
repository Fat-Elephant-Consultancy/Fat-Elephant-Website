/**
 * Fat Elephant: form mailer (Google Apps Script)
 *
 * Receives every form on the website (contact page, Fat Build, the home page question),
 * emails it to hello@fatelephant.co.in and keeps a copy as a row in the Google Sheet this
 * script is attached to. This file is not published with the site (see .vercelignore).
 *
 * Setup is in scripts/FORM-MAILER-SETUP.md.
 */

var TO = 'hello@fatelephant.co.in';
var SENDER_NAME = 'Fat Elephant website';
var MAX_FIELD = 5000;        // longest value we accept for any one field
var MAX_PER_HOUR = 60;       // safety valve against floods of junk

// Fields that are plumbing, not content
var HIDDEN = { _subject: 1, website: 1, source: 1 };

var LABELS = {
  name: 'Name',
  email: 'Email',
  project: 'Project type',
  message: 'Message',
  product: 'Product',
  type: 'Type',
  colour: 'Colour',
  backdrop: 'Backdrop',
  style: 'Style',
  features: 'Features',
  size: 'Size',
  notes: 'Notes',
  fat_build: 'Fat Build attached',
  fat_build_link: 'Open this build'
};

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '';
    var data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return reply(false, 'bad request');

    // the hidden "website" field is only ever filled in by bots: pretend it worked
    if (data.website) return reply(true);

    var email = clean(data.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return reply(false, 'email');

    if (!underLimit()) return reply(false, 'busy');

    var source = clean(data.source) || 'website';
    var subject = clean(data._subject) || ('New message from ' + source);
    subject = subject.replace(/[\r\n]+/g, ' ').slice(0, 150);

    var lines = [];
    var row = [new Date(), source, subject];
    Object.keys(data).forEach(function (key) {
      if (HIDDEN[key]) return;
      var value = clean(data[key]);
      if (!value) return;
      lines.push((LABELS[key] || key.replace(/_/g, ' ')) + ': ' + value);
    });

    var body = lines.join('\n\n') + '\n\n--\nSent from the ' + source + ' form on fatelephant.co.in.\n' +
      'Reply to this email to write back to ' + email + '.';

    MailApp.sendEmail({
      to: TO,
      replyTo: email,
      subject: subject,
      body: body,
      name: SENDER_NAME
    });

    // a copy in the sheet, so nothing is lost even if an email goes astray
    try {
      row.push(email, clean(data.name), body);
      SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].appendRow(row);
    } catch (sheetError) { /* the email has already gone, so ignore sheet problems */ }

    return reply(true);
  } catch (err) {
    return reply(false, 'error');
  }
}

// Opening the web app address in a browser just shows that it is alive
function doGet() {
  return reply(true, 'Fat Elephant form mailer is running.');
}

function clean(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\u0000/g, '').trim().slice(0, MAX_FIELD);
}

function reply(ok, note) {
  var out = { ok: ok };
  if (note) out.note = note;
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function underLimit() {
  var lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    var cache = CacheService.getScriptCache();
    var count = parseInt(cache.get('hourly') || '0', 10);
    if (count >= MAX_PER_HOUR) return false;
    cache.put('hourly', String(count + 1), 3600);
    return true;
  } finally {
    lock.releaseLock();
  }
}

// Run this once from the editor to authorise the script and send yourself a test email
function sendTest() {
  var fake = {
    postData: {
      contents: JSON.stringify({
        name: 'Test from the editor',
        email: TO,
        project: 'Not sure yet',
        message: 'If you can read this in the hello@ inbox, the mailer works.',
        source: 'test',
        _subject: 'Test: Fat Elephant form mailer'
      })
    }
  };
  Logger.log(doPost(fake).getContent());
}
