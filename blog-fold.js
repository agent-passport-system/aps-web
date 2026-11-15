// Blog listing: show each entry as its title, date, picture and first paragraph, with a button that opens the rest.
// The full text stays in the page, so links to an entry and search engines see everything.
(function () {
  var feed = document.querySelector('main.blog-feed');
  if (!feed) return;

  var css = document.createElement('style');
  css.textContent =
    '.bf-rest[hidden]{display:none}' +
    '.bf-btn{display:inline-block;width:max-content;max-width:100%;justify-self:start;align-self:flex-start;margin:14px 0 6px;padding:8px 14px 9px;font-family:var(--pixel,"Jersey 15",sans-serif);font-size:23px;line-height:1;color:#111;background:#FFF200;border:3px solid #111;box-shadow:5px 5px 0 #0A5CFF;cursor:pointer}' +
    '.bf-btn:hover{background:#0A5CFF;color:#fff;box-shadow:5px 5px 0 #111}' +
    '.bf-btn:active{transform:translate(5px,5px);box-shadow:none}' +
    '.bf-btn:focus-visible{outline:3px solid #0A5CFF;outline-offset:3px}';
  document.head.appendChild(css);

  function fold(post) {
    if (post.getAttribute('data-bf')) return;
    var kids = Array.prototype.slice.call(post.children);
    // keep everything up to and including the first real paragraph
    var cut = -1;
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (k.tagName === 'P' && !k.classList.contains('post-date') && k.textContent.trim().length > 40) { cut = i; break; }
    }
    if (cut < 0 || kids.length - cut - 1 < 2) return;   // short entry, nothing to fold
    var rest = document.createElement('div');
    rest.className = 'bf-rest';
    rest.hidden = true;
    kids.slice(cut + 1).forEach(function (k) { rest.appendChild(k); });
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bf-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = 'Read the full entry';
    btn.addEventListener('click', function () { set(post, rest.hidden); });
    post.appendChild(btn);
    post.appendChild(rest);
    post.setAttribute('data-bf', '1');
  }

  function set(post, open) {
    var rest = post.querySelector('.bf-rest');
    var btn = post.querySelector('.bf-btn');
    if (!rest || !btn) return;
    rest.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? 'Fold the entry' : 'Read the full entry';
    if (open) post.insertBefore(rest, btn); else post.appendChild(rest);
  }

  function openTarget() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id) return;
    var el = document.getElementById(id);
    var post = el && el.closest ? el.closest('article.post') : null;
    if (post) { set(post, true); if (el !== post) el.scrollIntoView(); }
  }

  Array.prototype.forEach.call(feed.querySelectorAll('article.post'), fold);
  openTarget();
  window.addEventListener('hashchange', openTarget);
})();
