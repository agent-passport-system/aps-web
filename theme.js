(function () {
  var KEY = 'aps-theme';
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function sysTheme() { return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; }
  function current() { return document.documentElement.getAttribute('data-theme') || 'dark'; }
  function apply(t, persist) {
    document.documentElement.setAttribute('data-theme', t);
    if (persist) { try { localStorage.setItem(KEY, t); } catch (e) {} }
    var mc = document.querySelector('meta[name="theme-color"]');
    if (!mc) { mc = document.createElement('meta'); mc.name = 'theme-color'; document.head.appendChild(mc); }
    mc.content = t === 'light' ? '#F4F1EA' : '#0A0B08';
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.textContent = t === 'light' ? '\u263E dark' : '\u2600 light';
      b.setAttribute('aria-label', 'Switch to ' + (t === 'light' ? 'dark' : 'light') + ' mode');
    });
  }
  function makeBtn() {
    var b = document.createElement('button');
    b.className = 'theme-toggle';
    b.addEventListener('click', function () { apply(current() === 'light' ? 'dark' : 'light', true); });
    return b;
  }
  function init() {
    var nav = document.querySelector('header .nav-links');
    if (nav) nav.appendChild(makeBtn());
    var dh = document.querySelector('.drawer-head');
    if (dh) dh.insertBefore(makeBtn(), dh.querySelector('.drawer-close'));
    apply(current(), false);
    if (!stored() && window.matchMedia) {
      matchMedia('(prefers-color-scheme: light)').addEventListener('change', function () {
        if (!stored()) apply(sysTheme(), false);
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
