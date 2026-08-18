(function () {
  'use strict';
  var SYS = '#878B78', OUT = '#E9ECDB', ACC = '#C8F032', ERR = '#FF6B57', DIM = '#565B4B';
  var TO = 'signal@aeoess.com';
  var STEPS = [
    { key: 'name', label: 'name', q: 'Who are we talking to?', ph: 'Ada Lovelace' },
    { key: 'email', label: 'email', q: 'Where should the reply land?', ph: 'you@company.com' },
    { key: 'org', label: 'org', q: 'Company or project? (Enter to skip)', ph: 'optional' },
    { key: 'topic', label: 'topic', q: 'What is this about? Type 1-4.', ph: '1', options: ['Integrate APS', 'Contribute to the spec', 'Research collaboration', 'Something else'] },
    { key: 'message', label: 'message', q: 'What do you want to achieve?', ph: 'One or two sentences is plenty.' }
  ];

  var log, input, promptEl, progressEl, soundBtn;
  var st = { step: -1, answers: {}, phase: 'boot', sound: false, timers: [] };
  var ac = null;

  function el(id) { return document.getElementById(id); }
  function later(fn, ms) { st.timers.push(setTimeout(fn, ms)); }
  function clearTimers() { st.timers.forEach(clearTimeout); st.timers = []; }

  function push(text, color) {
    var d = document.createElement('div');
    d.style.cssText = 'white-space:pre-wrap;word-break:break-word;color:' + (color || OUT);
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }
  function beep(f) {
    if (!st.sound) return;
    try {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      ac = ac || new C();
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'square'; o.frequency.value = f || 660; g.gain.value = 0.02;
      o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.04);
    } catch (e) {}
  }
  function render() {
    var s = STEPS[st.step];
    var prompt = 'aps:~$', ph = '';
    if (st.phase === 'ask' && s) { prompt = s.label + ' \u25B8'; ph = s.ph; }
    if (st.phase === 'confirm') { prompt = 'send? \u25B8'; ph = 'y'; }
    if (st.phase === 'sending') prompt = 'hashing\u2026';
    promptEl.textContent = prompt;
    input.placeholder = ph;
    var n = Math.min(Math.max(st.step + 1, 1), STEPS.length);
    progressEl.textContent = st.phase === 'sent' ? 'done' : (String(n).length < 2 ? '0' + n : String(n)) + ' / 0' + STEPS.length;
    soundBtn.textContent = st.sound ? '[\u266A on]' : '[\u266A off]';
  }
  function ask(i) {
    var s = STEPS[i];
    push(s.q, SYS);
    if (s.options) s.options.forEach(function (o, k) { push('  ' + (k + 1) + ') ' + o, DIM); });
    st.step = i; input.value = ''; render();
  }
  function fail(msg) { push('  \u2715 ' + msg, ERR); input.value = ''; }
  function accept(s, value) {
    st.answers[s.key] = value;
    push('> ' + value, OUT); push('', SYS);
    input.value = '';
    var next = st.step + 1;
    if (next < STEPS.length) return ask(next);
    review();
  }
  function review() {
    var a = st.answers;
    push('Ready to hand off to your mail client:', SYS);
    push('  to       ' + TO, OUT);
    push('  name     ' + a.name, OUT);
    push('  email    ' + a.email, OUT);
    push('  org      ' + a.org, OUT);
    push('  topic    ' + a.topic, OUT);
    push('  message  ' + a.message, OUT);
    push('', SYS);
    push('Open it in your mail client? y / n', ACC);
    st.phase = 'confirm'; st.step = STEPS.length; render();
  }
  function canonical(obj) {
    // Deterministic serialization: sorted keys, no whitespace (RFC 8785 subset for flat string maps).
    var keys = Object.keys(obj).sort();
    return '{' + keys.map(function (k) { return JSON.stringify(k) + ':' + JSON.stringify(obj[k]); }).join(',') + '}';
  }
  function sha256Hex(str) {
    if (!(window.crypto && window.crypto.subtle && window.TextEncoder)) return Promise.resolve(null);
    return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }
  function confirm(v) {
    var k = (v || '').toLowerCase();
    if (k === 'n' || k === 'no') {
      push('> n', OUT); push('Scrapped. Starting over.', SYS); push('', SYS);
      st.answers = {}; st.phase = 'ask'; input.value = ''; ask(0); return;
    }
    if (k !== 'y' && k !== 'yes') return fail('y or n.');
    push('> y', OUT); push('', SYS); beep(880);
    st.phase = 'sending'; input.value = ''; render();
    var a = st.answers;
    var ts = new Date().toISOString();
    var payload = { name: a.name, reply_to: a.email, org: a.org, topic: a.topic, message: a.message, submitted_at: ts, to: TO };
    var canon = canonical(payload);
    sha256Hex(canon).then(function (hash) {
      var body = 'Name: ' + a.name + '\nEmail: ' + a.email + '\nOrg: ' + a.org + '\nTopic: ' + a.topic + '\n\n' + a.message + '\n\n--\nsubmitted_at: ' + ts + (hash ? '\ncontent_sha256: ' + hash : '');
      var subject = '[APS contact] ' + a.topic + ' \u00B7 ' + a.name;
      var href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var rec = [
        '\u2713 HANDED TO YOUR MAIL CLIENT: receipt of what you sent',
        '{',
        '  "record_type": "aps:contact:v1",',
        '  "submitted_at": "' + ts + '",',
        '  "principal": ' + JSON.stringify(a.name) + ',',
        '  "reply_to": ' + JSON.stringify(a.email) + ',',
        '  "topic": ' + JSON.stringify(a.topic) + ',',
        '  "content_sha256": ' + JSON.stringify(hash || 'unavailable in this browser') + ',',
        '  "asserts": "these fields are what this page handed to your mail client",',
        '  "does_not_assert": ["that the message was delivered", "that a reply has been sent"],',
        '  "signature": "none. This page holds no key, so it signs nothing. The hash lets you check the message you send matches this record."',
        '}'
      ];
      rec.forEach(function (t, i) { later(function () { push(t, i === 0 ? ACC : OUT); }, 110 * (i + 1)); });
      later(function () {
        push('', SYS);
        push('If nothing opened, mail ' + TO + ' directly. A human reads it.', SYS);
        push('Press Enter to file another.', DIM);
        st.phase = 'sent'; input.value = ''; render();
        window.location.href = href;
      }, 110 * (rec.length + 1));
    });
  }
  function restart() {
    log.textContent = ''; st.answers = {}; st.phase = 'ask'; input.value = ''; ask(0);
  }
  function onKey(e) {
    if (e.key === 'Escape') return;
    if (e.key !== 'Enter') { beep(760); return; }
    e.preventDefault(); beep(520);
    var v = (input.value || '').trim();
    if (st.phase === 'confirm') return confirm(v);
    if (st.phase === 'sent') return restart();
    if (st.phase !== 'ask') return;
    var s = STEPS[st.step]; if (!s) return;
    if (s.key === 'topic') {
      var n = parseInt(v, 10);
      if (!(n >= 1 && n <= s.options.length)) return fail('Type a number from 1 to ' + s.options.length + '.');
      return accept(s, s.options[n - 1]);
    }
    if (s.key === 'org') return accept(s, v || '(none)');
    if (!v) return fail('This one is required.');
    if (s.key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return fail('That address does not parse.');
    if (s.key === 'message' && v.length < 8) return fail('A little more context, please.');
    return accept(s, v);
  }

  document.addEventListener('DOMContentLoaded', function () {
    log = el('termLog'); input = el('termInput'); promptEl = el('termPrompt'); progressEl = el('termProgress'); soundBtn = el('termSound');
    if (!log || !input) return;
    render();
    var boot = [
      ['aps contact-form v1 \u00B7 booting\u2026', SYS],
      ['transport: your own mail client \u00B7 this page stores nothing and sends nothing itself', DIM],
      ['receipt: content hash only \u00B7 no key on this page, so no signature', DIM],
      ['', SYS],
      ['Five prompts. Answer, press Enter, done.', OUT],
      ['', SYS]
    ];
    boot.forEach(function (l, i) { later(function () { push(l[0], l[1]); }, 220 * (i + 1)); });
    later(function () { st.phase = 'ask'; ask(0); input.focus(); }, 220 * (boot.length + 1));
    log.addEventListener('click', function () { input.focus(); });
    input.addEventListener('keydown', onKey);
    soundBtn.addEventListener('click', function () { st.sound = !st.sound; render(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') window.location.href = '/'; });
    window.addEventListener('beforeunload', clearTimers);
  });
})();
