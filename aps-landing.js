
var APS_LANDING = {
  // accent is read from CSS at mount so the two palettes stay in one place;
  // an explicit value here still wins, which is what the prop is for.
  props: { accent: null, motion: true, snapScroll: true, showCounters: true },

  // Read a custom property off :root. The theme switch rewrites what these
  // resolve to, so every read is done live rather than cached at load.
  css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); },
  accent() { return this.props.accent || this.css('--acc-hero'); },
  mount() {
    this.scroller = document.querySelector('[data-sec]') ? document.querySelector('[data-sec]').parentNode : null;
    this.fit = () => {
      const w = window.innerWidth, h = window.innerHeight - 96;
      const s = Math.min(w / 1440, h / 810, 1.35);
      document.documentElement.style.setProperty('--aps-s', String(Math.max(s, 0.2)));
    };
    this.fit();
    window.addEventListener('resize', this.fit);
    this.apply();
    this.play();
    this.hud();
    this.watchTheme();
  },

  // data-theme changes under us when the toggle is used, so re-read every
  // colour the script pushed into custom properties.
  watchTheme() {
    if (!('MutationObserver' in window)) return;
    const self = this;
    new MutationObserver(function () {
      self.apply();
      if (self.sync) { self.cur = -1; self.sync(true); }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  },

  // Fixed HUD: counter + label, dot rail, progress bar, driven by the
  // section whose box holds the viewport centre.
  hud() {
    const secs = Array.prototype.slice.call(document.querySelectorAll('[data-sec]'));
    const sc = this.scroller;
    if (!secs.length || !sc) return;
    const countEl = document.querySelector('[data-hud-count]');
    const labelEl = document.querySelector('[data-hud-label]');
    const barEl = document.querySelector('[data-hud-bar]');
    const dots = Array.prototype.slice.call(document.querySelectorAll('[data-dot]'));
    const root = document.documentElement.style;
    const goTo = (i) => {
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      sc.scrollTo({ top: secs[i].offsetTop, behavior: reduce ? 'auto' : 'smooth' });
    };
    dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); }); });
    const hint = document.querySelector('[data-scroll-hint]');
    if (hint) hint.addEventListener('click', function () { goTo(Math.min(1, secs.length - 1)); });

    this.cur = -1;
    this.sync = (force) => {
      const mid = sc.scrollTop + sc.clientHeight / 2;
      let idx = 0;
      for (let i = 0; i < secs.length; i++) {
        if (secs[i].offsetTop <= mid) idx = i;
      }
      if (idx === this.cur && !force) return;
      this.cur = idx;
      const sec = secs[idx];
      const name = (sec.getAttribute('data-screen-label') || '').replace(/^\d+\s*/, '');
      if (countEl) countEl.textContent = ('0' + (idx + 1)).slice(-2);
      if (labelEl) labelEl.textContent = name;
      if (barEl) barEl.style.width = ((idx + 1) / secs.length * 100) + '%';
      dots.forEach(function (d, i) { d.className = i === idx ? 'on' : ''; });
      const rgb = (getComputedStyle(sec).backgroundColor.match(/\d+/g) || [0, 0, 0]).map(Number);
      const light = (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) > 140;
      // The slide under the HUD decides which of the two sets applies; the
      // theme decides what each set contains. Both live in aps-v2.css.
      const k = light ? '--hud-b-' : '--hud-a-';
      root.setProperty('--hud-fg', this.css(k + 'fg'));
      root.setProperty('--hud-sub', this.css(k + 'sub'));
      root.setProperty('--hud-dot', this.css(k + 'dot'));
      root.setProperty('--hud-track', this.css(k + 'track'));
      root.setProperty('--hud-accent', light ? this.css('--hud-b-acc') : this.accent());
      root.setProperty('--hud-glow', this.css(k + 'glow'));
    };
    this.sync();
    sc.addEventListener('scroll', this.sync, { passive: true });
    window.addEventListener('resize', this.sync);
  },

  componentDidUpdate() { this.apply(); },
  componentWillUnmount() {
    window.removeEventListener('resize', this.fit);
    if (this.sync) { window.removeEventListener('resize', this.sync); if (this.scroller) this.scroller.removeEventListener('scroll', this.sync); }
    if (this.io) this.io.disconnect();
  },

  apply() {
    const root = document.documentElement;
    root.style.setProperty('--aps-accent', this.accent());
    const on = this.props.showCounters !== false;
    // The fixed HUD marks the slide now, so the in-slide numbers stay off.
    document.querySelectorAll('[data-counter]').forEach(function (el) { el.style.display = 'none'; });
    document.querySelectorAll('.hud').forEach(function (el) { el.style.visibility = on ? 'visible' : 'hidden'; });
    if (this.scroller) this.scroller.style.scrollSnapType = this.props.snapScroll === false ? 'none' : 'y mandatory';
  },

  // Force the finished state, independent of any animation clock.
  runAll() {
    document.querySelectorAll('[data-a]').forEach(function (el) {
      el.style.animationPlayState = 'running';
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  },

  // Motion is additive: the hidden start state only exists once we know the
  // document timeline is actually advancing, so a stalled clock can never
  // leave the page blank.
  play() {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.props.motion === false || reduce || !('IntersectionObserver' in window)) return;
    const self = this;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        const t = document.timeline && document.timeline.currentTime;
        if (!(t > 0)) return;
        self.arm();
      });
    });
  },

  arm() {
    const secs = Array.prototype.slice.call(document.querySelectorAll('[data-sec]'));
    if (!secs.length) return;
    // Let the first section play immediately so nothing flashes hidden.
    if (secs[0]) secs[0].querySelectorAll('[data-a]').forEach(function (el) { el.style.animationPlayState = 'running'; });
    const root = document.documentElement.style;
    root.setProperty('--apsRiseN', 'apsRise');
    root.setProperty('--apsFadeN', 'apsFade');
    root.setProperty('--apsWipeN', 'apsWipe');
    root.setProperty('--apsDriftN', 'apsDrift');
    this.io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.intersectionRatio > 0.35) {
          e.target.querySelectorAll('[data-a]').forEach(function (el) { el.style.animationPlayState = 'running'; });
          obs.unobserve(e.target);
        }
      });
    }, { threshold: [0, 0.35, 0.6], root: this.scroller || null });
    const io = this.io;
    secs.forEach(function (s) { io.observe(s); });
  },

  renderVals() { return {}; }
};


document.addEventListener('DOMContentLoaded', function () { APS_LANDING.mount(); });
