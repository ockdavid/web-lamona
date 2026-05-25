/* la Mona — main.js (IIFE, no ES modules) */
(function () {
  'use strict';

  /* ── helpers ─────────────────────────────── */
  function safe(fn, label) {
    try { fn(); }
    catch (e) { console.warn('[laMona]', label, e); }
  }

  /* ── nav: sticky glass + hamburger ────────── */
  function initNav() {
    var nav   = document.getElementById('nav');
    var btn   = document.querySelector('[data-hamburger]');
    var menu  = document.querySelector('[data-mobile-menu]');
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (btn && menu) {
      btn.addEventListener('click', function () {
        var open = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      /* close on nav link click */
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          menu.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  /* ── filter tabs ─────────────────────────── */
  function initFilter() {
    var btns  = document.querySelectorAll('[data-filter]');
    var cards = document.querySelectorAll('[data-cat]');
    if (!btns.length || !cards.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');

        /* expand catalog if still collapsed */
        document.querySelectorAll('.cat-collapsed').forEach(function (c) {
          c.classList.remove('cat-collapsed');
        });
        var expandWrap = document.querySelector('.catalog-expand-wrap');
        if (expandWrap) expandWrap.remove();

        /* update active tab */
        btns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        /* show / hide cards */
        cards.forEach(function (card) {
          var cat = card.getAttribute('data-cat');
          var show = filter === 'todos' || cat === filter;
          card.classList.toggle('hidden', !show);
        });
      });
    });
  }

  /* ── catalog expand (show first 12, rest on demand) ── */
  function initCatalogExpand() {
    var cards = Array.from(document.querySelectorAll('[data-cat]'));
    var LIMIT = 12;
    if (cards.length <= LIMIT) return;

    var toHide = cards.slice(LIMIT);
    toHide.forEach(function (c) { c.classList.add('cat-collapsed'); });

    var grid = document.getElementById('product-grid');
    if (!grid) return;

    var remaining = toHide.length;
    var wrap = document.createElement('div');
    wrap.className = 'catalog-expand-wrap';

    var btn = document.createElement('button');
    btn.className = 'btn btn-outline catalog-expand-btn';
    btn.textContent = 'Ver las ' + remaining + ' piezas restantes ↓';
    wrap.appendChild(btn);
    grid.after(wrap);

    btn.addEventListener('click', function () {
      toHide.forEach(function (c) { c.classList.remove('cat-collapsed'); });
      wrap.remove();
    });
  }

  /* ── reveal on scroll (IntersectionObserver) */
  function initReveals() {
    var targets = document.querySelectorAll('[data-reveal], .product-card');
    if (!targets.length) return;

    /* safety timeout — reveal everything after 6 s */
    var safetyTimer = setTimeout(function () {
      targets.forEach(function (el) { el.classList.add('revealed'); });
    }, 6000);

    if (!('IntersectionObserver' in window)) {
      clearTimeout(safetyTimer);
      targets.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }

    var staggerIndex = 0;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;

        /* stagger product cards */
        if (el.classList.contains('product-card') && !el.classList.contains('hidden')) {
          el.style.transitionDelay = (staggerIndex % 8) * 55 + 'ms';
          staggerIndex++;
        }

        el.classList.add('revealed');
        io.unobserve(el);
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { io.observe(el); });

    /* once everything revealed, clear safety */
    setTimeout(function () { clearTimeout(safetyTimer); }, 6100);
  }

  /* ── counter animation ────────────────────── */
  function initCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el  = entry.target;
        var end = parseInt(el.getAttribute('data-count'), 10);
        var dur = 1400;
        var start = performance.now();
        io.unobserve(el);

        function tick(now) {
          var progress = Math.min((now - start) / dur, 1);
          var eased    = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * end);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ── GSAP scroll animations (optional) ──── */
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    /* parallax on hero-mesh */
    var mesh = document.querySelector('.hero-mesh');
    if (mesh) {
      gsap.to(mesh, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });
    }

    /* slide-in for ig-card on desktop */
    var card = document.querySelector('.hero-card');
    if (card && window.innerWidth >= 960) {
      gsap.from(card, {
        x: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.25,
      });
    }
  }

  /* ── tilt on product cards ───────────────── */
  function initTilt() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.product-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect   = card.getBoundingClientRect();
        var cx     = rect.left + rect.width  / 2;
        var cy     = rect.top  + rect.height / 2;
        var dx     = (e.clientX - cx) / (rect.width  / 2);
        var dy     = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = 'translateY(-5px) rotateX(' + (-dy * 5) + 'deg) rotateY(' + (dx * 5) + 'deg)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ── personalizer live preview ──────────────────── */
  function initPersonalizer() {
    var input       = document.getElementById('perso-input');
    var nameDisplay = document.getElementById('perso-name-display');
    var pendant     = document.getElementById('perso-pendant');
    var stage       = pendant && pendant.closest('.perso-stage');
    var controls    = document.querySelector('.perso-controls');
    var metalLabel  = document.getElementById('perso-metal-label');
    var joyaLabel   = document.getElementById('perso-joya-label');
    var waBtn       = document.getElementById('perso-wa-btn');
    if (!input || !nameDisplay || !pendant) return;

    var metal  = 'oro';
    var chain  = 'rolo';
    var joya   = 'collar';
    var fuente = 'cursiva';
    var dije   = 'circulo';

    var METAL_BG = {
      plata: 'radial-gradient(circle at 35% 30%, #FAFAF8 0%, #DDDAD2 38%, #A8A39B 70%, #6F6A62 100%)',
      oro:   'radial-gradient(circle at 35% 30%, #FBF1E0 0%, #E2C595 38%, #B8985F 70%, #8C6E3F 100%)',
      rose:  'radial-gradient(circle at 35% 30%, #F8E4DA 0%, #E2BCA8 38%, #B68574 70%, #8A5D4E 100%)'
    };
    var FONT_COLOR  = { plata: '#363330', oro: '#4A371C', rose: '#4D2A20' };
    var METAL_NAMES = { plata: 'Plata 925', oro: 'Baño de oro', rose: 'Oro rosa' };
    var CHAIN_NAMES = { rolo: 'Rolo', veneciana: 'Veneciana', figaro: 'Fígaro' };
    var JOYA_NAMES  = { collar: 'Collar', anillo: 'Anillo', pulsera: 'Pulsera' };
    var FUENTE_NAMES = { cursiva: 'cursiva', imprenta: 'imprenta' };

    function update() {
      var name = input.value || '—';
      nameDisplay.textContent = name;

      /* font size — synchronous DOM fit (scrollWidth forces reflow each step) */
      var isBand = joya === 'anillo' || joya === 'pulsera';
      if (isBand) {
        nameDisplay.style.fontSize = '20px';
      } else {
        /* use 68% of diameter; fall back to 136px if pendant hasn't painted yet */
        var avail = (pendant.offsetWidth * 0.68) || 136;
        var len = (input.value || '').length;
        var maxSz = fuente === 'cursiva'
          ? (len <= 4 ? 56 : len <= 7 ? 50 : 48)
          : (len <= 4 ? 42 : len <= 7 ? 38 : 36);
        var sz = maxSz;
        nameDisplay.style.fontSize = sz + 'px';
        while (nameDisplay.scrollWidth > avail && sz > 12) {
          sz -= 1;
          nameDisplay.style.fontSize = sz + 'px';
        }
      }

      /* font style */
      nameDisplay.classList.toggle('fuente-imprenta', fuente === 'imprenta');
      nameDisplay.style.fontStyle = fuente === 'cursiva' ? 'italic' : 'normal';

      /* metal */
      pendant.style.background = METAL_BG[metal];
      nameDisplay.style.color  = FONT_COLOR[metal];
      if (metalLabel) metalLabel.textContent = metal.toUpperCase();

      /* joya type → data attribute drives CSS */
      if (stage)    stage.setAttribute('data-joya', joya);
      if (controls) controls.setAttribute('data-joya', joya);
      if (joyaLabel) joyaLabel.textContent = JOYA_NAMES[joya].toUpperCase();

      /* dije shape (only for collar) */
      pendant.classList.remove('dije-circulo', 'dije-corazon', 'dije-ovalo');
      if (joya === 'collar') pendant.classList.add('dije-' + dije);

      /* whatsapp message */
      if (waBtn) {
        var extras = joya === 'collar'
          ? ', cadena ' + CHAIN_NAMES[chain] + ', dije ' + dije
          : '';
        var txt = 'Hola! Quiero personalizar un ' + JOYA_NAMES[joya].toLowerCase()
                + ' con: "' + input.value + '" — '
                + METAL_NAMES[metal] + ', fuente ' + FUENTE_NAMES[fuente] + extras + ' 🌸';
        waBtn.href = 'https://wa.me/51997918216?text=' + encodeURIComponent(txt);
      }
    }

    function makeChipListener(selector, stateKey, stateObj) {
      document.querySelectorAll(selector).forEach(function (btn) {
        btn.addEventListener('click', function () {
          stateObj[stateKey] = btn.getAttribute(selector.replace('[', '').replace(']', '').split('=')[0].replace('[',''));
          /* simpler: just read the attribute */
          var attr = btn.getAttributeNames().find(function(a){ return a.startsWith('data-'); });
          stateObj[stateKey] = btn.getAttribute(attr);
          document.querySelectorAll(selector).forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          update();
        });
      });
    }

    input.addEventListener('input', update);

    document.querySelectorAll('[data-joya]').forEach(function (btn) {
      if (!btn.classList.contains('perso-chip')) return;
      btn.addEventListener('click', function () {
        joya = btn.getAttribute('data-joya');
        document.querySelectorAll('.perso-chip[data-joya]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        update();
      });
    });

    document.querySelectorAll('[data-fuente]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        fuente = btn.getAttribute('data-fuente');
        document.querySelectorAll('[data-fuente]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        update();
      });
    });

    document.querySelectorAll('[data-metal]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        metal = btn.getAttribute('data-metal');
        document.querySelectorAll('[data-metal]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        update();
      });
    });

    document.querySelectorAll('[data-dije]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        dije = btn.getAttribute('data-dije');
        document.querySelectorAll('[data-dije]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        update();
      });
    });

    document.querySelectorAll('[data-chain]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        chain = btn.getAttribute('data-chain');
        document.querySelectorAll('[data-chain]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        update();
      });
    });

    update();

    /* re-fit once web fonts are loaded (avoids fallback-font miscalculation) */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(update);
    }

    /* re-fit when the stage scrolls into view (offsetWidth may have been 0 on boot) */
    if (stage && 'IntersectionObserver' in window) {
      var stageIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          update();
          stageIO.unobserve(entry.target);
        });
      }, { threshold: 0.1 });
      stageIO.observe(stage);
    }
  }

  /* ── boot ────────────────────────────────── */
  function boot() {
    safe(initNav,            'initNav');
    safe(initCatalogExpand,  'initCatalogExpand');
    safe(initFilter,         'initFilter');
    safe(initReveals,        'initReveals');
    safe(initCounters,       'initCounters');
    safe(initGSAP,           'initGSAP');
    safe(initTilt,           'initTilt');
    safe(initPersonalizer,   'initPersonalizer');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

}());
