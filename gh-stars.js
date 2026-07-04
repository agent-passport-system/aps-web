(function () {
  var KEY = 'aps-gh-stars', TTL = 3600000;
  function paint(n) {
    document.querySelectorAll('#ghStarCount').forEach(function (el) {
      el.textContent = n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
    });
  }
  try {
    var cached = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (cached && Date.now() - cached.t < TTL) { paint(cached.n); return; }
  } catch (e) {}
  fetch('https://api.github.com/repos/aeoess/agent-passport-system')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (d && typeof d.stargazers_count === 'number') {
        paint(d.stargazers_count);
        try { localStorage.setItem(KEY, JSON.stringify({ n: d.stargazers_count, t: Date.now() })); } catch (e) {}
      }
    })
    .catch(function () {});
})();
