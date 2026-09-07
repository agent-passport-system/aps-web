// Theme switch. Two palettes: "bright" (blue, white, marker yellow) is the
// default; "dark" is the night palette. A stored preference wins over the
// default, and "light", written by the retired cream toggle, reads as bright.
//
// The attribute itself is set by the inline no-flash snippet in each page's
// <head>, before first paint. This file only builds the control and keeps the
// label, the aria state and meta[theme-color] in step with it.
(function () {
  var KEY = 'aps-theme';
  var BAR = { bright: '#0A5CFF', dark: '#0A0B08' };

  function normalize(t) { return t === 'dark' ? 'dark' : 'bright'; }
  function current() { return normalize(document.documentElement.getAttribute('data-theme')); }

  function apply(t, persist) {
    t = normalize(t);
    document.documentElement.setAttribute('data-theme', t);
    if (persist) { try { localStorage.setItem(KEY, t); } catch (e) {} }
    var mc = document.querySelector('meta[name="theme-color"]');
    if (!mc) { mc = document.createElement('meta'); mc.name = 'theme-color'; document.head.appendChild(mc); }
    mc.content = BAR[t];
    var other = t === 'bright' ? 'dark' : 'bright';
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.textContent = (t === 'bright' ? '☾ ' : '☀ ') + other;
      b.setAttribute('aria-label', 'Switch to the ' + other + ' theme');
      b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
    });
  }

  function makeBtn() {
    var b = document.createElement('button');
    b.className = 'theme-toggle';
    b.type = 'button';
    b.addEventListener('click', function () {
      apply(current() === 'dark' ? 'bright' : 'dark', true);
    });
    return b;
  }

  function init() {
    // Top right of the nav. nav-links is the right-hand group, so appending
    // lands the control at the end of it. Some pages carry a second, hidden
    // nav-links for the mobile menu, so take the first one actually on screen:
    // a control inside a display:none container cannot be reached by keyboard.
    var cand = [].slice.call(document.querySelectorAll(
      'header .nav-links, .nav .nav-links, .nav-links, header .nav, .nav'));
    var nav = null;
    for (var i = 0; i < cand.length; i++) {
      if (cand[i].offsetParent !== null || getComputedStyle(cand[i]).position === 'fixed') { nav = cand[i]; break; }
    }
    if (!nav) nav = cand[0] || null;
    if (nav) nav.appendChild(makeBtn());
    var dh = document.querySelector('.drawer-head');
    if (dh) dh.insertBefore(makeBtn(), dh.querySelector('.drawer-close'));
    apply(current(), false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
