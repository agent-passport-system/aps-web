// Reading pages: the section list with reading progress, and the pixel icon in the page header.
(function () {
  var art = document.querySelector('body.read article.prose, body.read .r-window');
  if (!art) return;

  // ---- pixel icon in the header. k = black, w = white, y = yellow, . = empty
  var ICONS = {
    coin: ['....kkkk....', '..kkyyyykk..', '.kyyyyyyyyk.', '.kyyykkkyyk.', 'kyyykyyyyyyk', 'kyyykyyyyyyk', 'kyyykyyyyyyk', 'kyyykyyyyyyk', '.kyyykkkyyk.', '.kyyyyyyyyk.', '..kkyyyykk..', '....kkkk....'],
    key: ['............', '..kkkk......', '.kyyyyk.....', 'kyykkyyk....', 'kyk..kykkkkk', 'kyk..kyyyyyk', 'kyykkyykykyk', '.kyyyyk.k.k.', '..kkkk......', '............'],
    shield: ['kkkkkkkkkkkk', 'kwwwwwyyyyyk', 'kwwwwwyyyyyk', 'kwwwwwyyyyyk', 'kwwwwwyyyyyk', 'kyyyyywwwwwk', 'kyyyyywwwwwk', '.kyyyywwwwk.', '.kyyyywwwwk.', '..kyyywwwk..', '...kkywkk...', '.....kk.....'],
    bubble: ['.kkkkkkkkkk.', 'kwwwwwwwwwwk', 'kwwwkkkkwwwk', 'kwwkwwwwkwwk', 'kwwwwwwkkwwk', 'kwwwwwkkwwwk', 'kwwwwwkwwwwk', 'kwwwwwwwwwwk', 'kwwwwwkwwwwk', 'kwwwwwwwwwwk', '.kkkkkkkkkk.', '...kk.......'],
    blocks: ['kkkkkkkk....', 'kwwwwwwk....', 'kwwwwwwk....', 'kwwwkkkkkkkk', 'kwwwkyyyyyyk', 'kwwwkyyyyyyk', 'kwwwkyyyyyyk', 'kkkkkyyyyyyk', '....kyyyyyyk', '....kyyyyyyk', '....kyyyyyyk', '....kkkkkkkk'],
    check: ['kkkkkkkkkkkk', 'kwwwwwwwwwwk', 'kwwwwwwwwyyk', 'kwwwwwwwyykk', 'kwwwwwwyykwk', 'kwyywwyykwwk', 'kwkyyyykwwwk', 'kwwkyykwwwwk', 'kwwwkkwwwwwk', 'kwwwwwwwwwwk', 'kkkkkkkkkkkk'],
    doc: ['.kkkkkkkk...', '.kwwwwwwkk..', '.kwwwwwwkwk.', '.kwkkkkwkkk.', '.kwwwwwwwwk.', '.kwkkkkkkwk.', '.kwwwwwwwwk.', '.kwkkkkkkwk.', '.kwwwwwwwwk.', '.kwkkkkwyyk.', '.kwwwwwwyyk.', '.kkkkkkkkkk.'],
    lens: ['..kkkkk.....', '.kwwwwwk....', 'kwwwwwwwk...', 'kwwwwwwwk...', 'kwwwwwwwk...', 'kwwwwwwwk...', '.kwwwwwk....', '..kkkkkkk...', '.......kyk..', '........kyk.', '.........kyk', '..........kk'],
    frame: ['kkkkkkkkkkkk', 'kyyyyyyyyyyk', 'kykkkkkkkkyk', 'kykwwwwwwkyk', 'kykwwwwkwkyk', 'kykwwwkkkkyk', 'kykwkkkkkkyk', 'kykkkkkkkkyk', 'kyyyyyyyyyyk', 'kkkkkkkkkkkk']
  };
  var BY_PAGE = { wallet: 'coin', passport: 'key', 'threat-model': 'shield', aivss: 'shield', faq: 'bubble', compare: 'blocks', compliance: 'doc', protocol: 'check', verify: 'lens', 'data-usage-evidence': 'frame' };
  var page = (location.pathname.split('/').pop() || '').replace('.html', '');
  var rows = ICONS[BY_PAGE[page]];
  var hero = document.querySelector('body.read .page-hero');
  if (rows && hero) {
    var COL = { k: '#111111', w: '#ffffff', y: '#FFF200' };
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 12 ' + rows.length);
    svg.setAttribute('class', 'r-icon');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('shape-rendering', 'crispEdges');
    rows.forEach(function (row, y) {
      row.split('').forEach(function (ch, x) {
        if (!COL[ch]) return;
        var r = document.createElementNS(NS, 'rect');
        r.setAttribute('x', x); r.setAttribute('y', y);
        r.setAttribute('width', 1); r.setAttribute('height', 1);
        r.setAttribute('fill', COL[ch]);
        svg.appendChild(r);
      });
    });
    hero.appendChild(svg);
  }

  // ---- section list with a progress bar
  if (document.body.classList.contains('read-wide')) return;
  var hs = Array.prototype.slice.call(art.querySelectorAll('h2'));
  if (hs.length < 3) return;
  var nav = document.createElement('nav');
  nav.className = 'read-toc';
  nav.setAttribute('aria-label', 'On this page');
  var head = document.createElement('div'); head.className = 'rt-head'; head.textContent = 'On this page'; nav.appendChild(head);
  var bar = document.createElement('div'); bar.className = 'rt-bar'; bar.setAttribute('aria-hidden', 'true');
  var segs = [];
  for (var i = 0; i < 10; i++) { var s = document.createElement('i'); bar.appendChild(s); segs.push(s); }
  nav.appendChild(bar);
  var pct = document.createElement('div'); pct.className = 'rt-pct'; pct.textContent = 'Read 0%'; nav.appendChild(pct);
  var links = hs.map(function (h, n) {
    if (!h.id) h.id = 's' + (n + 1);
    var a = document.createElement('a'); a.href = '#' + h.id;
    var box = document.createElement('span'); box.className = 'rt-box';
    var t = document.createElement('span'); t.textContent = h.textContent;
    a.appendChild(box); a.appendChild(t); nav.appendChild(a);
    return a;
  });
  art.parentNode.insertBefore(nav, art.nextSibling);

  var ticking = false;
  function update() {
    ticking = false;
    var now = -1;
    hs.forEach(function (h, n) { if (h.getBoundingClientRect().top < 160) now = n; });
    links.forEach(function (a, n) {
      a.classList.toggle('done', n < now);
      a.classList.toggle('now', n === now);
    });
    var r = art.getBoundingClientRect();
    var p = (window.innerHeight * 0.6 - r.top) / Math.max(1, r.height);
    p = Math.max(0, Math.min(1, p));
    var on = Math.round(p * 10);
    segs.forEach(function (s, n) { s.classList.toggle('on', n < on); });
    pct.textContent = 'Read ' + Math.round(p * 100) + '%';
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
