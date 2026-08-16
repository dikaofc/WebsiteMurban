/* Murban Migavel — interactions (vanilla, no deps)
   Vite entry: theme, mobile menu, hide-on-scroll header, reveal-on-scroll,
   stats count-up, copy price, testimonial carousel */
(function () {
  'use strict';

  const root = document.documentElement;

  /* ---------- Theme (light default, dark/light toggle) ---------- */
  const themeBtn = document.getElementById('themeToggle');

  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('murban-theme', theme); } catch (e) { /* private mode */ }
  }

  (function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem('murban-theme'); } catch (e) {}
    applyTheme(saved || systemTheme());
  })();

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* Keep in sync if the OS theme changes while no explicit choice was made */
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
      let saved = null;
      try { saved = localStorage.getItem('murban-theme'); } catch (err) {}
      if (!saved) applyTheme(e.matches ? 'light' : 'dark');
    });
  }

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  function setMenu(open) {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    if (menuToggle) menuToggle.setAttribute('aria-expanded', String(open));
    if (menuToggle) menuToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      setMenu(!mobileMenu.classList.contains('open'));
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ---------- Nav shadow, back-to-top, fab hide on scroll ---------- */
  const nav = document.getElementById('nav');
  const toTop = document.getElementById('toTop');
  const fab = document.querySelector('.fab');
  let lastY = 0;

  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 8);
    if (toTop) toTop.classList.toggle('visible', y > 600);
    if (fab) fab.classList.toggle('is-hidden', y > lastY && y > 300);
    /* hide header saat scroll ke bawah, muncul lagi saat scroll ke atas */
    const menuOpen = mobileMenu && mobileMenu.classList.contains('open');
    if (nav) nav.classList.toggle('is-hidden', y > lastY && y > 200 && !menuOpen);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el, i) {
      if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', (i % 4) * 0.06 + 's');
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Stats count-up ---------- */
  const statEls = document.querySelectorAll('[data-count]');

  function statFormat(n, el) {
    const s = el.getAttribute('data-format') === 'id'
      ? n.toLocaleString('id-ID')
      : String(n);
    return s + (el.getAttribute('data-suffix') || '');
  }

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const dur = 1200;
    let t0 = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
      el.textContent = statFormat(Math.round(target * eased), el);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (statEls.length && 'IntersectionObserver' in window) {
    const statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (reduceMotion) {
            entry.target.textContent = statFormat(parseInt(entry.target.getAttribute('data-count'), 10) || 0, entry.target);
          } else {
            animateCount(entry.target);
          }
          statIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    statEls.forEach(function (el) { statIO.observe(el); });
  }

  /* ---------- Copy price ---------- */
  const copyBtn = document.getElementById('copyPrice');

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
  }

  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  if (copyBtn) {
    const copyIcon = copyBtn.querySelector('svg');
    const copyIconDefault = copyIcon ? copyIcon.innerHTML : '';
    const checkIcon = '<path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';

    copyBtn.addEventListener('click', function () {
      const text = copyBtn.getAttribute('data-copy') || 'Rp 10.000';
      copyText(text, function () {
        const label = copyBtn.querySelector('.btn-copy-label');
        if (label) label.textContent = 'Tersalin';
        if (copyIcon) copyIcon.innerHTML = checkIcon;
        copyBtn.classList.add('copied');
        setTimeout(function () {
          copyBtn.classList.remove('copied');
          if (label) label.textContent = 'Salin harga';
          if (copyIcon) copyIcon.innerHTML = copyIconDefault;
        }, 1600);
      });
    });
  }

  /* ---------- Testimonial carousel (scroll-snap + dots + auto) ---------- */
  const vp = document.getElementById('testiViewport');
  const track = document.getElementById('testiTrack');

  if (vp && track) {
    const prevBtn = document.getElementById('testiPrev');
    const nextBtn = document.getElementById('testiNext');
    const dotsWrap = document.getElementById('testiDots');
    const cards = track.children;
    let autoTimer = null;

    function stepWidth() {
      const c = cards[0];
      return c ? c.getBoundingClientRect().width + 16 : 0;
    }

    function pageCount() {
      const n = Math.max(1, Math.ceil(track.scrollWidth / vp.clientWidth));
      return Math.min(cards.length, n);
    }

    function refreshDots() {
      if (!dotsWrap) return;
      const dots = dotsWrap.children;
      const idx = Math.min(Math.round(vp.scrollLeft / stepWidth()), dots.length - 1);
      for (let i = 0; i < dots.length; i++) dots[i].classList.toggle('active', i === idx);
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      const n = pageCount();
      for (let i = 0; i < n; i++) {
        (function (idx) {
          const d = document.createElement('button');
          d.type = 'button';
          d.setAttribute('aria-label', 'Ke testimoni ' + (idx + 1));
          d.addEventListener('click', function () { go(idx); });
          dotsWrap.appendChild(d);
        })(i);
      }
      refreshDots();
    }

    function go(i) {
      const max = Math.max(0, vp.scrollWidth - vp.clientWidth);
      vp.scrollTo({ left: Math.min(i * stepWidth(), max), behavior: 'smooth' });
    }

    function autoStep() {
      const max = vp.scrollWidth - vp.clientWidth;
      if (vp.scrollLeft >= max - 2) go(0);
      else vp.scrollBy({ left: stepWidth(), behavior: 'smooth' });
    }

    function startAuto() { stopAuto(); autoTimer = setInterval(autoStep, 5200); }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

    if (prevBtn) prevBtn.addEventListener('click', function () {
      go(Math.max(0, Math.round(vp.scrollLeft / stepWidth()) - 1));
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      go(Math.min(pageCount() - 1, Math.round(vp.scrollLeft / stepWidth()) + 1));
    });

    vp.addEventListener('scroll', refreshDots, { passive: true });
    vp.addEventListener('mouseenter', stopAuto);
    vp.addEventListener('mouseleave', startAuto);
    vp.addEventListener('focusin', stopAuto);
    vp.addEventListener('focusout', startAuto);
    vp.addEventListener('touchstart', stopAuto, { passive: true });
    vp.addEventListener('touchend', startAuto, { passive: true });
    window.addEventListener('resize', buildDots, { passive: true });

    buildDots();
    startAuto();
  }
})();
