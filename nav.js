(function () {
  if (window.__apsNav) return; window.__apsNav = 1;
  function init() {
    var d = document.getElementById('drawer'), b = document.getElementById('burger');
    if (!d || !b) return;
    function set(o) {
      d.classList.toggle('open', o);
      b.setAttribute('aria-expanded', o ? 'true' : 'false');
      document.documentElement.style.overflow = o ? 'hidden' : '';
    }
    b.addEventListener('click', function () { set(!d.classList.contains('open')); });
    var s = document.getElementById('drawerScrim'); if (s) s.addEventListener('click', function () { set(false); });
    var c = document.getElementById('drawerClose'); if (c) c.addEventListener('click', function () { set(false); });
    d.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
