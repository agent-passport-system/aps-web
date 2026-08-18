
var APS_LANDING = {
  props: { accent: "#B6FF45", motion: true, snapScroll: true, showCounters: true },
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

    let cur = -1;
    this.sync = () => {
      const mid = sc.scrollTop + sc.clientHeight / 2;
      let idx = 0;
      for (let i = 0; i < secs.length; i++) {
        if (secs[i].offsetTop <= mid) idx = i;
      }
      if (idx === cur) return;
      cur = idx;
      const sec = secs[idx];
      const name = (sec.getAttribute('data-screen-label') || '').replace(/^\d+\s*/, '');
      if (countEl) countEl.textContent = ('0' + (idx + 1)).slice(-2);
      if (labelEl) labelEl.textContent = name;
      if (barEl) barEl.style.width = ((idx + 1) / secs.length * 100) + '%';
      dots.forEach(function (d, i) { d.className = i === idx ? 'on' : ''; });
      const rgb = (getComputedStyle(sec).backgroundColor.match(/\d+/g) || [0, 0, 0]).map(Number);
      const light = (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) > 140;
      root.setProperty('--hud-fg', light ? '#11151A' : '#E9ECDB');
      root.setProperty('--hud-sub', light ? '#6F7377' : '#878B78');
      root.setProperty('--hud-dot', light ? '#C9C4B7' : '#33372A');
      root.setProperty('--hud-track', light ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.06)');
      root.setProperty('--hud-accent', light ? '#11151A' : (this.props.accent || '#B6FF45'));
      root.setProperty('--hud-glow', light ? 'none' : '0 0 12px rgba(182,255,69,.5)');
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
    root.style.setProperty('--aps-accent', this.props.accent || '#B6FF45');
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
