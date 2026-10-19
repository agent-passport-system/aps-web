/* pilot-signup.js: three question signup forms, one question at a time.
   Used by contact.html (pilot: name, email, company) and careers.html (build with us: name, email,
   résumé or GitHub link). The form's data-topic, data-source, data-third and data-page attributes
   set what is sent; data-list="0" skips the mailing list prompt. Sends to /api/contact (the aeoess-subscribe worker,
   delivered by Resend to signal@aeoess.com), then offers the double opt in mailing list through
   /api/subscribe. No third-party code, no tracking. */
(function () {
  'use strict';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var form = document.getElementById('pf');
  if (!form) return;
  var steps = form.querySelectorAll('.pf-step');
  var count = document.getElementById('pfN');
  var err = document.getElementById('pfErr');
  var go = document.getElementById('pfGo');
  var back = document.getElementById('pfBack');
  var inputs = [document.getElementById('pfName'), document.getElementById('pfEmail'), document.getElementById('pfOrg')];
  var hp = document.getElementById('pfHp');
  var done = document.getElementById('pfDone');
  var modal = document.getElementById('pfModal');
  var cfg = {
    topic: form.getAttribute('data-topic') || 'Pilot request',
    source: form.getAttribute('data-source') || 'contact-pilot',
    third: form.getAttribute('data-third') || 'Company',
    page: form.getAttribute('data-page') || 'contact.html',
    list: form.getAttribute('data-list') !== '0'
  };
  var i = 0, busy = false;

  function show(n) {
    i = n;
    for (var k = 0; k < steps.length; k++) steps[k].classList.toggle('is-on', k === n);
    count.textContent = String(n + 1);
    back.hidden = n === 0;
    go.textContent = n === steps.length - 1 ? 'Send →' : 'Next →';
    err.textContent = '';
    setTimeout(function () { inputs[n].focus(); }, 30);
  }

  function check(n) {
    var v = inputs[n].value.trim();
    if (n === 0 && !v) return 'Tell us your name first.';
    if (n === 1 && !EMAIL_RE.test(v)) return 'That email does not look right.';
    return '';
  }

  function post(url, body) {
    if (!window.fetch) return Promise.resolve(null);
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return null; }); })
      .catch(function () { return null; });
  }

  function send() {
    var name = inputs[0].value.trim(), email = inputs[1].value.trim(), org = inputs[2].value.trim();
    busy = true; go.disabled = true; go.textContent = 'Sending…';
    var isCompany = cfg.third === 'Company';
    post('/api/contact', {
      name: name, email: email, org: isCompany ? org : '', topic: cfg.topic,
      message: cfg.topic + ' from agent-passport.org/' + cfg.page + '. ' + cfg.third + ': ' + (org || 'not given') + '.',
      content_sha256: '', website: hp.value
    }).then(function (j) {
      busy = false; go.disabled = false;
      if (j && j.ok) {
        form.hidden = true;
        document.getElementById('pfWho').textContent = name;
        done.hidden = false;
        if (cfg.list) setTimeout(function () { openModal(email); }, 700);
      } else {
        go.textContent = 'Send →';
        err.innerHTML = 'That did not go through. Write to <a href="mailto:signal@aeoess.com">signal@aeoess.com</a>, a person reads it.';
      }
    });
  }

  function openModal(email) {
    modal.hidden = false;
    var yes = document.getElementById('pfYes'), no = document.getElementById('pfNo'), msg = document.getElementById('pfMsub');
    function close() { modal.hidden = true; document.removeEventListener('keydown', esc); }
    function esc(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', esc);
    no.onclick = close;
    yes.onclick = function () {
      yes.disabled = true; no.disabled = true; yes.textContent = 'Signing you up…';
      post('/api/subscribe', { email: email, hp: '', source: cfg.source }).then(function (j) {
        if (j && (j.ok || j.queued)) {
          msg.textContent = 'Check your inbox and click the link to confirm.';
          yes.hidden = true; no.disabled = false; no.textContent = 'Close';
        } else {
          msg.textContent = 'That did not work this time. You can sign up later from any page.';
          yes.hidden = true; no.disabled = false; no.textContent = 'Close';
        }
      });
    };
    setTimeout(function () { yes.focus(); }, 30);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var problem = check(i);
    if (problem) { err.textContent = problem; inputs[i].focus(); return; }
    if (i < steps.length - 1) show(i + 1); else send();
  });
  back.addEventListener('click', function () { if (i > 0 && !busy) show(i - 1); });
  show(0);
})();
