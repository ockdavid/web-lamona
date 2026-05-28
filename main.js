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

  /* ── cart ────────────────────────────────── */
  function initCart() {
    var WA   = '51997918216';
    var PRICE = 50;
    var cart  = [];

    var overlay    = document.getElementById('cart-overlay');
    var cartBody   = document.getElementById('cart-body');
    var cartFooter = document.getElementById('cart-footer');
    var totalAmt   = document.getElementById('cart-total-amt');
    var countBadge = document.getElementById('cart-count-badge');
    var navBadge   = document.getElementById('nav-cart-badge');
    var navBtn     = document.getElementById('nav-cart-btn');
    var backBtn    = document.getElementById('cart-back');
    var clearBtn   = document.getElementById('cart-clear');
    var solicitar  = document.getElementById('cart-solicitar');

    if (!overlay) return;

    /* replace "Pedir" links with "Agregar" buttons */
    document.querySelectorAll('.product-card').forEach(function (card) {
      var pedirLink = card.querySelector('.card-footer .btn-wa.btn-sm');
      if (!pedirLink) return;

      var name  = (card.querySelector('.card-name')  || {}).textContent || '';
      var cat   = card.getAttribute('data-cat') || '';
      var img   = card.querySelector('.card-img-wrap img');
      var photo = img ? img.getAttribute('src') : '';

      var btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'btn btn-add-cart';
      btn.textContent = '+ Agregar';

      btn.addEventListener('click', function () {
        addToCart(name.trim(), cat, photo);
        btn.textContent = '✓ Añadido';
        btn.classList.add('added');
        setTimeout(function () {
          btn.textContent = '+ Agregar';
          btn.classList.remove('added');
        }, 1400);
      });

      pedirLink.parentNode.replaceChild(btn, pedirLink);
    });

    function addToCart(name, cat, photo) {
      var found = null;
      for (var i = 0; i < cart.length; i++) {
        if (cart[i].name === name) { found = cart[i]; break; }
      }
      if (found) { found.qty++; }
      else { cart.push({ name: name, cat: cat, photo: photo, qty: 1 }); }
      updateBadge();
    }

    function removeItem(name) {
      cart = cart.filter(function (i) { return i.name !== name; });
      updateBadge();
      renderCart();
    }

    function changeQty(name, delta) {
      for (var i = 0; i < cart.length; i++) {
        if (cart[i].name === name) {
          cart[i].qty += delta;
          if (cart[i].qty <= 0) { cart.splice(i, 1); }
          break;
        }
      }
      updateBadge();
      renderCart();
    }

    function updateBadge() {
      var total = cart.reduce(function (s, i) { return s + i.qty; }, 0);
      if (navBadge) {
        navBadge.textContent = total;
        navBadge.style.display = total > 0 ? 'flex' : 'none';
      }
    }

    function renderCart() {
      if (!cartBody) return;
      var totalQty = cart.reduce(function (s, i) { return s + i.qty; }, 0);
      var totalVal = cart.reduce(function (s, i) { return s + i.qty * PRICE; }, 0);

      /* count badge in title */
      if (countBadge) {
        countBadge.textContent = totalQty || '';
        countBadge.style.display = totalQty > 0 ? 'inline-flex' : 'none';
      }
      if (clearBtn) clearBtn.style.visibility = cart.length > 0 ? 'visible' : 'hidden';

      if (cart.length === 0) {
        cartBody.innerHTML =
          '<div class="cart-empty">' +
            '<p class="cart-empty-serif">Tu selección está vacía.</p>' +
            '<p>Explora el catálogo y agrega las piezas que te gusten.</p>' +
            '<button class="btn btn-outline" id="cart-go-back" type="button">Ver catálogo</button>' +
          '</div>';
        var goBack = document.getElementById('cart-go-back');
        if (goBack) goBack.addEventListener('click', closeCart);
        if (cartFooter) cartFooter.hidden = true;
        return;
      }

      var html = '<ul class="cart-list">';
      cart.forEach(function (item) {
        var esc = item.name.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
        html +=
          '<li class="cart-item">' +
            '<div class="cart-item-img"><img src="' + item.photo + '" alt="' + esc + '" loading="lazy"/></div>' +
            '<div class="cart-item-info">' +
              '<span class="cart-item-cat">' + item.cat + '</span>' +
              '<span class="cart-item-name">' + item.name + '</span>' +
              '<span class="cart-item-price">S/. ' + (item.qty * PRICE) + '</span>' +
            '</div>' +
            '<div class="cart-item-actions">' +
              '<div class="cart-qty">' +
                '<button class="cart-qty-btn" type="button" data-name="' + esc + '" data-d="-1">−</button>' +
                '<span>' + item.qty + '</span>' +
                '<button class="cart-qty-btn" type="button" data-name="' + esc + '" data-d="1">+</button>' +
              '</div>' +
              '<button class="cart-remove" type="button" data-name="' + esc + '" aria-label="Eliminar">✕</button>' +
            '</div>' +
          '</li>';
      });
      html += '</ul>';
      cartBody.innerHTML = html;

      cartBody.querySelectorAll('.cart-qty-btn').forEach(function (b) {
        b.addEventListener('click', function () {
          changeQty(b.getAttribute('data-name'), parseInt(b.getAttribute('data-d'), 10));
        });
      });
      cartBody.querySelectorAll('.cart-remove').forEach(function (b) {
        b.addEventListener('click', function () { removeItem(b.getAttribute('data-name')); });
      });

      if (cartFooter) cartFooter.hidden = false;
      if (totalAmt)   totalAmt.textContent = 'S/. ' + totalVal;

      if (solicitar) {
        var lines = cart.map(function (i) {
          return '• ' + i.name + ' x' + i.qty + ' — S/. ' + (i.qty * PRICE);
        });
        var msg = 'Hola! Me gustaría solicitar las siguientes piezas de La Mona ✨\n\n' +
                  lines.join('\n') +
                  '\n\nTotal: S/. ' + totalVal + '\n\n¿Están disponibles? 🌸';
        solicitar.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
      }
    }

    function openCart() {
      renderCart();
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      overlay.focus();
    }

    function closeCart() {
      overlay.hidden = true;
      document.body.style.overflow = '';
    }

    if (navBtn)   navBtn.addEventListener('click', openCart);
    if (backBtn)  backBtn.addEventListener('click', closeCart);
    if (clearBtn) clearBtn.addEventListener('click', function () {
      cart = [];
      updateBadge();
      renderCart();
    });

    updateBadge();
  }

  /* ── chatbot ────────────────────────────────── */
  function initChatbot() {
    var fab        = document.getElementById('chat-fab');
    var chatWin    = document.getElementById('chat-win');
    var closeBtn   = document.getElementById('chat-close');
    var messagesEl = document.getElementById('chat-messages');
    var quickEl    = document.getElementById('chat-quick-replies');
    var form       = document.getElementById('chat-form');
    var inputEl    = document.getElementById('chat-input');
    var badge      = document.getElementById('chat-fab-badge');
    var iconOpen   = fab ? fab.querySelector('.chat-fab-icon--open')  : null;
    var iconClose  = fab ? fab.querySelector('.chat-fab-icon--close') : null;
    if (!fab || !chatWin) return;

    var isOpen  = false;
    var greeted = false;
    var unread  = 0;
    var WA      = '51997918216';

    /* ── Knowledge base ─────────────────────── */
    var KB = {
      welcome: {
        text: '¡Hola! Soy <strong>Mona</strong>, tu asistente de La Mona ✨<br>Estoy aquí para ayudarte a encontrar la joya perfecta. ¿En qué te puedo ayudar?',
        qr: ['Ver materiales', 'Precios', 'Personalización', 'Envíos', 'Ver catálogo', 'Hablar por WhatsApp']
      },
      materials: {
        text: 'Trabajamos con dos materiales de alta calidad:<br><br>🥈 <strong>Plata 925</strong> — plata esterlina pura, duradera e hipoalergénica.<br>✨ <strong>Baño de oro 18k</strong> — acabado dorado elegante sobre plata.<br><br>Ambas opciones están disponibles en todos nuestros diseños.',
        qr: ['¿Cuánto cuestan?', 'Ver collares', 'Ver anillos', 'Ver pulseras', 'Ver aretes']
      },
      price: {
        text: 'Todas nuestras piezas tienen un solo precio: <strong>S/. 50</strong> 🌸<br><br>No importa si es un collar, anillo, pulsera o arete — el precio es el mismo para todos los diseños. ¡Y la personalización con tu nombre o iniciales está incluida!',
        qr: ['¿Cómo personalizo?', 'Ver el catálogo', 'Solicitar por WhatsApp']
      },
      personalization: {
        text: '¡Sí, personalizamos! Grabamos tu <strong>nombre o iniciales</strong> en cualquier pieza 💛<br><br>El proceso es sencillo:<br>1. Eliges tu joya del catálogo<br>2. Nos escribes por WhatsApp con el texto a grabar<br>3. Te enviamos una foto del boceto antes de empezar<br>4. Solo cuando das el OK comenzamos a trabajar',
        qr: ['¿Cuánto demora?', 'Ver el catálogo', 'Personalizar ahora']
      },
      delivery: {
        text: '📦 <strong>Envíos a todo el Perú</strong><br><br>🏙️ <strong>Lima:</strong> pago contra entrega<br>🇵🇪 <strong>Provincias:</strong> envío por Olva o Shalom<br><br>Coordinamos todos los detalles por WhatsApp.',
        qr: ['¿Cuánto cuesta el envío?', '¿Cuánto demora?', 'Hacer un pedido']
      },
      shipping_cost: {
        text: '📦 El costo de envío varía según tu ciudad:<br><br>🏙️ <strong>Lima:</strong> envío gratuito (pago contra entrega)<br>🇵🇪 <strong>Provincias:</strong> costo según Olva o Shalom<br><br>Escríbenos por WhatsApp y te damos el costo exacto para tu ciudad.',
        qr: ['Hacer un pedido', 'Precios']
      },
      timing: {
        text: '⏱️ Los tiempos de entrega son:<br><br>✏️ <strong>Con grabado:</strong> 3–5 días hábiles<br>💍 <strong>Sin grabado:</strong> 1–3 días hábiles<br><br>Te confirmamos el plazo exacto al hacer tu pedido.',
        qr: ['Hacer un pedido', 'Ver el catálogo']
      },
      catalog: {
        text: 'Tenemos <strong>69 piezas</strong> en cuatro categorías:<br><br>📿 <strong>Collares</strong> — 25 diseños<br>💍 <strong>Anillos</strong> — 13 diseños<br>🔗 <strong>Pulseras</strong> — 19 diseños<br>📎 <strong>Aretes</strong> — 7 diseños<br><br>Todas a <strong>S/. 50</strong> con opción de grabado personalizado.',
        qr: ['Ver collares', 'Ver anillos', 'Ver pulseras', 'Ver aretes', 'Ir al catálogo']
      },
      collares: {
        text: '📿 Tenemos <strong>25 diseños de collares</strong> disponibles — desde dijes delicados hasta cadenas más estructuradas, en plata 925 o baño de oro 18k a <strong>S/. 50</strong>.<br><br>Todos pueden personalizarse con tu nombre o iniciales.',
        qr: ['Ir al catálogo', 'Precios', 'Otros diseños']
      },
      anillos: {
        text: '💍 Contamos con <strong>13 diseños de anillos</strong>, perfectos para regalo o uso diario. En plata 925 o baño de oro 18k a <strong>S/. 50</strong>.<br><br>¡Se pueden personalizar con tus iniciales!',
        qr: ['Ir al catálogo', 'Precios', 'Otros diseños']
      },
      pulseras: {
        text: '🔗 Tenemos <strong>19 diseños de pulseras</strong>, ideales para regalar. Todas en plata 925 o baño de oro 18k a <strong>S/. 50</strong>.<br><br>Son perfectas para grabar el nombre de alguien especial.',
        qr: ['Ir al catálogo', 'Precios', 'Otros diseños']
      },
      aretes: {
        text: '📎 Tenemos <strong>7 diseños de aretes</strong>, elegantes y delicados. En plata 925 o baño de oro 18k a <strong>S/. 50</strong> el par.<br><br>También se pueden personalizar con iniciales.',
        qr: ['Ir al catálogo', 'Precios', 'Otros diseños']
      },
      gift: {
        text: '🎁 ¡Nuestras joyas son un regalo perfecto! Todas incluyen <strong>empaque de regalo</strong> sin costo extra.<br><br>Si no sabes qué elegir, los collares y pulseras son los más populares para regalar. ¿A quién le quieres regalar?',
        qr: ['Ver collares', 'Ver pulseras', 'Precios', 'Hablar por WhatsApp']
      },
      whatsapp: {
        text: '¡Perfecto! Te conecto con nuestro WhatsApp ahora mismo 📱<br><br>¡Somos muy rápidas respondiendo! 🌸',
        qr: [],
        wa: true
      },
      fallback: {
        text: 'Hmm, no entendí del todo 😊 ¿Sobre qué te puedo ayudar?',
        qr: ['Ver materiales', 'Precios', 'Personalización', 'Envíos', 'Ver catálogo', 'Hablar por WhatsApp']
      }
    };

    /* ── Quick reply → intent map ───────────── */
    var QR = {
      'Ver materiales': 'materials', 'Materiales': 'materials',
      'Precios': 'price', '¿Cuánto cuestan?': 'price',
      'Personalización': 'personalization', '¿Cómo personalizo?': 'personalization',
      'Personalizar ahora': 'whatsapp',
      'Envíos': 'delivery',
      '¿Cuánto cuesta el envío?': 'shipping_cost',
      '¿Cuánto demora?': 'timing',
      'Ver catálogo': 'catalog', 'Ver el catálogo': 'catalog',
      'Ir al catálogo': 'goToCatalog',
      'Ver collares': 'collares', 'Ver anillos': 'anillos',
      'Ver pulseras': 'pulseras', 'Ver aretes': 'aretes',
      'Otros diseños': 'catalog',
      'Hacer un pedido': 'whatsapp', 'Solicitar por WhatsApp': 'whatsapp',
      'Hablar por WhatsApp': 'whatsapp'
    };

    /* ── Keyword detection ───────────────────── */
    function detect(raw) {
      var t = raw.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '');
      if (/hola|buenas|buenos|hi\b|hey\b/.test(t))                         return 'welcome';
      if (/plata|oro|material|calidad|925|18k|bano|metal/.test(t))         return 'materials';
      if (/precio|costo|cuanto|vale|soles|s\/|costar/.test(t))             return 'price';
      if (/graba|nombre|iniciales|personali/.test(t))                      return 'personalization';
      if (/demora|tarda|tiempo|dias|cuando|rapido/.test(t))                return 'timing';
      if (/costo.*envi|envi.*costo|precio.*envi|envi.*precio/.test(t))     return 'shipping_cost';
      if (/envi|entrega|despacho|delivery|lima|provincias|olva|shalom/.test(t)) return 'delivery';
      if (/regalo|regalar/.test(t))                                        return 'gift';
      if (/catalogo|todos|todo|cuantos|69|piezas/.test(t))                 return 'catalog';
      if (/collar/.test(t))                                                return 'collares';
      if (/anillo/.test(t))                                                return 'anillos';
      if (/pulsera/.test(t))                                               return 'pulseras';
      if (/arete/.test(t))                                                 return 'aretes';
      if (/whatsapp|contacto|escribir|hablar|pedido|comprar|solicitar|pedir/.test(t)) return 'whatsapp';
      return 'fallback';
    }

    /* ── DOM helpers ─────────────────────────── */
    function addMsg(html, isUser) {
      var wrap   = document.createElement('div');
      wrap.className = 'chat-msg ' + (isUser ? 'chat-msg-user' : 'chat-msg-bot');
      var bubble = document.createElement('div');
      bubble.className = 'chat-bubble';
      if (isUser) { bubble.textContent = html; }
      else        { bubble.innerHTML   = html; }
      wrap.appendChild(bubble);
      messagesEl.appendChild(wrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showTyping() {
      var wrap = document.createElement('div');
      wrap.className = 'chat-msg chat-msg-bot';
      wrap.id = 'chat-typing';
      var bubble = document.createElement('div');
      bubble.className = 'chat-bubble';
      bubble.innerHTML = '<div class="chat-dots"><span></span><span></span><span></span></div>';
      wrap.appendChild(bubble);
      messagesEl.appendChild(wrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    function removeTyping() {
      var el = document.getElementById('chat-typing');
      if (el) el.parentNode.removeChild(el);
    }

    function setQR(list) {
      quickEl.innerHTML = '';
      if (!list || !list.length) return;
      list.forEach(function(label) {
        var btn = document.createElement('button');
        btn.className = 'chat-qr-btn';
        btn.type = 'button';
        btn.textContent = label;
        btn.addEventListener('click', function() { handleInput(label, true); });
        quickEl.appendChild(btn);
      });
    }

    function updateBadge() {
      if (unread > 0 && !isOpen) {
        badge.textContent = unread;
        badge.removeAttribute('hidden');
      } else {
        badge.setAttribute('hidden', '');
      }
    }

    /* ── Respond ─────────────────────────────── */
    function respond(intent) {
      if (intent === 'goToCatalog') {
        addMsg('Aquí te llevo al catálogo completo 👇', false);
        setQR([]);
        setTimeout(function() {
          var sec = document.getElementById('catalogo');
          if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          closeChat();
        }, 700);
        return;
      }

      var r = KB[intent] || KB.fallback;
      var delay = 650 + Math.random() * 450;
      showTyping();
      setQR([]);
      setTimeout(function() {
        removeTyping();
        addMsg(r.text, false);
        setQR(r.qr || []);
        if (r.wa) {
          setTimeout(function() {
            var url = 'https://wa.me/' + WA + '?text=' +
              encodeURIComponent('Hola! Vi tu catálogo y me interesa hacer un pedido 🌸');
            window.open(url, '_blank', 'noopener,noreferrer');
          }, 700);
        }
        if (!isOpen) { unread++; updateBadge(); }
      }, delay);
    }

    /* ── Handle user input ───────────────────── */
    function handleInput(text, isQR) {
      if (!text.trim()) return;
      addMsg(text, true);
      setQR([]);
      if (isQR && QR[text] !== undefined) {
        respond(QR[text]);
      } else {
        respond(detect(text));
      }
    }

    /* ── Open / close ────────────────────────── */
    function openChat() {
      isOpen = true;
      chatWin.removeAttribute('hidden');
      iconOpen.setAttribute('hidden', '');
      iconClose.removeAttribute('hidden');
      fab.style.animation = 'none';
      unread = 0;
      updateBadge();
      if (!greeted) {
        greeted = true;
        setTimeout(function() { respond('welcome'); }, 380);
      }
      setTimeout(function() { inputEl.focus(); }, 300);
    }
    function closeChat() {
      isOpen = false;
      chatWin.setAttribute('hidden', '');
      iconOpen.removeAttribute('hidden');
      iconClose.setAttribute('hidden', '');
      fab.style.animation = '';
    }

    /* ── Events ──────────────────────────────── */
    fab.addEventListener('click', function() {
      if (isOpen) closeChat(); else openChat();
    });
    closeBtn.addEventListener('click', closeChat);
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var val = inputEl.value.trim();
      if (!val) return;
      inputEl.value = '';
      handleInput(val, false);
    });

    /* show badge after 4s to attract attention */
    setTimeout(function() {
      if (!greeted) { unread = 1; updateBadge(); }
    }, 4000);
  }

  /* ── boot ────────────────────────────────── */
  function boot() {
    safe(initNav,            'initNav');
    /* initCatalogExpand desactivado: la ventana scrolleable reemplaza el "ver más" */
    safe(initFilter,         'initFilter');
    safe(initReveals,        'initReveals');
    safe(initCounters,       'initCounters');
    safe(initGSAP,           'initGSAP');
    safe(initTilt,           'initTilt');
    safe(initPersonalizer,   'initPersonalizer');
    safe(initCart,           'initCart');
    safe(initChatbot,        'initChatbot');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

}());
