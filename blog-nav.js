/* Dev log jump bar and deep-link resolver.
 *
 * The feed is paginated by scripts/build-blog-pages.mjs, which inlines a
 * #bp-index listing every entry on every page. Two jobs here:
 *
 *   1. A #day-N anchor for an entry that lives on another page navigates to
 *      that page instead of landing nowhere. That keeps blog.html#day-59 a
 *      permalink no matter which page Day 59 has drifted onto.
 *   2. The bar groups by month rather than showing one chip per entry, which
 *      stopped being usable somewhere past the fiftieth entry.
 *
 * Nothing here is load-bearing. With scripts off the pager links in the page
 * are the whole navigation, and every entry is still served as plain HTML.
 */
(function () {
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function readIndex() {
    var el = document.getElementById('bp-index');
    if (!el) return null;
    try {
      var data = JSON.parse(el.textContent);
      return data && data.posts && data.posts.length ? data : null;
    } catch (e) {
      return null;
    }
  }

  function pageHref(n) {
    return n === 1 ? '/blog.html' : '/blog-' + n + '.html';
  }

  function currentPage(index) {
    // Trust the page the browser is on over anything in the index: the file
    // name is the one fact that cannot drift.
    var m = location.pathname.match(/\/blog-(\d+)\.html$/);
    if (m) return Number(m[1]);
    if (/\/blog\.html$/.test(location.pathname) || /\/$/.test(location.pathname)) return 1;
    var first = document.querySelector('article.post');
    if (first && index) {
      for (var i = 0; i < index.posts.length; i++) {
        if (index.posts[i].i === first.id) return index.posts[i].p;
      }
    }
    return 1;
  }

  /* 1. Deep links ---------------------------------------------------------- */

  function resolveHash(index, page) {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id || document.getElementById(id)) return false;
    for (var i = 0; i < index.posts.length; i++) {
      var p = index.posts[i];
      if (p.i !== id) continue;
      if (p.p === page) return false;
      location.replace(pageHref(p.p) + '#' + encodeURIComponent(id));
      return true;
    }
    return false;
  }

  /* 2. Jump bar ------------------------------------------------------------ */

  function monthKey(iso) {
    return iso.slice(0, 7);
  }

  function monthLabel(key, multiYear) {
    var parts = key.split('-');
    var name = MONTHS[Number(parts[1]) - 1];
    return multiYear ? name + ' ' + parts[0].slice(2) : name;
  }

  function chipLabel(post) {
    var m = (post.i || '').match(/^day-(\d+)/);
    if (m) return 'D' + m[1];
    var parts = post.d.split('-');
    return MONTHS[Number(parts[1]) - 1] + ' ' + Number(parts[2]);
  }

  function build(index, page) {
    var years = {};
    var order = [];
    var byMonth = {};
    index.posts.forEach(function (p) {
      years[p.d.slice(0, 4)] = 1;
      var k = monthKey(p.d);
      if (!byMonth[k]) {
        byMonth[k] = [];
        order.push(k);
      }
      byMonth[k].push(p);
    });
    var multiYear = Object.keys(years).length > 1;

    var bar = document.createElement('nav');
    bar.className = 'bp-bar';
    bar.setAttribute('aria-label', 'Jump to a day');

    var monthRow = document.createElement('div');
    monthRow.className = 'bp-bar-row bp-bar-months';
    monthRow.setAttribute('role', 'tablist');
    monthRow.setAttribute('aria-label', 'Months');

    var monthTag = document.createElement('span');
    monthTag.className = 'bp-bar-label';
    monthTag.textContent = 'Month';
    monthRow.appendChild(monthTag);

    var dayRow = document.createElement('div');
    dayRow.className = 'bp-bar-row bp-bar-days';
    dayRow.id = 'bp-days';
    dayRow.setAttribute('role', 'tabpanel');

    var dayTag = document.createElement('span');
    dayTag.className = 'bp-bar-label';
    dayTag.textContent = 'Day';

    var tabs = [];

    function select(key, focus) {
      tabs.forEach(function (t) {
        var on = t.dataset.month === key;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (on) {
          dayRow.setAttribute('aria-labelledby', t.id);
          if (focus) t.focus();
          if (t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      });
      renderDays(key);
    }

    function renderDays(key) {
      dayRow.textContent = '';
      dayRow.appendChild(dayTag);
      byMonth[key].forEach(function (p) {
        var here = p.p === page;
        var chip = document.createElement(here ? 'button' : 'a');
        chip.className = 'bp-chip' + (here ? '' : ' bp-chip-off');
        chip.textContent = chipLabel(p);
        chip.title = here ? p.t : p.t + ' (page ' + p.p + ')';
        if (here) {
          chip.type = 'button';
          chip.addEventListener('click', function () {
            var el = document.getElementById(p.i);
            if (!el) return;
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', '#' + p.i);
            dayRow.querySelectorAll('.bp-chip').forEach(function (x) {
              x.classList.toggle('on', x === chip);
            });
          });
        } else {
          chip.href = pageHref(p.p) + '#' + encodeURIComponent(p.i);
          chip.setAttribute('aria-label', p.t + ', on page ' + p.p);
        }
        dayRow.appendChild(chip);
      });
    }

    order.forEach(function (key, i) {
      var t = document.createElement('button');
      t.type = 'button';
      t.className = 'bp-chip';
      t.id = 'bp-m-' + key;
      t.dataset.month = key;
      t.setAttribute('role', 'tab');
      t.setAttribute('aria-controls', 'bp-days');
      t.setAttribute('aria-selected', 'false');
      t.tabIndex = -1;
      t.textContent = monthLabel(key, multiYear);
      t.title = byMonth[key].length + (byMonth[key].length === 1 ? ' entry' : ' entries');
      t.addEventListener('click', function () {
        select(key, false);
      });
      t.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = order[i + 1];
        else if (e.key === 'ArrowLeft') next = order[i - 1];
        else if (e.key === 'Home') next = order[0];
        else if (e.key === 'End') next = order[order.length - 1];
        else return;
        if (!next) return;
        e.preventDefault();
        select(next, true);
      });
      tabs.push(t);
      monthRow.appendChild(t);
    });

    bar.appendChild(monthRow);
    bar.appendChild(dayRow);

    var first = document.querySelector('article.post');
    var openKey = order[0];
    if (first) {
      for (var i = 0; i < index.posts.length; i++) {
        if (index.posts[i].i === first.id) {
          openKey = monthKey(index.posts[i].d);
          break;
        }
      }
    }
    select(openKey, false);

    var feed = document.querySelector('main.blog-feed') || (first && first.parentElement);
    if (!feed) return;
    feed.parentElement.insertBefore(bar, feed);

    // The site header is fixed and the bar sticks under it. Publish both
    // heights so the bar sits clear of the header and an anchor lands clear
    // of both.
    var nav = document.querySelector('header.nav');
    var setH = function () {
      var root = document.documentElement.style;
      root.setProperty('--bp-nav-h', (nav ? nav.offsetHeight : 0) + 'px');
      root.setProperty('--bp-bar-h', bar.offsetHeight + 'px');
    };
    setH();
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(setH);
      ro.observe(bar);
      if (nav) ro.observe(nav);
    } else {
      window.addEventListener('resize', setH);
    }
  }

  /* Fallback: a page with no index still gets the old one-chip-per-entry bar. */
  function legacyBar() {
    var posts = Array.prototype.slice.call(document.querySelectorAll('article.post'));
    if (!posts.length) return;
    var bar = document.createElement('nav');
    bar.className = 'bp-bar';
    bar.setAttribute('aria-label', 'Jump to a day');
    var row = document.createElement('div');
    row.className = 'bp-bar-row';
    bar.appendChild(row);
    posts.forEach(function (p) {
      var m = (p.id || '').match(/^day-(\d+)/);
      if (!m) return;
      var h = p.querySelector('h1,h2,h3');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'bp-chip';
      b.textContent = 'D' + m[1];
      if (h) b.title = h.textContent.trim();
      b.addEventListener('click', function () {
        p.scrollIntoView({ behavior: 'smooth', block: 'start' });
        row.querySelectorAll('.bp-chip').forEach(function (x) {
          x.classList.toggle('on', x === b);
        });
      });
      row.appendChild(b);
    });
    var feed = posts[0].closest('main') || posts[0].parentElement;
    feed.parentElement.insertBefore(bar, feed);
  }

  /* Inserting the bar and loading the display faces both move the feed down
   * after the browser has already jumped to the anchor, so land on it again
   * once things settle. Any scroll the reader makes cancels that. */
  function settle() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    var el = id && document.getElementById(id);
    if (!el) return;
    var live = true;
    var stop = function () {
      live = false;
    };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (e) {
      window.addEventListener(e, stop, { once: true, passive: true });
    });
    var go = function () {
      if (live) el.scrollIntoView({ block: 'start' });
    };
    go();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    window.addEventListener('load', function () {
      setTimeout(go, 0);
    }, { once: true });
  }

  function init() {
    var index = readIndex();
    if (!index) {
      legacyBar();
      return;
    }
    var page = currentPage(index);
    if (resolveHash(index, page)) return; // leaving for another page
    window.addEventListener('hashchange', function () {
      resolveHash(index, page);
    });
    build(index, page);
    settle();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
