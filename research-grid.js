// Research page: one animated pixel square per paper, small squares per citation.
// Zero dependencies. Without JavaScript every description stays visible as text.
(function () {
  'use strict'
  var root = document.querySelector('.rg-wrap')
  if (!root) return
  document.documentElement.classList.add('rg-js')

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  var C = { bg: '#0A5CFF', deep: '#0745D9', light: '#8DB6FF', pale: '#CFE0FF', white: '#FFFFFF', yel: '#FFF200', red: '#FF4D5A' }
  var N = 24 // cells per side

  // ---------- one drawing function per paper, t in seconds, p = cell painter ----------
  function box(p, x, y, w, h, c) { for (var i = x; i < x + w; i++) { p(i, y, c); p(i, y + h - 1, c) } for (var j = y; j < y + h; j++) { p(x, j, c); p(x + w - 1, j, c) } }
  function fill(p, x, y, w, h, c) { for (var i = x; i < x + w; i++) for (var j = y; j < y + h; j++) p(i, j, c) }
  function lerp(a, b, k) { return a + (b - a) * k }
  function rnd(seed) { var s = Math.sin(seed * 9301 + 49297) * 233280; return s - Math.floor(s) }

  var VIZ = {
    // agent, owner and observer, with the agreement passing between them
    contract: function (p, t) {
      var pts = [[4, 11], [17, 11], [11, 2]]
      var cols = [C.yel, C.white, C.pale]
      for (var e = 0; e < 3; e++) {
        var a = pts[e], b = pts[(e + 1) % 3]
        for (var k = 0; k <= 12; k++) { if (k % 2) continue; var x = Math.round(lerp(a[0], b[0], k / 12)) + 1, y = Math.round(lerp(a[1], b[1], k / 12)) + 1; p(x, y, C.light) }
      }
      var ph = (t * 0.5) % 3, seg = Math.floor(ph), f = ph - seg
      var a2 = pts[seg], b2 = pts[(seg + 1) % 3]
      var px = Math.round(lerp(a2[0], b2[0], f)), py = Math.round(lerp(a2[1], b2[1], f))
      for (var n = 0; n < 3; n++) {
        var near = (seg === n && f < 0.15) || ((seg + 1) % 3 === n && f > 0.85)
        fill(p, pts[n][0], pts[n][1], 3, 3, near ? C.yel : cols[n])
        if (near) box(p, pts[n][0] - 1, pts[n][1] - 1, 5, 5, C.yel)
      }
      fill(p, px, py, 3, 3, C.yel); fill(p, px + 1, py + 1, 1, 1, C.deep)
    },
    // authority narrows at each step down, and a push to widen bounces back
    narrowing: function (p, t) {
      var cyc = t % 6, shown = Math.min(5, Math.floor(cyc / 0.7) + 1)
      function ix(k) { return 1 + 2 * k } function iy(k) { return 1 + Math.round(1.5 * k) }
      for (var k = 0; k < shown; k++) box(p, ix(k), iy(k), N - 2 * ix(k), 18 - 2 * iy(k), k === shown - 1 ? C.yel : C.light)
      if (cyc > 3.6) {
        var b = cyc - 3.6, top = iy(4), out = Math.sin(Math.min(1, b / 0.6) * Math.PI) * 2.4
        fill(p, 11, Math.round(top + 1 - out), 2, 2, C.white)
        if (b > 0.2 && b < 0.45) { for (var i = ix(4); i < N - ix(4); i++) p(i, top, C.red) }
      }
    },
    // five facets of authority, each shrinking at its own rate per hop
    facets: function (p, t) {
      var rates = [0.86, 0.68, 0.92, 0.55, 0.78], hop = Math.floor(t / 1.1) % 6, f = Math.min(1, (t % 1.1) / 0.5)
      for (var i = 0; i < 5; i++) {
        var hPrev = 12 * Math.pow(rates[i], Math.max(0, hop - 1)), hNow = 12 * Math.pow(rates[i], hop)
        var h = Math.max(1, Math.round(hop === 0 ? 12 : lerp(hPrev, hNow, f)))
        fill(p, 2 + i * 4, 15 - h, 3, h, i % 2 ? C.pale : C.white)
        p(2 + i * 4 + 1, 15 - h - 1, C.yel)
      }
      for (var d = 0; d < 6; d++) p(2 + d * 2, 1, d <= hop ? C.yel : C.deep)
    },
    // the walker can move anywhere inside its scope and nowhere outside it
    physics: function (p, t) {
      for (var x = 0; x < N; x++) for (var y = 0; y < 19; y++) if ((x + y) % 4 === 0 && (x < 4 || x > 19 || y < 3 || y > 15)) p(x, y, C.deep)
      box(p, 4, 3, 16, 13, C.white)
      var k = Math.floor(t * 2.2), wx = 11, wy = 8, hit = -1
      for (var s = 0; s <= k % 40; s++) { var dir = Math.floor(rnd(s + 7) * 4), nx = wx + [1, -1, 0, 0][dir] * 2, ny = wy + [0, 0, 1, -1][dir] * 2; if (nx < 5 || nx > 17 || ny < 4 || ny > 13) { hit = s === k % 40 ? dir : hit } else { wx = nx; wy = ny } }
      fill(p, wx, wy, 2, 2, C.yel)
      if (hit >= 0) { if (hit < 2) for (var j = 3; j < 16; j++) p(hit === 0 ? 19 : 4, j, C.red); else for (var i = 4; i < 20; i++) p(i, hit === 2 ? 15 : 3, C.red) }
    },
    // actions move through the medium, the gate checks each one, receipts pile up
    medium: function (p, t) {
      fill(p, 0, 6, N, 1, C.light); fill(p, 0, 14, N, 1, C.light)
      fill(p, 12, 5, 2, 11, C.yel)
      var got = 0
      for (var i = 0; i < 9; i++) {
        var x = ((t * 5 + i * 3.1) % 30) - 4, bad = rnd(i * 3) > 0.7, y = 8 + (i % 3) * 2
        if (bad && x > 12) { y += Math.round((x - 12) * 1.2); if (y > 18) continue }
        if (x >= 0 && x < N) fill(p, Math.round(x), y, 2, 1, bad ? C.red : C.white)
        if (!bad && x > 14) got++
      }
      for (var r = 0; r < Math.min(got, 6); r++) fill(p, 21 - r * 2, 1, 1, 2, C.yel)
    },
    // inside activity stays private, a sealed declaration is what leaves
    cognitive: function (p, t) {
      var sealed = (t % 5) > 3
      for (var x = 0; x < 10; x++) for (var y = 0; y < 10; y++) {
        var on = rnd(x * 31 + y * 7 + Math.floor(t * 6)) > 0.55
        p(7 + x, 4 + y, sealed ? ((x + y) % 2 ? C.deep : C.bg) : (on ? C.white : C.light))
      }
      if (sealed) {
        var r = 6
        for (var a = 0; a < 48; a++) { var ang = a / 48 * Math.PI * 2; p(Math.round(11.5 + Math.cos(ang) * r), Math.round(8.5 + Math.sin(ang) * r), C.yel) }
        fill(p, 10, 7, 4, 4, C.yel)
      }
    },
    // the right to act grows from steps that were watched
    derivation: function (p, t) {
      var steps = Math.floor((t * 3) % 16)
      for (var q = 0; q < 16; q++) p(1 + q, 13 - (q % 2) * 2 - Math.floor(q / 4), C.deep)
      for (var s = 0; s < steps; s++) { var x = 1 + s, y = 13 - (s % 2) * 2 - Math.floor(s / 4); p(x, y, C.white) }
      var lvl = Math.min(4, Math.floor(steps / 4))
      for (var l = 0; l < lvl; l++) fill(p, 18 + (l % 2) * 2, 11 - l * 3, 3, 2, C.yel)
      if (steps === 15) box(p, 16, 0, 7, 14, C.yel)
    },
    // the gap between a claim of safety and the evidence that would carry it
    gap: function (p, t) {
      fill(p, 0, 11, 7, 8, C.deep); fill(p, 17, 11, 7, 8, C.deep)
      fill(p, 0, 10, 7, 1, C.light); fill(p, 17, 10, 7, 1, C.light)
      var cyc = t % 7, planks = Math.min(10, Math.floor(cyc / 0.4))
      for (var i = 0; i < planks; i++) fill(p, 7 + i, 10, 1, 1, i % 2 ? C.yel : C.white)
      if (planks === 10) { var w = Math.min(19, Math.floor((cyc - 4) * 6)); fill(p, 2 + w, 8, 2, 2, C.white) }
    },
    // five runs: kept by peer vote (yellow) against kept at random (pale)
    plausibly: function (p, t) {
      var pairs = [[12, 8], [11, 7], [13, 9], [10, 12], [12, 6]], g = Math.min(1, (t % 6) / 2)
      for (var i = 0; i < 5; i++) {
        var x = 1 + i * 4, hr = Math.round(pairs[i][0] * g), hv = Math.round(pairs[i][1] * g)
        fill(p, x, 16 - hr, 1, hr, C.pale); fill(p, x + 1, 16 - hv, 2, hv, C.yel)
      }
      for (var d = 0; d < 12; d++) p(1 + d * 2, 1, rnd(d + Math.floor(t * 4)) > 0.5 ? C.white : C.deep)
    }
  }

  // ---------- canvas plumbing ----------
  var tiles = Array.prototype.slice.call(root.querySelectorAll('.rg-tile'))
  var items = tiles.map(function (li) {
    var cv = li.querySelector('.rg-cv'), fn = VIZ[li.getAttribute('data-viz')]
    return { li: li, cv: cv, ctx: cv.getContext('2d'), fn: fn, t: rnd(tiles.indexOf(li)) * 10, seen: false, hot: false }
  })

  function size(it) {
    var r = it.cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1)
    var w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d))
    if (it.cv.width !== w || it.cv.height !== h) { it.cv.width = w; it.cv.height = h }
  }
  function draw(it) {
    var ctx = it.ctx, W = it.cv.width, H = it.cv.height, cell = W / N
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(255,255,255,.06)'
    for (var gx = 0; gx < N; gx++) for (var gy = 0; gy < N; gy++) if ((gx + gy) % 2 === 0) ctx.fillRect(Math.floor(gx * cell), Math.floor(gy * cell), Math.ceil(cell), Math.ceil(cell))
    var off = it.li.classList.contains('is-open') ? 1 : 1.5
    var p = function (x, y, c) { if (x < 0 || y < 0 || x >= N || y >= N) return; ctx.fillStyle = c; ctx.fillRect(Math.floor(x * cell), Math.floor((y + off) * cell), Math.ceil(cell), Math.ceil(cell)) }
    it.fn(p, it.t)
  }

  var last = 0
  function frame(now) {
    var dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now
    for (var i = 0; i < items.length; i++) {
      var it = items[i]
      if (!it.seen) continue
      it.t += dt * (it.hot || it.li.classList.contains('is-open') ? 1 : 0.35)
      draw(it)
    }
    requestAnimationFrame(frame)
  }

  items.forEach(function (it) {
    size(it); draw(it)
    var b = it.li.querySelector('.rg-btn')
    b.addEventListener('pointerenter', function () { it.hot = true })
    b.addEventListener('pointerleave', function () { it.hot = false })
    b.addEventListener('focus', function () { it.hot = true })
    b.addEventListener('blur', function () { it.hot = false })
    b.addEventListener('click', function () {
      var open = !it.li.classList.contains('is-open')
      items.forEach(function (o) { o.li.classList.remove('is-open'); o.li.querySelector('.rg-btn').setAttribute('aria-expanded', 'false') })
      if (open) { it.li.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); it.t = 0 }
      requestAnimationFrame(function () { items.forEach(function (o) { size(o); draw(o) }); if (open) it.li.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }) })
    })
  })

  if (reduce) {
    items.forEach(function (it) { it.t = 4.2; draw(it) })
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { items.forEach(function (it) { if (it.li === e.target) it.seen = e.isIntersecting }) }) }, { rootMargin: '80px' })
    items.forEach(function (it) { io.observe(it.li) })
    requestAnimationFrame(frame)
  } else {
    items.forEach(function (it) { it.seen = true }); requestAnimationFrame(frame)
  }
  window.addEventListener('resize', function () { items.forEach(function (it) { size(it); draw(it) }) })
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return
    items.forEach(function (o) { if (o.li.classList.contains('is-open')) { o.li.classList.remove('is-open'); var b = o.li.querySelector('.rg-btn'); b.setAttribute('aria-expanded', 'false'); b.focus() } })
    requestAnimationFrame(function () { items.forEach(function (o) { size(o); draw(o) }) })
  })

  // ---------- citations: one shared panel under the grid ----------
  var panel = root.querySelector('#rg-panel')
  var sqs = Array.prototype.slice.call(root.querySelectorAll('.rg-cite'))
  sqs.forEach(function (li) {
    var b = li.querySelector('.rg-sq'), det = li.querySelector('.rg-cite-detail')
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true'
      sqs.forEach(function (o) { o.querySelector('.rg-sq').setAttribute('aria-expanded', 'false') })
      panel.innerHTML = ''
      if (!open) return
      b.setAttribute('aria-expanded', 'true')
      var card = document.createElement('div')
      card.className = 'rg-card ' + li.className.split(' ').filter(function (c) { return c.indexOf('k-') === 0 }).join(' ')
      var n = document.createElement('span'); n.className = 'rg-card-n'; n.textContent = b.querySelector('.rg-sq-n').textContent
      card.appendChild(n)
      card.appendChild(det.querySelector('p').cloneNode(true))
      panel.appendChild(card)
    })
  })
})()
