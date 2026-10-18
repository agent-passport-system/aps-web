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
 *   3. Stories are a different kind of post from the dev log. Their chips are
 *      coloured, and a Show switch narrows the bar and the page to all posts,
 *      dev log only, or stories only. The choice is kept in ?show= and, where
 *      storage works, in localStorage, so it follows the reader across pages.
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

  /* Show mode: all, devlog or stories. */
  var MODES = [['all', 'All'], ['devlog', 'Dev log'], ['stories', 'Stories']];

  function readMode() {
    var m = (location.search.match(/[?&]show=(all|devlog|stories)\b/) || [])[1];
    if (m) return m;
    try {
      m = localStorage.getItem('bp-show');
    } catch (e) {
      m = null;
    }
    return m === 'devlog' || m === 'stories' ? m : 'all';
  }

  function saveMode(mode) {
    try {
      localStorage.setItem('bp-show', mode);
    } catch (e) {}
    try {
      var url = location.pathname + (mode === 'all' ? '' : '?show=' + mode) + location.hash;
      history.replaceState(null, '', url);
    } catch (e) {}
  }

  function isStory(p) {
    return p.k === 's';
  }

  function keep(p, mode) {
    if (mode === 'stories') return isStory(p);
    if (mode === 'devlog') return !isStory(p);
    return true;
  }

  function applyMode(mode) {
    var root = document.documentElement;
    root.classList.toggle('bp-only-stories', mode === 'stories');
    root.classList.toggle('bp-only-devlog', mode === 'devlog');
    var feed = document.querySelector('main.blog-feed');
    var note = document.querySelector('.bp-empty');
    if (note) note.remove();
    if (!feed || mode === 'all') return;
    var shown = Array.prototype.some.call(document.querySelectorAll('article.post'), function (a) {
      var story = a.getAttribute('data-kind') === 'story';
      return mode === 'stories' ? story : !story;
    });
    if (shown) return;
    note = document.createElement('p');
    note.className = 'bp-empty';
    note.textContent =
      mode === 'stories'
        ? 'No stories on this page. Pick one from the bar above, or show all posts.'
        : 'Only stories on this page. Pick a day from the bar above, or show all posts.';
    feed.insertBefore(note, feed.querySelector('article.post'));
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

  function build(index, page, mode) {
    var years = {};
    var order = [];
    var byMonth = {};
    var posts = index.posts.filter(function (p) {
      return keep(p, mode);
    });
    if (!posts.length) posts = index.posts;
    posts.forEach(function (p) {
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
        chip.className = 'bp-chip' + (here ? '' : ' bp-chip-off') + (isStory(p) ? ' bp-chip-story' : '');
        chip.textContent = chipLabel(p);
        var kind = isStory(p) ? 'Story: ' : '';
        chip.title = kind + (here ? p.t : p.t + ' (page ' + p.p + ')');
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
          chip.href = pageHref(p.p) + (mode === 'all' ? '' : '?show=' + mode) + '#' + encodeURIComponent(p.i);
          chip.setAttribute('aria-label', kind + p.t + ', on page ' + p.p);
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
      var stories = byMonth[key].filter(isStory).length;
      t.title = byMonth[key].length + (byMonth[key].length === 1 ? ' entry' : ' entries') +
        (stories && mode === 'all' ? ', ' + stories + (stories === 1 ? ' story' : ' stories') : '');
      if (stories && mode === 'all') t.classList.add('bp-month-story');
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

    var show = document.createElement('div');
    show.className = 'bp-show';
    show.setAttribute('role', 'group');
    show.setAttribute('aria-label', 'Show');
    var showTag = document.createElement('span');
    showTag.className = 'bp-bar-label';
    showTag.textContent = 'Show';
    show.appendChild(showTag);
    MODES.forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'bp-chip' + (m[0] === 'stories' ? ' bp-chip-story' : '');
      b.textContent = m[1];
      b.setAttribute('aria-pressed', m[0] === mode ? 'true' : 'false');
      b.addEventListener('click', function () {
        if (m[0] === mode) return;
        saveMode(m[0]);
        rebuild(index, page, m[0]);
      });
      show.appendChild(b);
    });
    monthRow.appendChild(show);

    bar.appendChild(monthRow);
    bar.appendChild(dayRow);

    // Open the month of the first visible post on this page, else the newest month in view.
    var openKey = order[0];
    var arts = document.querySelectorAll('article.post');
    outer: for (var a = 0; a < arts.length; a++) {
      for (var i = 0; i < posts.length; i++) {
        if (posts[i].i === arts[a].id) {
          openKey = monthKey(posts[i].d);
          break outer;
        }
      }
    }
    select(openKey, false);
    applyMode(mode);

    var first = document.querySelector('article.post');
    var feed = document.querySelector('main.blog-feed') || (first && first.parentElement);
    if (!feed) return;
    // A reserved slot in the page holds the bar's place before this script
    // runs, so inserting the bar does not push the feed down after first paint.
    var old = document.querySelector('nav.bp-bar');
    var slot = document.querySelector('.bp-bar-slot');
    if (old) {
      old.replaceWith(bar);
      document.documentElement.style.setProperty('--bp-bar-h', bar.offsetHeight + 'px');
      return;
    }
    if (slot) slot.replaceWith(bar); else feed.parentElement.insertBefore(bar, feed);

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

  function rebuild(index, page, mode) {
    build(index, page, mode);
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
    build(index, page, readMode());
    settle();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
