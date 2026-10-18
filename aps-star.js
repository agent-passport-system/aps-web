/* aps-star.js: "Star APS" prompt with a second step for email updates.
   No third-party code, no tracking. State lives in localStorage under aps_star_v1.
   On a desktop first visit the prompt opens once by itself, after the visitor has stayed 30 seconds
   or moved past the first scenes. Closing it shrinks it into the corner mascot, which opens a guided
   chat. On phones the prompt never opens by itself and the mascot appears only after 40 seconds or
   the same scroll signal.
   Skip closes the dialog. The email step follows only a click on the star button. */
(function () {
  'use strict';
  var REPO = 'https://github.com/agent-passport-system/agent-passport-system';
  var API = '/api/subscribe';
  var IMG = '/assets/star-aps.webp?v=1';
  var IMG_FALLBACK = '/assets/star-aps.jpg?v=1';
  var KEY = 'aps_star_v1';
  var DAY = 86400000;

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  var st = load();
  var now = Date.now();
  // The pill stays available once the prompt has been closed; no hide state.
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = '' +
  '.apsx-ov{position:fixed;inset:0;background:var(--x-ovl);z-index:9990;display:flex;align-items:center;justify-content:center;padding:18px;opacity:0;transition:opacity .25s}' +
  '.apsx-ov.on{opacity:1}' +
  '.apsx-dlg{position:relative;width:min(760px,100%);max-height:calc(100vh - 36px);overflow:auto;background:var(--x-bg);color:var(--x-fg);border:1px solid var(--x-line);border-radius:6px;display:grid;grid-template-columns:minmax(260px,42%) 1fr;align-items:center;box-shadow:0 30px 80px var(--x-shadow);transform:translateY(12px);transition:transform .25s}' +
  '.apsx-ov.on .apsx-dlg{transform:none}' +
  '.apsx-img{display:block;width:100%;height:auto;aspect-ratio:1/1;object-fit:contain;background:var(--x-img);align-self:center}' +
  '.apsx-body{padding:30px 30px 26px;display:flex;flex-direction:column;gap:14px;font-family:Archivo,system-ui,sans-serif;position:relative}' +
  '.apsx-eyebrow{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--x-sub);display:flex;align-items:center;gap:10px}' +
  '.apsx-eyebrow i{width:8px;height:8px;background:var(--x-acc);display:inline-block}' +
  '.apsx-h{margin:0;font-family:Anton,Archivo,sans-serif;font-weight:400;font-size:36px;line-height:1.08;color:var(--x-white)}' +
  '.apsx-h em{font-style:normal;display:inline-block;line-height:.9;padding:.04em .12em;background:var(--x-acc);color:var(--x-on-acc);vertical-align:baseline}' +
  '.apsx-p{margin:0;font-size:16px;line-height:1.55;color:var(--x-sub)}' +
  '.apsx-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:6px}' +
  '.apsx-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 18px;border-radius:3px;font:600 15px/1 Archivo,system-ui,sans-serif;text-decoration:none;cursor:pointer;border:1px solid var(--x-line);color:var(--x-fg);background:transparent}' +
  '.apsx-btn.pri{background:var(--x-acc);color:var(--x-on-acc);border-color:var(--x-acc)}' +
  '.apsx-btn.pri:hover{background:var(--x-acc2)}' +
  '.apsx-btn:hover{border-color:var(--x-acc);color:var(--x-fg)}' +
  '.apsx-link{background:none;border:0;padding:8px 6px;color:var(--x-sub);font:500 14px Archivo,system-ui,sans-serif;cursor:pointer;text-decoration:underline}' +
  '.apsx-x{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;border:1px solid var(--x-line);background:var(--x-bg);color:var(--x-fg);font-size:18px;line-height:1;cursor:pointer}' +
  '.apsx-x:hover{border-color:var(--x-acc)}' +
  '.apsx-form{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}' +
  '.apsx-in{flex:1;min-width:200px;padding:12px 14px;border-radius:3px;border:1px solid var(--x-line);background:var(--x-img);color:var(--x-fg);font:15px Archivo,system-ui,sans-serif;outline:none}' +
  '.apsx-in:focus{border-color:var(--x-acc)}' +
  '.apsx-note{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11.5px;line-height:1.6;color:var(--x-note)}' +
  '.apsx-msg{font-size:15px;line-height:1.5;color:var(--x-acc);min-height:1.5em}' +
  '.apsx-msg.err{color:var(--x-err)}' +
  '.apsx-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}' +
  '.apsx-pill{position:fixed;right:16px;bottom:16px;z-index:9980;display:flex;align-items:center;gap:10px;padding:6px 10px 6px 6px;border-radius:999px;background:var(--x-bg);color:var(--x-fg);border:1px solid var(--x-line);box-shadow:0 10px 30px var(--shadow);font:600 13px Archivo,system-ui,sans-serif;cursor:pointer;transition:transform .2s}' +
  '.apsx-pill:hover{transform:translateY(-2px);border-color:var(--x-acc)}' +
  '.apsx-pill img{width:36px;height:36px;border-radius:50%;object-fit:cover;display:block}' +
  '.apsx-pill b{color:var(--x-acc);font-weight:700}' +
  '.apsx-pill .apsx-px{margin-left:4px;width:24px;height:24px;border-radius:50%;border:1px solid var(--x-line);background:transparent;color:var(--x-sub);font-size:13px;line-height:1;cursor:pointer}' +
  '.apsx-pill .apsx-px:hover{color:var(--x-fg);border-color:var(--x-acc)}' +
  '@media (max-width:720px){.apsx-dlg{grid-template-columns:1fr;max-height:calc(100vh - 24px);align-items:start}.apsx-img{width:100%;max-width:100%;height:auto}.apsx-body{padding:22px 20px 20px}.apsx-h{font-size:32px}.apsx-pill{right:12px;bottom:12px}.apsx-pill span.t{display:none}}' +
  '.apsm{position:fixed;right:14px;bottom:10px;z-index:9980;width:118px;height:182px;cursor:pointer;background:none;border:0;padding:0;-webkit-tap-highlight-color:transparent}' +
  '.apsm:focus-visible{outline:3px solid var(--x-acc);outline-offset:4px;border-radius:12px}' +
  '.apsm video,.apsm img.apsm-still{display:block;position:relative;z-index:1;width:118px;height:182px;object-fit:contain;transition:transform .2s}' +
  '.apsm:before{content:"";position:absolute;left:18%;right:18%;bottom:2px;height:10px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.22),rgba(0,0,0,0));pointer-events:none}' +
  '.apsm:hover video,.apsm:hover img.apsm-still{transform:translateY(-3px)}' +
  '.apsm-x{position:absolute;top:2px;right:-2px;width:22px;height:22px;border-radius:50%;border:1px solid rgba(19,32,63,.25);background:#fff;color:#13203F;font:13px/1 Archivo,system-ui,sans-serif;cursor:pointer;opacity:0;transition:opacity .2s}' +
  '.apsm:hover .apsm-x,.apsm:focus-within .apsm-x{opacity:1}' +
  '.apsm-b{position:absolute;z-index:2;right:104px;max-width:190px;width:max-content;padding:9px 13px;background:#FFFDF6;color:#0A0A0A;border:2.5px solid #0A0A0A;border-radius:16px 14px 17px 13px;font:700 14px/1.3 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Archivo,sans-serif;text-align:left;box-shadow:4px 4px 0 #0A0A0A;opacity:0;transform:translateY(6px) scale(.96);transform-origin:100% 100%;transition:opacity .22s,transform .22s;pointer-events:none}' +
  '.apsm-b.on{opacity:1;transform:none}' +
  '.apsm-b:after{content:"";position:absolute;right:-9px;bottom:12px;width:14px;height:14px;background:inherit;border-right:2.5px solid #0A0A0A;border-bottom:2.5px solid #0A0A0A;transform:rotate(-45deg) skew(8deg,8deg)}' +
  '.apsm-b.star{top:84px;background:#C7FF00}' +
  '.apsm-b.cat{background:#FF2AA8;top:auto;bottom:calc(100% - 6px);right:-4px;transform-origin:85% 100%;border-radius:16px 19px 15px 18px}' +
  '.apsm-b.cat:after{right:auto;left:auto;right:30px;bottom:-9px;transform:rotate(45deg) skew(8deg,8deg)}' +
  '.apsm-b .who{display:table;font:600 10px/1 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#FFFDF6;background:#0A0A0A;padding:2px 5px;border-radius:3px;margin-bottom:5px}' +
  '.apsm-e{position:absolute;z-index:3;font:800 22px/1 Archivo,system-ui,sans-serif;color:#FFC400;-webkit-text-stroke:1.5px #13203F;opacity:0;pointer-events:none}' +
  '.apsm-e.on{animation:apsmPop 1.4s ease-out forwards}' +
  '.apsm.apsm-pop{animation:apsmIn .35s cubic-bezier(.2,1.4,.5,1)}' +
  '@keyframes apsmIn{0%{opacity:0;transform:scale(.3)}100%{opacity:1;transform:none}}' +
  '.apsm-e.cat{top:22px;right:-4px}' +
  '.apsm-e.star{top:58px;right:76px}' +
  '@keyframes apsmPop{0%{opacity:0;transform:translateY(6px) scale(.6)}20%{opacity:1;transform:translateY(0) scale(1.1)}70%{opacity:1;transform:translateY(-4px) scale(1)}100%{opacity:0;transform:translateY(-10px) scale(1)}}' +
  '@media (max-width:720px){.apsm{right:8px;bottom:6px;width:88px;height:136px}.apsm video,.apsm img.apsm-still{width:88px;height:136px}.apsm-b{right:80px;max-width:160px;font-size:13px}.apsm-b.star{top:62px}.apsm-b.cat{right:-2px}.apsm-e.star{top:38px;right:58px}.apsm-e.cat{top:12px;right:-6px}}' +
  '@media (prefers-reduced-motion:reduce){.apsm-b,.apsm video,.apsm img.apsm-still{transition:none}.apsm-e{display:none}}' +
  '@media (prefers-reduced-motion:reduce){.apsx-ov,.apsx-dlg,.apsx-pill{transition:none}}';

  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  var ov, dlg, body, pill, step = 1, lastFocus = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function picture() {
    return '<picture><source srcset="' + IMG + '" type="image/webp"><img class="apsx-img" src="' + IMG_FALLBACK + '" alt="Be a legend. Star APS. One star for you, eternal respect. Small click, big impact." width="640" height="640" loading="lazy"></picture>';
  }

  function render() {
    if (!body) return;
    if (step === 1) {
      body.innerHTML =
        '<div class="apsx-eyebrow"><i></i>Open protocol · Apache 2.0</div>' +
        '<h2 class="apsx-h">Be a legend. <em>Star APS.</em></h2>' +
        '<p class="apsx-p">One star helps the protocol get found by the next person who needs it. Small click. Big impact.</p>' +
        '<div class="apsx-row"><a class="apsx-btn pri" id="apsxStar" href="' + REPO + '" target="_blank" rel="noopener">&#9733; Star on GitHub &#8599;</a><a class="apsx-link" href="/contact.html">Ask about a pilot</a><button class="apsx-link" id="apsxSkip" type="button">Skip for now</button></div>' +
        '<div class="apsx-note">github.com/agent-passport-system/agent-passport-system</div>';
      var star = body.querySelector('#apsxStar');
      // After the star, ask for email only if this browser has not subscribed yet.
      star.addEventListener('click', function () { st.starred = Date.now(); save(st); setTimeout(function () { if (st.subscribed) { minimize(); } else { step = 2; render(); } }, 250); });
      body.querySelector('#apsxSkip').addEventListener('click', minimize);
      setTimeout(function () { star.focus(); }, 30);
    } else if (step === 2) {
      body.innerHTML =
        '<div class="apsx-eyebrow"><i></i>Updates</div>' +
        '<h2 class="apsx-h">' + (st.starred ? 'Thank you. ' : '') + 'Get updates <em>by email.</em></h2>' +
        '<p class="apsx-p">Releases, spec changes, and dev log highlights. A few emails a month at most.</p>' +
        '<form class="apsx-form" id="apsxForm" novalidate>' +
        '<input class="apsx-in" id="apsxEmail" type="email" name="email" placeholder="you@company.com" autocomplete="email" inputmode="email" required aria-label="Email address">' +
        '<input class="apsx-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<button class="apsx-btn pri" id="apsxSend" type="submit">Send confirmation</button>' +
        '</form>' +
        '<div class="apsx-msg" id="apsxMsg" aria-live="polite"></div>' +
        '<div class="apsx-note">Double opt-in: nothing is stored until you confirm from your inbox. One-click unsubscribe in every email. Address goes to our mail provider only, never shared.</div>' +
        '<div class="apsx-row"><button class="apsx-link" id="apsxNo" type="button">No thanks</button></div>';
      var form = body.querySelector('#apsxForm'), inp = body.querySelector('#apsxEmail'), msg = body.querySelector('#apsxMsg'), btn = body.querySelector('#apsxSend');
      body.querySelector('#apsxNo').addEventListener('click', minimize);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = (inp.value || '').trim();
        var hp = form.querySelector('[name=website]').value;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { msg.className = 'apsx-msg err'; msg.textContent = 'That address does not parse.'; inp.focus(); return; }
        btn.disabled = true; btn.textContent = 'Sending…'; msg.className = 'apsx-msg'; msg.textContent = '';
        fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, hp: hp, source: 'star-popup' }) })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, j: j }; }); })
          .then(function (res) {
            if (res.j && res.j.ok) { st.subscribed = Date.now(); save(st); step = 3; render(); return; }
            var why = (res.j && res.j.error) || res.status;
            msg.className = 'apsx-msg err';
            msg.textContent = why === 'rate' ? 'Too many tries from this network. Try again in an hour.' : why === 'email' ? 'That address does not parse.' : 'Could not send right now. Mail signal@aeoess.com and a human adds you.';
            btn.disabled = false; btn.textContent = 'Send confirmation';
          })
          .catch(function () { msg.className = 'apsx-msg err'; msg.textContent = 'Network problem. Try again, or mail signal@aeoess.com.'; btn.disabled = false; btn.textContent = 'Send confirmation'; });
      });
      setTimeout(function () { inp.focus(); }, 30);
    } else {
      body.innerHTML =
        '<div class="apsx-eyebrow"><i></i>One more step</div>' +
        '<h2 class="apsx-h">Check your <em>inbox.</em></h2>' +
        '<p class="apsx-p">We sent a confirmation link. Nothing is stored until you open it. The link is valid for 48 hours.</p>' +
        '<div class="apsx-row"><button class="apsx-btn pri" id="apsxDone" type="button">Done</button></div>';
      var done = body.querySelector('#apsxDone');
      done.addEventListener('click', minimize);
      setTimeout(function () { done.focus(); }, 30);
    }
  }

  function open(fromPill) {
    if (ov) return;
    lastFocus = document.activeElement;
    ov = document.createElement('div'); ov.className = 'apsx-ov';
    ov.innerHTML = '<div class="apsx-dlg" role="dialog" aria-modal="true" aria-labelledby="apsxTitle">' + picture() + '<div class="apsx-body"></div><button class="apsx-x" type="button" aria-label="Close">&#215;</button></div>';
    dlg = ov.querySelector('.apsx-dlg'); body = ov.querySelector('.apsx-body');
    ov.querySelector('.apsx-x').addEventListener('click', minimize);
    ov.addEventListener('click', function (e) { if (e.target === ov) minimize(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(ov);
    if (pill) { pill.style.display = 'none'; clearTimers(); if (vid) try { vid.pause(); } catch (e) {} }
    // The star ask always comes first, whatever happened on earlier visits.
    step = 1;
    render();
    requestAnimationFrame(function () { ov.classList.add('on'); });
    st.seenAt = Date.now(); save(st);
  }
  function onKey(e) { if (e.key === 'Escape') minimize(); }
  function closeDialog() {
    if (!ov) return;
    document.removeEventListener('keydown', onKey);
    var o = ov; ov = null; dlg = null; body = null;
    o.classList.remove('on');
    setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, reduce ? 0 : 220);
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
  }
  function minimize() {
    st.minimizedAt = Date.now(); save(st);
    var d = dlg, o = ov;
    if (d && o && !reduce) {
      // The dialog shrinks toward the corner, and the mascot appears where it lands.
      var r = d.getBoundingClientRect();
      var tx = (window.innerWidth - 73) - (r.left + r.width / 2), ty = (window.innerHeight - 101) - (r.top + r.height / 2);
      d.style.transition = 'transform .45s cubic-bezier(.55,0,.8,.2), opacity .45s';
      d.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(.1)';
      d.style.opacity = '0';
      o.style.transition = 'background .45s'; o.style.background = 'transparent';
      setTimeout(function () { closeDialog(); showPill(true); }, 430);
      return;
    }
    closeDialog();
    showPill();
  }
  // The corner mascot: the cat with the star, a silent transparent loop, and a short scripted
  // exchange in speech bubbles built in HTML so the lines stay editable. Click opens the dialog.
  var M = '/assets/mascot/aps-mascot';
  var MV = '?v=3';
  var SCRIPT = [
    ['star', 'Hey! Wanna talk?', '!'],
    ['cat', 'What?', '?'],
    ['star', 'With them!', ''],
    ['cat', 'Yeah, go ahead.', ''],
    ['star', 'Hey, you! Click me!', '!']
  ];
  var LATER = [
    ['star', 'Need something explained?', '?'],
    ['cat', 'Give us a star.', '★'],
    ['star', 'We’re open source on GitHub!', '★'],
    ['cat', 'Running agents? Ask about a pilot.', '!']
  ];
  var timers = [], laterIdx = 0, vid = null, firstRun = true;
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function isSafari() { var ua = navigator.userAgent; return /safari/i.test(ua) && !/chrome|chromium|crios|android|edg/i.test(ua); }

  function say(who, text, sign) {
    if (!pill || !document.body.contains(pill)) return;
    var b = pill.querySelector('.apsm-b');
    b.className = 'apsm-b ' + who;
    b.innerHTML = '<span class="who">' + (who === 'cat' ? 'Cat' : 'Star') + '</span>' + esc(text);
    requestAnimationFrame(function () { b.classList.add('on'); });
    if (sign && !reduce) {
      var e = pill.querySelector('.apsm-e');
      e.textContent = sign;
      e.className = 'apsm-e ' + who; void e.offsetWidth; e.classList.add('on');
    }
    later(function () { b.classList.remove('on'); }, 2600);
  }

  function play(lines, gap, then) {
    lines.forEach(function (l, i) { later(function () { say(l[0], l[1], l[2]); }, i * gap); });
    if (then) later(then, lines.length * gap);
  }

  // Engagement gate. Nothing asks for attention until the visitor has spent ENGAGE_MS with the tab
  // visible, or has moved past the first two scenes of the homepage and stayed a few seconds.
  // People who bounce in the first seconds never see the popup or hear the mascot.
  var MOBILE = !!(window.matchMedia && window.matchMedia('(max-width:720px)').matches);
  var ENGAGE_MS = MOBILE ? 40000 : 30000;
  var engaged = false, engageWaiters = [], engageStarted = false;
  function onEngaged(fn) { if (engaged) { fn(); return; } engageWaiters.push(fn); startEngagement(); }
  function markEngaged() { if (engaged) return; engaged = true; var w = engageWaiters; engageWaiters = []; w.forEach(function (f) { try { f(); } catch (e) {} }); }
  function startEngagement() {
    if (engageStarted) return; engageStarted = true;
    var active = 0, last = Date.now();
    var iv = setInterval(function () {
      var now = Date.now(); if (!document.hidden) active += now - last; last = now;
      if (active >= ENGAGE_MS) { clearInterval(iv); markEngaged(); }
    }, 1000);
    var deep = document.getElementById('scene-2');
    var dwell = MOBILE ? 8000 : 4000;
    if (deep && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); setTimeout(markEngaged, dwell); }
      }, { threshold: 0.4 });
      io.observe(deep);
    } else {
      window.addEventListener('scroll', function sc() {
        if (window.scrollY > window.innerHeight * 1.5) { window.removeEventListener('scroll', sc); setTimeout(markEngaged, dwell); }
      }, { passive: true });
    }
  }

  function schedule() {
    // One exchange once the visitor is engaged, then a single line now and then. Never more than every 45 seconds.
    clearTimers();
    if (reduce) { later(function () { say('star', 'Hey! Wanna talk?', ''); }, 2500); return; }
    var lines = firstRun ? (MOBILE ? [SCRIPT[0], SCRIPT[4]] : SCRIPT) : []; firstRun = false;
    var gap = MOBILE ? 90000 : 45000;
    onEngaged(function () { later(function () {
      play(lines, 3200, function () {
        (function next() {
          later(function () {
            if (document.hidden) { next(); return; }
            say.apply(null, LATER[laterIdx++ % LATER.length]);
            next();
          }, gap + Math.random() * 30000);
        })();
      });
    }, 1500); });
  }

  function showPill(pop) {
    if (pill) { if (pop) { pill.classList.remove('apsm-pop'); void pill.offsetWidth; pill.classList.add('apsm-pop'); } pill.style.display = 'block'; if (vid) try { vid.play(); } catch (e) {} schedule(); return; }
    pill = document.createElement('div');
    pill.className = 'apsm'; pill.setAttribute('role', 'button'); pill.setAttribute('tabindex', '0');
    pill.setAttribute('aria-label', 'Talk to us: star APS, ask a question or ask about a pilot');
    var media;
    if (reduce) {
      media = '<img class="apsm-still" src="' + M + '.webp' + MV + '" alt="" width="118" height="182">';
    } else {
      media = '<video muted loop playsinline autoplay preload="auto" poster="' + M + '.png' + MV + '" aria-hidden="true" width="118" height="182">' +
        (isSafari() ? '<source src="' + M + '.mov' + MV + '" type=\'video/quicktime; codecs="hvc1"\'>' : '<source src="' + M + '.webm' + MV + '" type="video/webm">') +
        '</video>';
    }
    pill.innerHTML = '<div class="apsm-b" aria-live="polite"></div><span class="apsm-e" aria-hidden="true"></span>' + media +
      '<button class="apsm-x" type="button" aria-label="Hide until next visit">&#215;</button>';
    vid = pill.querySelector('video');
    pill.addEventListener('click', function (e) {
      if (e.target.closest('.apsm-x')) { try { sessionStorage.setItem('aps_star_pill_hidden', '1'); } catch (x) {} clearTimers(); pill.remove(); pill = null; return; }
      clearTimers(); openChat();
    });
    pill.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clearTimers(); openChat(); } });
    document.addEventListener('visibilitychange', function () { if (!vid) return; if (document.hidden) vid.pause(); else try { vid.play(); } catch (x) {} });
    if (pop) pill.classList.add('apsm-pop');
    document.body.appendChild(pill);
    // The homepage has fixed previous and next buttons in the bottom right corner. Sit above them.
    var bn = document.querySelector('.bottom-nav');
    function lift() { if (!pill || !bn) return; var r = bn.getBoundingClientRect(); var h = window.innerHeight - r.top; pill.style.bottom = (h > 0 && h < 200 ? h + 4 : 10) + 'px'; }
    if (bn) { lift(); window.addEventListener('resize', lift); }
    schedule();
  }

  // ---------------------------------------------------------------------------
  // The chat the mascot opens. A guided conversation, no AI model behind it yet:
  // it answers what APS is from approved copy, takes a free pilot request or a
  // message, sends both through /api/contact, offers email updates through
  // /api/subscribe, and asks for a GitHub star. A free question is passed on to
  // a person by email, and the chat says so.
  var chat = null, chatLog = null, chatIn = null, chatForm = null, chips = null;
  var flow = null, data = {}, askedStar = false;
  var CONTACT = '/api/contact';
  // Palette from the Mingle page: cream paper, ink black, lime and hot pink, hard offset shadows.
  var INK = '#0A0A0A', PAPER = '#FFFDF6', LIME = '#C7FF00', PINK = '#FF2AA8';
  var chatCss = '' +
  '.apsc{position:fixed;right:14px;bottom:200px;z-index:9985;width:min(370px,calc(100vw - 24px));height:min(540px,calc(100vh - 230px));min-height:320px;display:flex;flex-direction:column;background:' + PAPER + ';color:' + INK + ';border:2.5px solid ' + INK + ';border-radius:16px;box-shadow:7px 7px 0 ' + INK + ';font:500 15px/1.45 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Archivo,sans-serif;opacity:0;transform:translateY(16px) rotate(.6deg) scale(.97);transform-origin:100% 100%;transition:opacity .22s,transform .25s cubic-bezier(.2,1.3,.5,1);overflow:hidden}' +
  '.apsc.on{opacity:1;transform:none}' +
  '.apsc-h{position:relative;display:flex;align-items:center;gap:10px;padding:10px 12px;background:' + LIME + ';border-bottom:2.5px solid ' + INK + '}' +
  '.apsc-h img{width:36px;height:54px;object-fit:contain;filter:drop-shadow(2px 2px 0 rgba(10,10,10,.25))}' +
  '.apsc-h b{display:block;font:900 22px/1 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Archivo,sans-serif;letter-spacing:-.02em;text-transform:uppercase}' +
  '.apsc-h small{display:inline-block;margin-top:5px;padding:2px 7px;background:' + PINK + ';color:' + INK + ';border:1.5px solid ' + INK + ';border-radius:4px;font:700 10.5px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.06em;transform:rotate(-2deg)}' +
  '.apsc-x{margin-left:auto;width:32px;height:32px;border-radius:50%;border:2px solid ' + INK + ';background:' + PAPER + ';color:' + INK + ';font:700 16px/1 ui-sans-serif,sans-serif;cursor:pointer;box-shadow:2px 2px 0 ' + INK + '}' +
  '.apsc-x:hover{background:' + INK + ';color:' + LIME + '}' +
  '.apsc-log{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:10px}' +
  '.apsc-m{max-width:86%;padding:9px 12px;border:2px solid ' + INK + ';border-radius:14px;white-space:pre-wrap;word-break:break-word;box-shadow:3px 3px 0 ' + INK + '}' +
  '.apsc-m .who{display:table;font:800 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;margin-bottom:5px;padding:2px 5px;border-radius:3px;background:' + INK + ';color:' + PAPER + '}' +
  '.apsc-m.star{align-self:flex-start;background:' + LIME + ';border-bottom-left-radius:3px;transform:rotate(-.4deg)}' +
  '.apsc-m.cat{align-self:flex-start;background:' + PINK + ';color:' + INK + ';border-bottom-left-radius:3px;transform:rotate(.4deg)}' +
  '.apsc-m.me{align-self:flex-end;background:' + INK + ';color:' + PAPER + ';border-bottom-right-radius:3px;box-shadow:3px 3px 0 ' + PINK + '}' +
  '.apsc-m a{color:inherit;font-weight:800}' +
  '.apsc-chips{display:flex;flex-wrap:wrap;gap:7px;padding:2px 12px 10px}' +
  '.apsc-chip{border:2px solid ' + INK + ';background:' + PAPER + ';color:' + INK + ';border-radius:999px;padding:7px 12px;font:700 13px/1 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer;text-decoration:none;box-shadow:2px 2px 0 ' + INK + ';transition:transform .12s,box-shadow .12s,background .12s}' +
  '.apsc-chip:hover{background:' + LIME + ';transform:translate(-1px,-1px);box-shadow:3px 3px 0 ' + INK + '}' +
  '.apsc-chip:active{transform:translate(2px,2px);box-shadow:0 0 0 ' + INK + '}' +
  '.apsc-chip.gh{background:' + INK + ';color:' + LIME + '}.apsc-chip.gh:hover{background:' + PINK + ';color:' + INK + '}' +
  '.apsc a.apsc-chip,.apsc a.apsc-chip:hover,.apsc a.apsc-chip:visited{color:' + INK + ' !important;text-decoration:none !important}' +
  '.apsc a.apsc-chip.gh,.apsc a.apsc-chip.gh:visited{color:' + LIME + ' !important}.apsc a.apsc-chip.gh:hover{color:' + INK + ' !important}' +
  '.apsc-f{display:flex;gap:7px;padding:10px 12px;border-top:2.5px solid ' + INK + ';background:#fff}' +
  '.apsc-f input{flex:1;min-width:0;padding:10px 12px;border:2px solid ' + INK + ';border-radius:10px;background:' + PAPER + ';font:500 15px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:' + INK + ';outline:none}' +
  '.apsc-f input:focus{box-shadow:0 0 0 3px ' + LIME + '}' +
  '.apsc-f button{padding:0 15px;border:2px solid ' + INK + ';border-radius:10px;background:' + PINK + ';color:' + INK + ';font:800 14px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer;box-shadow:2px 2px 0 ' + INK + '}' +
  '.apsc-f button:hover{background:' + LIME + '}' +
  '.apsc-note{padding:0 12px 9px;background:#fff;font:500 11.5px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;color:#555}' +
  '@media (max-width:720px){.apsc{right:8px;bottom:150px;height:min(480px,calc(100vh - 170px))}}' +
  '@media (prefers-reduced-motion:reduce){.apsc,.apsc-chip{transition:none}.apsc-m{transform:none}}';
  var chatStyle = document.createElement('style'); chatStyle.textContent = chatCss; document.head.appendChild(chatStyle);

  function cMsg(who, html) {
    var d = document.createElement('div');
    d.className = 'apsc-m ' + who;
    d.innerHTML = (who === 'me' ? '' : '<span class="who">' + (who === 'cat' ? 'Cat' : 'Star') + '</span>') + html;
    chatLog.appendChild(d); chatLog.scrollTop = chatLog.scrollHeight;
  }
  function cSay(lines, then) {
    // lines: [[who, html], ...] shown one by one so it reads like a conversation
    var i = 0;
    (function next() {
      if (!chat) return;
      if (i >= lines.length) { if (then) then(); return; }
      cMsg(lines[i][0], lines[i][1]); i++;
      setTimeout(next, reduce ? 0 : 450);
    })();
  }
  function cChips(list) {
    chips.innerHTML = '';
    list.forEach(function (c) {
      var b;
      if (c.href) { b = document.createElement('a'); b.href = c.href; b.target = '_blank'; b.rel = 'noopener'; }
      else { b = document.createElement('button'); b.type = 'button'; }
      b.className = 'apsc-chip' + (c.gh ? ' gh' : '');
      b.textContent = c.label;
      b.addEventListener('click', function () { if (!c.href) cMsg('me', esc(c.label)); chips.innerHTML = ''; if (c.go) c.go(); });
      chips.appendChild(b);
    });
    chatLog.scrollTop = chatLog.scrollHeight;
  }
  var MENU = function () {
    return [
      { label: 'What is APS?', go: whatIs },
      { label: 'Free pilot', go: pilot },
      { label: 'Contact us', go: contact },
      { label: '★ Star on GitHub', go: starAsk },
      { label: 'Email updates', go: updates }
    ];
  };
  function menu(text) { cSay([['cat', text || 'Anything else?']], function () { cChips(MENU()); }); }

  function whatIs() {
    cSay([
      ['star', 'Agent Passport System is an open protocol, Apache 2.0. It gives an AI agent a verifiable identity, ties it to the person or company it acts for, and enforces the scope, budget and conditions of its authority.'],
      ['cat', 'Every permitted action gets a signed receipt, and every refused action leaves evidence. So afterwards you can check who authorized what, and what happened.']
    ], function () {
      cChips([
        { label: 'Read the docs ↗', href: '/docs.html' },
        { label: 'Free pilot', go: pilot },
        { label: '★ Star on GitHub', go: starAsk },
        { label: 'Something else', go: function () { menu('Sure. What else?'); } }
      ]);
    });
  }

  // A small form spread over the conversation: each step asks, the input box answers.
  function ask(field, question, opts) {
    flow = { field: field, opts: opts || {} };
    cSay([[opts && opts.who || 'star', question]], function () {
      chatIn.type = field === 'email' ? 'email' : 'text';
      chatIn.placeholder = (opts && opts.ph) || '';
      if (opts && opts.skip) cChips([{ label: 'Skip', go: function () { answer(''); } }]);
      chatIn.focus();
    });
  }
  function answer(v) {
    var f = flow; if (!f) return;
    if (f.field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { cSay([['cat', 'That email does not look right. Try again?']]); return; }
    if (!v && !f.opts.skip) { chatIn.focus(); return; }
    data[f.field] = v; flow = null; chips.innerHTML = '';
    chatIn.type = 'text'; chatIn.placeholder = 'Ask about APS or type a message';
    if (f.opts.next) f.opts.next();
  }

  function pilot() {
    data = { topic: 'Pilot request (chat)' };
    cSay([
      ['cat', 'A pilot means we take one workflow where your agents act, run it under APS with a check before each action and signed receipts, and look at the result together. No fees either way.'],
    ], function () {
      ask('name', 'Great. What is your name?', { ph: 'Your name', next: function () {
        ask('email', 'Where should Tymofii reply?', { ph: 'you@company.com', next: function () {
          ask('org', 'Company or project?', { ph: 'Optional', skip: true, next: function () {
            ask('message', 'What do your agents do today, or what do you want them to do?', { who: 'cat', ph: 'One or two sentences', next: send });
          } });
        } });
      } });
    });
  }
  function contact() {
    data = { topic: 'Message (chat)' };
    ask('name', 'Sure. What is your name?', { ph: 'Your name', next: function () {
      ask('email', 'Where should the reply go?', { ph: 'you@company.com', next: function () {
        ask('message', 'What would you like to say?', { who: 'cat', ph: 'Your message', next: send });
      } });
    } });
  }
  function freeQuestion(q) {
    data = { topic: 'Question (chat)', message: q };
    cSay([['star', 'Good question. I can only answer a few things myself so far, so I will pass it to Tymofii, who built APS, and he will get back to you by email.']], function () {
      ask('name', 'What is your name?', { ph: 'Your name', next: function () {
        ask('email', 'And your email?', { ph: 'you@company.com', next: send });
      } });
    });
  }
  function send() {
    cSay([['cat', 'Sending…']]);
    var body = { name: data.name || '', email: data.email || '', org: data.org || '', topic: data.topic, message: data.message || '', content_sha256: '', website: '' };
    var p = window.fetch ? fetch(CONTACT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }); }) : Promise.resolve({});
    p.catch(function () { return {}; }).then(function (j) {
      if (j && j.ok) {
        cSay([['star', 'Sent. Tymofii will get back to you by email.']], afterAction);
      } else {
        cSay([['cat', 'That did not go through. You can write to <a href="mailto:signal@aeoess.com">signal@aeoess.com</a> instead, a person reads it.']], function () { cChips(MENU()); });
      }
    });
  }
  function afterAction() {
    if (!askedStar && !st.starred) { askedStar = true; setTimeout(starAsk, reduce ? 0 : 600); return; }
    menu();
  }
  function starAsk() {
    askedStar = true;
    cSay([
      ['cat', 'One more thing. A GitHub star helps the next person who needs this find it. It takes one click.'],
      ['star', 'And it makes me shine ★']
    ], function () {
      cChips([
        { label: '★ Star APS on GitHub ↗', href: REPO, gh: true, go: function () { st.starred = Date.now(); save(st); setTimeout(function () { cSay([['star', 'Thank you! That means a lot.']], function () { menu(); }); }, 400); } },
        { label: 'Maybe later', go: function () { menu('No problem.'); } }
      ]);
    });
  }
  function updates() {
    if (st.subscribed) { menu('You are already on the list. Anything else?'); return; }
    ask('email', 'Releases, spec changes and dev log highlights, a few emails a month at most. Your email?', { ph: 'you@company.com', next: function () {
      fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: data.email, hp: '', source: 'mascot-chat' }) })
        .then(function (r) { return r.json().catch(function () { return {}; }); }).catch(function () { return {}; })
        .then(function (j) {
          if (j && j.ok) { st.subscribed = Date.now(); save(st); cSay([['star', 'Check your inbox for a confirmation link. Nothing is stored until you open it.']], afterAction); }
          else cSay([['cat', 'Could not subscribe right now. Try again later, or mail signal@aeoess.com.']], function () { cChips(MENU()); });
        });
    } });
  }

  function openChat() {
    if (chat) { chatIn.focus(); return; }
    clearTimers();
    if (pill) pill.querySelector('.apsm-b').classList.remove('on');
    chat = document.createElement('div');
    chat.className = 'apsc'; chat.setAttribute('role', 'dialog'); chat.setAttribute('aria-label', 'Chat with the APS star and cat');
    chat.innerHTML =
      '<div class="apsc-h"><img src="' + M + '.webp' + MV + '" alt=""><div><b>Star &amp; Cat</b><small>Agent Passport System</small></div>' +
      '<button class="apsc-x" type="button" aria-label="Close chat">&#215;</button></div>' +
      '<div class="apsc-log" aria-live="polite"></div><div class="apsc-chips"></div>' +
      '<form class="apsc-f"><input type="text" autocomplete="off" aria-label="Your message" placeholder="Ask about APS or type a message"><button type="submit">Send</button></form>' +
      '<div class="apsc-note">A guided chat, not an AI. Messages go to a person by email.</div>';
    document.body.appendChild(chat);
    var bn = pill && pill.style.bottom ? parseInt(pill.style.bottom, 10) : 10;
    chat.style.bottom = (bn + (window.innerWidth <= 720 ? 140 : 188)) + 'px';
    chatLog = chat.querySelector('.apsc-log'); chips = chat.querySelector('.apsc-chips');
    chatForm = chat.querySelector('.apsc-f'); chatIn = chatForm.querySelector('input');
    chat.querySelector('.apsc-x').addEventListener('click', closeChat);
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (chatIn.value || '').trim(); chatIn.value = '';
      if (flow) { cMsg('me', esc(v)); answer(v); return; }
      if (!v) return;
      cMsg('me', esc(v)); chips.innerHTML = '';
      var q = v.toLowerCase();
      if (/pilot/.test(q)) pilot();
      else if (/star|github/.test(q)) starAsk();
      else if (/what is|what's|explain|how does|aps\b|passport/.test(q)) whatIs();
      else if (/contact|email you|talk to|human|person/.test(q)) contact();
      else if (/update|newsletter|subscribe/.test(q)) updates();
      else freeQuestion(v);
    });
    document.addEventListener('keydown', chatKey);
    requestAnimationFrame(function () { chat.classList.add('on'); });
    flow = null; data = {};
    cSay([
      ['star', 'Hi! I am the star, and this is the cat. We look after Agent Passport System.'],
      ['cat', 'Ask us about APS, start a free pilot, or leave a message for Tymofii.']
    ], function () { cChips(MENU()); chatIn.focus(); });
  }
  function chatKey(e) { if (e.key === 'Escape') closeChat(); }
  function closeChat() {
    if (!chat) return;
    document.removeEventListener('keydown', chatKey);
    var c = chat; chat = null; flow = null;
    c.classList.remove('on');
    setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, reduce ? 0 : 220);
    schedule();
  }

  function boot() {
    var pillHidden = false;
    try { pillHidden = sessionStorage.getItem('aps_star_pill_hidden') === '1'; } catch (e) {}
    // First visit in this browser: the star popup opens once by itself. Closing it wraps it into the mascot.
    if (MOBILE) {
      // On a phone the popup would cover the whole pitch, so it never opens by itself there.
      // The mascot slides in only once the visitor is engaged.
      if (!pillHidden) onEngaged(function () { showPill(true); });
      return;
    }
    if (!st.introAt) { onEngaged(function () { st.introAt = Date.now(); save(st); open(false); }); return; }
    if (!pillHidden) showPill();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
