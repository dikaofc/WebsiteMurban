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

  /* ---------- Mascot imut (semua halaman; ekstra banyak di root) ---------- */
  (function addMascots() {
    var svg =
      '<svg class="mascot-svg" viewBox="0 0 120 120">' +
      '<g class="sparkle s1"><path d="M12 20l1.7 4.3L18 26l-4.3 1.7L12 32l-1.7-4.3L6 26l4.3-1.7z" fill="currentColor"/></g>' +
      '<g class="sparkle s2"><path d="M106 16l1.5 3.7L111 21l-3.5 1.5L106 26l-1.5-3.5L101 21l3.5-1.3z" fill="currentColor"/></g>' +
      '<path class="mascot-body" d="M60 10C34 10 14 30 14 56c0 30 21 50 46 50s46-20 46-50c0-26-20-46-46-46z" fill="currentColor"/>' +
      '<ellipse cx="44" cy="104" rx="9" ry="5" fill="currentColor"/>' +
      '<ellipse cx="76" cy="104" rx="9" ry="5" fill="currentColor"/>' +
      '<g class="mascot-arm left"><path d="M40 63c-7-1-13-4-18-9" stroke="currentColor" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="20" cy="52" r="6" fill="currentColor"/></g>' +
      '<g class="mascot-arm right"><path d="M80 63c7-1 13-5 17-10" stroke="currentColor" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="99" cy="50" r="6" fill="currentColor"/></g>' +
      '<path class="mascot-eye e1" d="M40 52q7-9 15 0" stroke-width="4.5" stroke-linecap="round" fill="none"/>' +
      '<path class="mascot-eye e2" d="M65 52q7-9 15 0" stroke-width="4.5" stroke-linecap="round" fill="none"/>' +
      '<ellipse class="mascot-blush" cx="30" cy="63" rx="6.5" ry="3.6"/>' +
      '<ellipse class="mascot-blush" cx="90" cy="63" rx="6.5" ry="3.6"/>' +
      '<path class="mascot-smile" d="M53 71q7 7 14 0" stroke-width="4" stroke-linecap="round" fill="none"/>' +
      '</svg>';

    function make(opts) {
      var el = document.createElement('div');
      el.className = 'mascot';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = svg;
      var s = 'width:' + (opts.w || 'clamp(72px, 9vw, 116px)') + ';';
      if (opts.pos) s += opts.pos + ';';
      if (opts.delay) s += 'animation-delay:' + opts.delay + ';';
      el.setAttribute('style', s);
      return el;
    }
    function addTo(selector, opts) {
      document.querySelectorAll(selector).forEach(function (slot) {
        slot.appendChild(make(opts || {}));
      });
    }

    /* Semua halaman: hero/page-hero + CTA */
    addTo('.hero, .page-hero', {});
    addTo('.cta-card', { w: 'clamp(56px, 6vw, 84px)', pos: 'bottom:14px;right:14px' });

    /* Root page (/): tambahan biar rame */
    if (document.querySelector('.hero')) {
      addTo('.hero', { w: 'clamp(52px, 5vw, 66px)', pos: 'top:clamp(110px, 15vh, 160px);left:clamp(12px, 3vw, 36px)', delay: '.6s' });
      addTo('.section-stats', { w: 'clamp(56px, 5.5vw, 76px)', pos: 'bottom:16px;right:clamp(14px, 4vw, 48px)', delay: '1.1s' });
      addTo('.price-wrap', { w: 'clamp(46px, 5vw, 64px)', pos: 'bottom:-16px;right:-8px', delay: '.3s' });
      addTo('.testi', { w: 'clamp(46px, 5vw, 64px)', pos: 'bottom:60px;left:clamp(0px, 2vw, 28px)', delay: '.9s' });
      addTo('.footer', { w: 'clamp(44px, 4vw, 58px)', pos: 'bottom:20px;left:clamp(16px, 4vw, 52px)', delay: '1.5s' });
    }
  })();

  /* ============================================================
     Clingy & imut — mascot ngomong, reaktif, hati & confetti,
     cursor trail hati, bar pelukan sticky, stiker section
     ============================================================ */
  (function clingyStuff() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(pointer: fine)').matches;

    /* --- util: spawn elemen sekali pakai --- */
    function spawn(tag, cls, css, life) {
      var el = document.createElement(tag);
      el.className = cls;
      if (css) el.setAttribute('style', css);
      document.body.appendChild(el);
      if (life) setTimeout(function () { el.remove(); }, life);
      return el;
    }

    /* --- Hati & confetti: burst di titik (x, y) --- */
    var BURST_EMOJI = ['💖', '💗', '🩷', '✨', '⭐', '🎉', '💫'];
    function burstAt(x, y) {
      if (reduce) return;
      var n = 10 + Math.floor(Math.random() * 6);
      for (var i = 0; i < n; i++) {
        var e = BURST_EMOJI[i % BURST_EMOJI.length];
        var ang = (Math.PI * 2 * i) / n + Math.random() * 0.6;
        var dist = 46 + Math.random() * 64;
        var el = spawn('span', 'burst-piece',
          'left:' + x + 'px;top:' + y + 'px;font-size:' + (13 + Math.random() * 14) + 'px;' +
          '--bx:' + Math.round(Math.cos(ang) * dist) + 'px;' +
          '--by:' + Math.round(Math.sin(ang) * dist) + 'px;' +
          '--sc:' + (0.7 + Math.random() * 0.8) + ';' +
          '--rot:' + Math.round((Math.random() - 0.5) * 220) + 'deg;',
          1000);
        el.textContent = e;
      }
    }

    /* Burst saat tombol CTA / join diklik */
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn, .fab, .price-chat');
      if (!btn) return;
      var r = btn.getBoundingClientRect();
      burstAt(r.left + r.width / 2, r.top + r.height / 2);
    });

    /* --- Cursor trail hati (desktop, pointer halus) --- */
    if (finePointer && !reduce) {
      var trailLock = false;
      var TRAIL = ['💖', '🤍', '💗'];
      document.addEventListener('mousemove', function (e) {
        if (trailLock) return;
        trailLock = true;
        requestAnimationFrame(function () {
          trailLock = false;
          var el = spawn('span', 'trail-heart',
            'left:' + (e.clientX - 8) + 'px;top:' + (e.clientY - 8) + 'px;font-size:' + (11 + Math.random() * 8) + 'px;' +
            '--tx:' + Math.round((Math.random() - 0.5) * 26) + 'px;' +
            '--ty:' + Math.round((Math.random() - 0.5) * 18) + 'px;' +
            '--rot:' + Math.round((Math.random() - 0.5) * 120) + 'deg;',
            900);
          el.textContent = TRAIL[Math.floor(Math.random() * TRAIL.length)];
        });
      });
    }

    /* --- Mascot ngomong + reaktif --- */
    var TALK = [
      'Halo kak! 👋', 'Mau join murban? 🫶', 'Gaskeun deh! 💪',
      'Aku imut kan? 🥺', 'Murban aja dulu 🤭', 'Tenang, aman kok 😌'
    ];
    var mascots = document.querySelectorAll('.mascot');
    mascots.forEach(function (m, idx) {
      /* bubble */
      var bubble = document.createElement('span');
      bubble.className = 'mascot-bubble';
      bubble.setAttribute('aria-hidden', 'true');
      m.appendChild(bubble);
      var bubbleTimer = null;

      function say(text, dur) {
        bubble.textContent = text;
        bubble.classList.add('show');
        if (bubbleTimer) clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(function () {
          bubble.classList.remove('show');
        }, dur || 2800);
      }

      /* ngomong sendiri bergantian (delay per mascot) */
      if (!reduce) {
        var cycle = setInterval(function () {
          say(TALK[Math.floor(Math.random() * TALK.length)]);
        }, 5200 + idx * 900);
        /* stop saat halaman disembunyikan */
        document.addEventListener('visibilitychange', function () {
          if (document.hidden && cycle) clearInterval(cycle);
        });
      }

      /* reaktif: klik → bounce + burst hati + ngomong */
      m.addEventListener('click', function (e) {
        e.stopPropagation();
        var r = m.getBoundingClientRect();
        burstAt(r.left + r.width / 2, r.top + r.height / 2);
        m.classList.remove('react');
        void m.offsetWidth;
        m.classList.add('react');
        setTimeout(function () { m.classList.remove('react'); }, 600);
        say(TALK[Math.floor(Math.random() * TALK.length)], 3200);
      });
    });

    /* --- Bar pelukan sticky (floating pill, kiri-bawah) --- */
    (function hugBar() {
      var MSGS = [
        '🫂 Butuh pelukan?', '💪 Semangat ya kak!', '🍚 Udah makan belum?',
        '🥺 Jangan lupa istirahat', '✨ Kamu hebat!', '🤗 Gabung yuk, dijamin aman'
      ];
      var bar = document.createElement('div');
      bar.className = 'hug-bar';
      bar.setAttribute('role', 'status');
      var emoji = document.createElement('span');
      emoji.className = 'hug-emoji';
      emoji.textContent = '🫂';
      var text = document.createElement('span');
      text.className = 'hug-text';
      text.textContent = MSGS[0];
      var close = document.createElement('button');
      close.className = 'hug-close';
      close.type = 'button';
      close.setAttribute('aria-label', 'Tutup');
      close.textContent = '✕';
      bar.appendChild(emoji);
      bar.appendChild(text);
      bar.appendChild(close);
      document.body.appendChild(bar);

      var i = 0;
      setInterval(function () {
        i = (i + 1) % MSGS.length;
        text.textContent = MSGS[i];
        emoji.textContent = MSGS[i].slice(0, 2);
        bar.style.animation = 'none';
        void bar.offsetWidth;
        bar.style.animation = '';
      }, 5200);
      close.addEventListener('click', function () {
        bar.classList.add('gone');
        setTimeout(function () { bar.remove(); }, 350);
      });
    })();

    /* --- Stiker section imut (di header tiap section) --- */
    (function sectionStickers() {
      if (reduce) return;
      var STICKERS = ['🥺', '🫶', '✨', '💖', '🤭', '😌', '🫂', '💫', '😊', '🥰'];
      var heads = document.querySelectorAll('.section-head');
      heads.forEach(function (h, idx) {
        var s = document.createElement('span');
        s.className = 'sec-sticker';
        s.setAttribute('aria-hidden', 'true');
        s.textContent = STICKERS[idx % STICKERS.length];
        s.style.animationDelay = (idx % 4) * 0.5 + 's';
        h.appendChild(s);
      });
    })();
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
