/* aps-star.js: "Star APS" prompt with a second step for email updates.
   No third-party code, no tracking. State lives in localStorage under aps_star_v1. */
(function () {
  'use strict';
  var REPO = 'https://github.com/aeoess/agent-passport-system';
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
  '.apsx-ov{position:fixed;inset:0;background:rgba(8,10,15,.62);z-index:9990;display:flex;align-items:center;justify-content:center;padding:18px;opacity:0;transition:opacity .25s}' +
  '.apsx-ov.on{opacity:1}' +
  '.apsx-dlg{position:relative;width:min(760px,100%);max-height:calc(100vh - 36px);overflow:auto;background:#0C0E08;color:#E9ECDB;border:1px solid #33372A;border-radius:6px;display:grid;grid-template-columns:300px 1fr;box-shadow:0 30px 80px rgba(0,0,0,.6);transform:translateY(12px);transition:transform .25s}' +
  '.apsx-ov.on .apsx-dlg{transform:none}' +
  '.apsx-img{display:block;width:100%;height:100%;object-fit:cover;min-height:300px;background:#13150E}' +
  '.apsx-body{padding:30px 30px 26px;display:flex;flex-direction:column;gap:14px;font-family:Archivo,system-ui,sans-serif;position:relative}' +
  '.apsx-eyebrow{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#878B78;display:flex;align-items:center;gap:10px}' +
  '.apsx-eyebrow i{width:8px;height:8px;background:#B6FF45;display:inline-block}' +
  '.apsx-h{margin:0;font-family:Anton,Archivo,sans-serif;font-weight:400;font-size:38px;line-height:1.02;color:#fff}' +
  '.apsx-h em{font-style:normal;background:#B6FF45;color:#080A0F;padding:0 .12em}' +
  '.apsx-p{margin:0;font-size:16px;line-height:1.55;color:#B4B8A6}' +
  '.apsx-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:6px}' +
  '.apsx-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 18px;border-radius:3px;font:600 15px/1 Archivo,system-ui,sans-serif;text-decoration:none;cursor:pointer;border:1px solid #33372A;color:#E9ECDB;background:transparent}' +
  '.apsx-btn.pri{background:#B6FF45;color:#080A0F;border-color:#B6FF45}' +
  '.apsx-btn.pri:hover{background:#C8F032}' +
  '.apsx-btn:hover{border-color:#B6FF45;color:#E9ECDB}' +
  '.apsx-link{background:none;border:0;padding:8px 6px;color:#878B78;font:500 14px Archivo,system-ui,sans-serif;cursor:pointer;text-decoration:underline}' +
  '.apsx-x{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;border:1px solid #33372A;background:#0C0E08;color:#E9ECDB;font-size:18px;line-height:1;cursor:pointer}' +
  '.apsx-x:hover{border-color:#B6FF45}' +
  '.apsx-form{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}' +
  '.apsx-in{flex:1;min-width:200px;padding:12px 14px;border-radius:3px;border:1px solid #33372A;background:#13150E;color:#E9ECDB;font:15px Archivo,system-ui,sans-serif;outline:none}' +
  '.apsx-in:focus{border-color:#B6FF45}' +
  '.apsx-note{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11.5px;line-height:1.6;color:#6F7377}' +
  '.apsx-msg{font-size:15px;line-height:1.5;color:#B6FF45;min-height:1.5em}' +
  '.apsx-msg.err{color:#FF8A78}' +
  '.apsx-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}' +
  '.apsx-pill{position:fixed;right:16px;bottom:16px;z-index:9980;display:flex;align-items:center;gap:10px;padding:6px 10px 6px 6px;border-radius:999px;background:#0C0E08;color:#E9ECDB;border:1px solid #33372A;box-shadow:0 10px 30px rgba(0,0,0,.45);font:600 13px Archivo,system-ui,sans-serif;cursor:pointer;transition:transform .2s}' +
  '.apsx-pill:hover{transform:translateY(-2px);border-color:#B6FF45}' +
  '.apsx-pill img{width:36px;height:36px;border-radius:50%;object-fit:cover;display:block}' +
  '.apsx-pill b{color:#B6FF45;font-weight:700}' +
  '.apsx-pill .apsx-px{margin-left:4px;width:22px;height:22px;border-radius:50%;border:1px solid #33372A;background:transparent;color:#878B78;font-size:13px;line-height:1;cursor:pointer}' +
  '.apsx-pill .apsx-px:hover{color:#E9ECDB;border-color:#B6FF45}' +
  '@media (max-width:720px){.apsx-dlg{grid-template-columns:1fr;max-height:calc(100vh - 24px)}.apsx-img{max-height:38vh;min-height:180px}.apsx-body{padding:22px 20px 20px}.apsx-h{font-size:32px}.apsx-pill{right:12px;bottom:12px}.apsx-pill span.t{display:none}}' +
  '@media (prefers-reduced-motion:reduce){.apsx-ov,.apsx-dlg,.apsx-pill{transition:none}}';

  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  var ov, dlg, body, pill, step = st.subscribed ? 1 : 1, lastFocus = null;

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
        '<div class="apsx-row"><a class="apsx-btn pri" id="apsxStar" href="' + REPO + '" target="_blank" rel="noopener">&#9733; Star on GitHub &#8599;</a><button class="apsx-link" id="apsxSkip" type="button">Skip for now</button></div>' +
        '<div class="apsx-note">github.com/aeoess/agent-passport-system</div>';
      var star = body.querySelector('#apsxStar');
      star.addEventListener('click', function () { st.starred = Date.now(); save(st); setTimeout(function () { step = 2; render(); }, 250); });
      body.querySelector('#apsxSkip').addEventListener('click', function () { step = 2; render(); });
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
    if (pill) pill.style.display = 'none';
    step = st.subscribed ? 1 : (st.starred ? 2 : 1);
    if (fromPill && st.subscribed) step = 1;
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
    closeDialog();
    showPill();
  }
  function showPill() {
    if (pill) { pill.style.display = 'flex'; return; }
    pill = document.createElement('div');
    pill.className = 'apsx-pill'; pill.setAttribute('role', 'button'); pill.setAttribute('tabindex', '0'); pill.setAttribute('aria-label', 'Star APS on GitHub');
    pill.innerHTML = '<img src="' + IMG_FALLBACK + '" alt="" width="36" height="36"><span class="t"><b>&#9733;</b> Star APS</span>';
    pill.addEventListener('click', function () { open(true); });
    pill.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(true); } });
    document.body.appendChild(pill);
  }

  function boot() {
    var autoOpen = !st.minimizedAt || (Date.now() - st.minimizedAt > 7 * DAY);
    if (st.subscribed && st.starred) autoOpen = false;
    if (autoOpen) setTimeout(function () { open(false); }, 5000);
    else showPill();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
