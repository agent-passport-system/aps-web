(function () {
  function init() {
    var posts = Array.prototype.slice.call(document.querySelectorAll('article.post'));
    if (!posts.length) return;
    var bar = document.createElement('nav');
    bar.className = 'bp-bar'; bar.setAttribute('aria-label', 'Jump to day');
    posts.forEach(function (p) {
      var m = (p.id || '').match(/^day-(\d+)/);
      if (!m) return;
      var h = p.querySelector('h1,h2,h3');
      var b = document.createElement('button');
      b.className = 'bp-chip'; b.textContent = 'D' + m[1];
      if (h) b.title = h.textContent.trim();
      b.addEventListener('click', function () {
        p.scrollIntoView({ behavior: 'smooth', block: 'start' });
        bar.querySelectorAll('.bp-chip').forEach(function (x) { x.classList.toggle('on', x === b); });
      });
      bar.appendChild(b);
    });
    var feed = posts[0].closest('main') || posts[0].parentElement;
    feed.parentElement.insertBefore(bar, feed);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
