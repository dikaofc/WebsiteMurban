/* Murban Migavel — interactions (vanilla, no deps)
   Vite entry: theme, mobile menu, hide-on-scroll header, reveal-on-scroll,
   stats count-up, copy price, testimonial carousel */
(function () {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      themeBtn.classList.remove('spin');
      void themeBtn.offsetWidth; /* restart animasi */
      themeBtn.classList.add('spin');
      setTimeout(function () { themeBtn.classList.remove('spin'); }, 500);
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
    if (menuToggle) {
      menuToggle.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    }
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

  /* Scroll progress bar (dibuat via JS, tanpa ubah HTML) */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progressBar);

  /* 3D tilt scroll (kartu membership, foto grup) — bukan ikut mouse */
  const tiltEls = document.querySelectorAll('.tilt-3d');

  function tilt3d() {
    if (reduceMotion || !tiltEls.length) return;
    const vh = window.innerHeight;
    tiltEls.forEach(function (el) {
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2 - vh / 2;
      const p = Math.max(-1, Math.min(1, center / (vh / 2)));
      el.style.transform = 'perspective(1000px) rotateX(' + (p * -12).toFixed(2) + 'deg) translateY(' + (p * 28).toFixed(1) + 'px)';
    });
  }

  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 8);
    if (toTop) toTop.classList.toggle('visible', y > 600);
    if (fab) fab.classList.toggle('is-hidden', y > lastY && y > 300);
    /* hide header saat scroll ke bawah, muncul lagi saat scroll ke atas */
    const menuOpen = mobileMenu && mobileMenu.classList.contains('open');
    if (nav) nav.classList.toggle('is-hidden', y > lastY && y > 200 && !menuOpen);

    /* arah scroll untuk reveal 3D */
    root.dataset.scrollDir = y > lastY ? 'down' : 'up';

    /* progress bar */
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    lastY = y;
    tilt3d();
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
          /* arah masuk mengikuti arah scroll (3D) */
          entry.target.classList.add(root.dataset.scrollDir === 'up' ? 'reveal-up' : 'reveal-down');
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

  /* ---------- Hero title — kata per kata masuk 3D ---------- */
  (function splitHeroWords() {
    const split = function (el) {
      if (!el) return;
      const frag = document.createDocumentFragment();
      Array.prototype.forEach.call(el.childNodes, function (node) {
        if (node.nodeType === 3) {
          node.textContent.split(/(\s+)/).forEach(function (tok) {
            if (!tok) return;
            if (/^\s+$/.test(tok)) {
              frag.appendChild(document.createTextNode(' '));
            } else {
              const w = document.createElement('span');
              w.className = 'hw';
              w.textContent = tok;
              frag.appendChild(w);
            }
          });
        } else {
          const w = document.createElement('span');
          w.className = 'hw';
          w.appendChild(node.cloneNode(true));
          frag.appendChild(w);
        }
      });
      el.textContent = '';
      el.appendChild(frag);
      const words = el.querySelectorAll('.hw');
      words.forEach(function (w, i) {
        w.style.animationDelay = (0.1 + i * 0.08) + 's';
      });
    };
    split(document.querySelector('.hero-title'));
    split(document.querySelector('.dev-hero-title'));
  })();

  /* ---------- Page transitions (pindah tab / back) ---------- */
  (function initPageTransition() {
    /* animasi masuk: deteksi navigasi back/forward */
    try {
      const navType = window.performance && performance.getEntriesByType('navigation')[0];
      if (navType && navType.type === 'back_forward') document.body.classList.add('from-back');
    } catch (e) { /* noop */ }

    document.addEventListener('click', function (e) {
      const a = e.target.closest('a[href^="/"]');
      if (!a) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      e.preventDefault();
      document.body.classList.add('page-leave');
      setTimeout(function () { window.location.href = a.href; }, 170);
    });
  })();
})();
