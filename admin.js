/* la Mona — admin.js (panel de administración de productos)
   Vanilla JS, IIFE — sin frameworks, sin build step.
   Funciona en 2 modos:
   · CONECTADO : Supabase configurado en lib/supabase-config.js → guarda en BD real.
   · DEMO      : sin configurar → carga lib/manifest.js, cambios solo en memoria. */
(function () {
  'use strict';

  /* ── config y estado ─────────────────────── */
  var CFG = window.__SUPABASE__ || {};
  var BRAND = window.__BRAND__ || { products: [], categories: [] };

  var isConfigured =
    typeof CFG.url === 'string' && CFG.url.indexOf('https://') === 0 &&
    typeof CFG.anonKey === 'string' && CFG.anonKey.length > 40;

  var db = null;            /* cliente supabase */
  var demoMode = false;
  var soportaDestacados = false;  /* true si la columna featured_rank existe */
  var products = [];        /* estado local de productos */
  var dirty = {};           /* ids con cambios sin guardar */
  var currentId = null;     /* producto abierto en el drawer */
  var activeCat = 'todos';
  var searchTerm = '';
  var TOTAL_FOTOS = 78;     /* assets/img/foto-1.jpeg … foto-78.jpeg */

  /* ── subida de fotos ──────────────────────── */
  var BUCKET       = 'productos';       /* bucket de Supabase Storage */
  var MAX_LADO     = 1400;              /* px del lado largo tras redimensionar */
  var CALIDAD      = 0.82;              /* calidad JPEG */
  var MAX_ORIGINAL = 15 * 1024 * 1024;  /* rechaza archivos absurdos */

  if (isConfigured && window.supabase) {
    db = window.supabase.createClient(CFG.url, CFG.anonKey);
  }

  /* ── enlace de invitación / recuperación ───
     Supabase manda el token en el hash de la URL. Hay que leerlo
     AQUÍ, de forma síncrona, porque supabase-js limpia el hash en
     cuanto termina de inicializarse. */
  var authLink = (function () {
    function parse(str) {
      var out = {};
      String(str || '').replace(/^[#?]/, '').split('&').forEach(function (pair) {
        if (!pair) return;
        var i = pair.indexOf('=');
        var k = i < 0 ? pair : pair.slice(0, i);
        var v = i < 0 ? '' : pair.slice(i + 1);
        try { out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' ')); }
        catch (e) { out[k] = v; }
      });
      return out;
    }
    var h = parse(window.location.hash);
    var q = parse(window.location.search);
    var type = h.type || q.type || '';
    var err = h.error_description || q.error_description || h.error || q.error || '';
    /* En 'signup' la contraseña ya la eligió el usuario al registrarse:
       ese enlace solo confirma el correo, así que pasa de largo. */
    return {
      type: type,
      error: err,
      active: !!err || (type !== 'signup' &&
              (type === 'invite' || type === 'recovery' ||
               !!q.code || !!q.token_hash))
    };
  })();

  /* Quita el token de la barra de direcciones. Solo se llama DESPUÉS
     de que supabase-js haya leído la URL, nunca antes. */
  function cleanUrl() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  /* URL de esta misma página, sin hash ni query — es la que Supabase
     debe tener en Authentication → URL Configuration. */
  function selfUrl() {
    return window.location.origin + window.location.pathname;
  }

  /* ── helpers DOM ─────────────────────────── */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var toastTimer = null;
  function toast(msg, type) {
    var el = $('toast');
    el.textContent = msg;
    el.className = 'toast' + (type ? ' ' + type : '');
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 3200);
  }

  function isAllowed(email) {
    var list = (CFG.allowedEmails || []).map(function (e) { return e.toLowerCase().trim(); });
    return list.indexOf(String(email || '').toLowerCase().trim()) !== -1;
  }

  function dirtyCount() { return Object.keys(dirty).length; }

  /* ── mapeo manifest → fila de BD ─────────── */
  function fromManifest(p, i) {
    return {
      id: p.id,
      name: p.name,
      category: p.cat,
      description: p.desc || '',
      material: p.tag === 'Baño de oro' ? 'Baño de oro 18k' : 'Plata 925',
      price: 50,
      photo: p.photo || '',
      tag: p.tag || '',
      active: true,
      sort_order: i
    };
  }

  /* ══════════════════════════════════════════
     LOGIN
  ══════════════════════════════════════════ */
  function initLogin() {
    var form = $('login-form');
    var error = $('login-error');

    if (!isConfigured) {
      /* sin Supabase: solo modo demo */
      form.hidden = true;
      $('login-demo').hidden = false;
      $('demo-btn').addEventListener('click', function () {
        demoMode = true;
        sessionStorage.setItem('lamona_demo', '1');
        enterAdmin('demo@lamona.pe');
      });
      /* sesión demo previa (sobrevive a refresh) */
      if (sessionStorage.getItem('lamona_demo') === '1') {
        demoMode = true;
        enterAdmin('demo@lamona.pe');
      }
      return;
    }

    initForgot();
    initSignup();

    /* Llegada desde un enlace de correo: hay que definir la contraseña
       antes de entrar, aunque el token del enlace ya haya creado sesión. */
    if (authLink.active) {
      initSetPassword();
    } else {
      /* sesión real previa, o confirmación de correo tras el registro */
      db.auth.getSession().then(function (res) {
        var session = res.data && res.data.session;
        if (authLink.type) cleanUrl();
        if (session && session.user) {
          if (isAllowed(session.user.email)) {
            enterAdmin(session.user.email);
          } else {
            db.auth.signOut();
          }
        }
      });
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      error.hidden = true;
      var email = $('login-email').value.trim();
      var password = $('login-password').value;

      if (!email || !password) {
        error.textContent = 'Completa el correo y la contraseña.';
        error.hidden = false;
        return;
      }
      if (!isAllowed(email)) {
        error.textContent = 'Este correo no tiene acceso al panel.';
        error.hidden = false;
        return;
      }

      var btn = $('login-submit');
      btn.disabled = true;
      btn.textContent = 'Ingresando…';

      db.auth.signInWithPassword({ email: email, password: password })
        .then(function (res) {
          if (res.error) {
            error.textContent = 'Correo o contraseña incorrectos.';
            error.hidden = false;
            return;
          }
          enterAdmin(res.data.user.email);
        })
        .catch(function () {
          error.textContent = 'No se pudo conectar. Revisa tu internet.';
          error.hidden = false;
        })
        .then(function () {
          btn.disabled = false;
          btn.textContent = 'Ingresar';
        });
    });
  }

  /* ══════════════════════════════════════════
     DEFINIR CONTRASEÑA (invitación / recuperación)
  ══════════════════════════════════════════ */
  function initSetPassword() {
    var form = $('setpw-form');
    var error = $('setpw-error');
    var btn = $('setpw-submit');

    $('login-card').hidden = true;
    $('setpw-card').hidden = false;

    if (authLink.type === 'recovery') {
      $('setpw-title').textContent = 'Nueva contraseña';
      $('setpw-sub').textContent = 'Elige una contraseña nueva para tu cuenta.';
    }

    function fail(msg) {
      error.textContent = msg;
      error.hidden = false;
    }

    /* Enlace inservible: se explica y se ofrece volver al login. */
    function killLink(msg) {
      form.hidden = true;
      $('setpw-dead-msg').textContent = msg;
      $('setpw-dead').hidden = false;
    }

    $('setpw-back').addEventListener('click', function () {
      $('setpw-card').hidden = true;
      $('login-card').hidden = false;
    });

    if (authLink.error) {
      cleanUrl();
      killLink(/expired|invalid/i.test(authLink.error)
        ? 'Este enlace ya venció o fue usado. Pide que te envíen uno nuevo.'
        : 'Este enlace no es válido (' + authLink.error + ').');
      return;
    }

    /* El token del enlace crea la sesión; getSession() espera a que
       supabase-js termine de leer la URL antes de responder. */
    btn.disabled = true;
    db.auth.getSession().then(function (res) {
      var session = res.data && res.data.session;
      cleanUrl();

      if (!session || !session.user) {
        killLink('Este enlace ya venció o fue usado. Pide que te envíen uno nuevo.');
        return;
      }
      if (!isAllowed(session.user.email)) {
        db.auth.signOut();
        killLink('El correo ' + session.user.email + ' no tiene acceso al panel.');
        return;
      }
      $('setpw-email').textContent = session.user.email;
      $('setpw-email').hidden = false;
      btn.disabled = false;
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      error.hidden = true;

      var pw = $('setpw-password').value;
      var pw2 = $('setpw-confirm').value;

      if (pw.length < 8) { fail('La contraseña debe tener al menos 8 caracteres.'); return; }
      if (pw !== pw2) { fail('Las contraseñas no coinciden.'); return; }

      btn.disabled = true;
      btn.textContent = 'Guardando…';

      db.auth.updateUser({ password: pw })
        .then(function (res) {
          if (res.error) {
            fail('No se pudo guardar la contraseña. El enlace pudo vencer; pide uno nuevo.');
            return;
          }
          $('setpw-card').hidden = true;
          $('login-card').hidden = false;
          enterAdmin(res.data.user.email);
        })
        .catch(function () {
          fail('No se pudo conectar. Revisa tu internet.');
        })
        .then(function () {
          btn.disabled = false;
          btn.textContent = 'Guardar contraseña y entrar';
        });
    });
  }

  /* ══════════════════════════════════════════
     REGISTRO
     Solo acepta los correos del allowlist. Es un filtro de interfaz:
     quien llame a la API de Supabase directamente puede registrarse
     igual, pero la política RLS le impide escribir nada.
  ══════════════════════════════════════════ */
  function initSignup() {
    var form = $('signup-form');
    var error = $('signup-error');
    var note = $('signup-note');
    var btn = $('signup-submit');

    $('to-signup-btn').addEventListener('click', function () {
      $('signup-email').value = $('login-email').value.trim();
      $('login-card').hidden = true;
      $('signup-card').hidden = false;
    });
    $('to-login-btn').addEventListener('click', function () {
      $('signup-card').hidden = true;
      $('login-card').hidden = false;
    });

    function fail(msg) {
      error.textContent = msg;
      error.hidden = false;
    }
    var YA_EXISTE = 'Ya existe una cuenta con este correo. Inicia sesión, o usa ' +
                    '"¿Olvidaste tu contraseña?" si no la recuerdas.';

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      error.hidden = true;
      note.hidden = true;

      var email = $('signup-email').value.trim();
      var pw = $('signup-password').value;
      var pw2 = $('signup-confirm').value;

      if (!email) { fail('Escribe tu correo.'); return; }
      if (!isAllowed(email)) { fail('Este correo no tiene acceso al panel.'); return; }
      if (pw.length < 8) { fail('La contraseña debe tener al menos 8 caracteres.'); return; }
      if (pw !== pw2) { fail('Las contraseñas no coinciden.'); return; }

      btn.disabled = true;
      btn.textContent = 'Creando…';

      db.auth.signUp({ email: email, password: pw, options: { emailRedirectTo: selfUrl() } })
        .then(function (res) {
          if (res.error) {
            fail(/already|registered/i.test(res.error.message)
              ? YA_EXISTE
              : 'No se pudo crear la cuenta. ' + res.error.message);
            return;
          }
          var user = res.data && res.data.user;

          /* Supabase devuelve un usuario con identities vacío cuando el
             correo ya estaba registrado, para no delatar quién tiene cuenta. */
          if (user && user.identities && user.identities.length === 0) {
            fail(YA_EXISTE);
            return;
          }
          /* Con "Confirm email" desactivado la sesión llega de una vez. */
          if (res.data && res.data.session) {
            enterAdmin(user.email);
            return;
          }
          form.hidden = true;
          note.textContent = 'Cuenta creada. Te enviamos un correo para confirmarla: ' +
                             'ábrelo y luego podrás entrar al panel.';
          note.hidden = false;
        })
        .catch(function () { fail('No se pudo conectar. Revisa tu internet.'); })
        .then(function () {
          btn.disabled = false;
          btn.textContent = 'Crear cuenta';
        });
    });
  }

  /* ── ¿Olvidaste tu contraseña? ────────────── */
  function initForgot() {
    var btn = $('forgot-btn');
    var note = $('forgot-note');

    btn.addEventListener('click', function () {
      var email = $('login-email').value.trim();
      note.hidden = true;
      $('login-error').hidden = true;

      if (!email) {
        note.textContent = 'Escribe tu correo arriba y vuelve a tocar aquí.';
        note.hidden = false;
        return;
      }
      if (!isAllowed(email)) {
        note.textContent = 'Este correo no tiene acceso al panel.';
        note.hidden = false;
        return;
      }

      btn.disabled = true;
      db.auth.resetPasswordForEmail(email, { redirectTo: selfUrl() })
        .then(function () {
          note.textContent = 'Te enviamos un correo con el enlace para cambiar tu contraseña.';
          note.hidden = false;
        })
        .catch(function () {
          note.textContent = 'No se pudo enviar el correo. Revisa tu internet.';
          note.hidden = false;
        })
        .then(function () { btn.disabled = false; });
    });
  }

  function enterAdmin(email) {
    $('login-view').hidden = true;
    $('admin-view').hidden = false;
    $('topbar-user').textContent = email;
    $('demo-banner').hidden = !demoMode;
    loadProducts();
  }

  function logout() {
    if (dirtyCount() > 0 && !confirm('Tienes cambios sin guardar. ¿Salir igual?')) return;

    /* ya se avisó de los cambios: que beforeunload no vuelva a preguntar */
    dirty = {};
    sessionStorage.removeItem('lamona_demo');

    if (!db) { window.location.reload(); return; }

    var btn = $('logout-btn');
    btn.disabled = true;
    btn.textContent = 'Saliendo…';

    /* signOut() es asíncrono: borra la sesión de localStorage cuando
       resuelve. Recargar sin esperarla dejaba la sesión viva y el
       usuario volvía a entrar solo. */
    function done() { window.location.reload(); }

    db.auth.signOut()
      .then(function (res) {
        /* si el servidor no respondió, al menos limpiamos este equipo */
        if (res && res.error) return db.auth.signOut({ scope: 'local' });
      })
      .catch(function () {
        return db.auth.signOut({ scope: 'local' }).catch(function () {});
      })
      .then(done, done);
  }

  /* ══════════════════════════════════════════
     CARGA DE PRODUCTOS
  ══════════════════════════════════════════ */
  function loadProducts() {
    if (demoMode) {
      products = BRAND.products.map(fromManifest);
      soportaDestacados = true;   /* sin BD que romper: se puede probar todo */
      renderAll();
      return;
    }
    db.from('products').select('*').order('sort_order', { ascending: true })
      .then(function (res) {
        if (res.error) {
          toast('Error al leer la tabla products. ¿Ejecutaste supabase/schema.sql?', 'error');
          console.warn('[admin]', res.error);
          products = [];
          renderAll();
          return;
        }
        products = res.data || [];

        /* ¿existe ya la columna de destacados? Si supabase/destacados.sql
           no se ha ejecutado, se oculta esa función en vez de mandar un
           campo inexistente, que haría fallar CUALQUIER guardado. */
        soportaDestacados = products.length > 0 &&
          Object.prototype.hasOwnProperty.call(products[0], 'featured_rank');
        $('edit-featured').closest('.switch-field').hidden = !soportaDestacados;
        var hint = $('edit-featured').closest('.switch-field').nextElementSibling;
        if (hint && hint.classList.contains('field-hint')) hint.hidden = !soportaDestacados;

        $('import-banner').hidden = products.length > 0;
        renderAll();
      });
  }

  /* importa el catálogo de lib/manifest.js a la BD (tabla vacía) */
  function importCatalog() {
    var rows = BRAND.products.map(fromManifest);
    var btn = $('import-btn');
    btn.disabled = true;
    btn.textContent = 'Importando…';
    db.from('products').upsert(rows).then(function (res) {
      btn.disabled = false;
      btn.textContent = 'Importar catálogo inicial (69 piezas)';
      if (res.error) {
        toast('No se pudo importar: ' + res.error.message, 'error');
        return;
      }
      $('import-banner').hidden = true;
      toast('Catálogo importado: ' + rows.length + ' piezas ✓', 'ok');
      loadProducts();
    });
  }

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  function renderAll() {
    renderFilters();
    renderGrid();
    updateSaveAll();
  }

  function renderFilters() {
    var wrap = $('cat-filters');
    var cats = [{ id: 'todos', label: 'Todos' }].concat(
      (BRAND.categories || []).filter(function (c) { return c.id !== 'todos'; })
    );
    wrap.innerHTML = '';
    cats.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = c.label;
      b.className = c.id === activeCat ? 'active' : '';
      b.addEventListener('click', function () {
        activeCat = c.id;
        renderFilters();
        renderGrid();
      });
      wrap.appendChild(b);
    });
  }

  function visibleProducts() {
    var q = searchTerm.toLowerCase();
    return products.filter(function (p) {
      var okCat = activeCat === 'todos' || p.category === activeCat;
      var okQ = !q ||
        (p.name || '').toLowerCase().indexOf(q) !== -1 ||
        (p.description || '').toLowerCase().indexOf(q) !== -1;
      return okCat && okQ;
    });
  }

  function renderGrid() {
    var grid = $('product-grid');
    /* los destacados primero y en su orden; el resto conserva el suyo
       (Array.sort es estable, así que no se descoloca nada) */
    var list = visibleProducts().slice().sort(function (a, b) {
      var fa = a.featured_rank, fb = b.featured_rank;
      if (fa != null && fb != null) return fa - fb;
      if (fa != null) return -1;
      if (fb != null) return 1;
      return 0;
    });
    $('grid-empty').hidden = list.length > 0;
    $('product-count').textContent =
      list.length + ' de ' + products.length + ' piezas';

    grid.innerHTML = '';
    list.forEach(function (p) {
      var card = document.createElement('article');
      card.className = 'p-card' +
        (p.active === false ? ' inactive' : '') +
        (dirty[p.id] ? ' dirty' : '');
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Editar ' + (p.name || 'producto'));

      var badge = '';
      if (dirty[p.id]) badge = '<span class="p-card-dirty-dot">Sin guardar</span>';
      else if (p.active === false) badge = '<span class="p-card-off">Oculto</span>';

      card.innerHTML =
        '<div class="p-card-img"><img src="' + esc(p.photo) + '" alt="" loading="lazy"' +
        ' onerror="this.style.visibility=\'hidden\'" /></div>' +
        (p.tag ? '<span class="p-card-tag">' + esc(p.tag) + '</span>' : '') +
        badge +
        '<div class="p-card-body">' +
        '  <p class="p-card-cat">' + esc(p.category) + '</p>' +
        '  <h3 class="p-card-name">' + esc(p.name) + '</h3>' +
        '  <div class="p-card-meta">' +
        '    <span>' + esc(p.material || '') + '</span>' +
        '    <span class="p-card-price">S/. ' + esc(p.price != null ? p.price : '') + '</span>' +
        '  </div>' +
        '</div>';

      /* flechas de orden, solo en los destacados */
      if (p.featured_rank != null) {
        card.classList.add('featured');
        var pos = destacados();
        var idx = -1;
        for (var k = 0; k < pos.length; k++) { if (pos[k].id === p.id) { idx = k; break; } }

        var nav = document.createElement('div');
        nav.className = 'p-card-order';
        nav.innerHTML =
          '<button type="button" class="p-order-btn" data-dir="-1" aria-label="Subir"' +
          (idx <= 0 ? ' disabled' : '') + '>&#8593;</button>' +
          '<span class="p-order-pos">' + (idx + 1) + '</span>' +
          '<button type="button" class="p-order-btn" data-dir="1" aria-label="Bajar"' +
          (idx >= pos.length - 1 ? ' disabled' : '') + '>&#8595;</button>';

        nav.addEventListener('click', function (ev) {
          var b = ev.target.closest ? ev.target.closest('.p-order-btn') : null;
          if (!b || b.disabled) return;
          ev.stopPropagation();          /* no abrir el editor al pulsar la flecha */
          moverDestacado(p.id, parseInt(b.getAttribute('data-dir'), 10));
        });
        card.appendChild(nav);
      }

      function open() { openDrawer(p.id); }
      card.addEventListener('click', open);
      card.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); open(); }
      });
      grid.appendChild(card);
    });
  }

  function updateSaveAll() {
    var n = dirtyCount();
    $('save-all-btn').hidden = n === 0;
    $('save-all-badge').textContent = n;
  }

  /* ══════════════════════════════════════════
     DRAWER (editor de producto)
  ══════════════════════════════════════════ */
  function findProduct(id) {
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) return products[i];
    }
    return null;
  }

  function openDrawer(id) {
    var p = findProduct(id);
    if (!p) return;
    currentId = id;

    $('drawer-title').textContent = p._isNew ? 'Nuevo producto' : 'Editar producto';
    $('edit-name').value = p.name || '';
    $('edit-category').value = p.category || 'anillo';
    $('edit-tag').value = p.tag || '';
    $('edit-material').value = p.material || '';
    $('edit-price').value = p.price != null ? p.price : '';
    $('edit-description').value = p.description || '';
    $('edit-photo').value = p.photo || '';
    $('edit-photo-preview').src = p.photo || '';
    $('edit-active').checked = p.active !== false;
    $('edit-featured').checked = p.featured_rank != null;
    $('photo-picker').hidden = true;
    photoStatus('');   /* el aviso del producto anterior no se queda pegado */

    $('drawer-overlay').hidden = false;
    $('drawer').hidden = false;
    document.body.style.overflow = 'hidden';
    $('edit-name').focus();
  }

  function closeDrawer() {
    currentId = null;
    $('drawer-overlay').hidden = true;
    $('drawer').hidden = true;
    document.body.style.overflow = '';
  }

  /* aplica el valor de un input al producto abierto y marca dirty */
  function applyField(key, value) {
    var p = findProduct(currentId);
    if (!p) return;
    p[key] = value;
    dirty[p.id] = true;
    renderGrid();
    updateSaveAll();
  }

  function initDrawer() {
    $('drawer-close').addEventListener('click', closeDrawer);
    $('drawer-overlay').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && currentId) closeDrawer();
    });

    $('edit-name').addEventListener('input', function () { applyField('name', this.value); });
    $('edit-category').addEventListener('change', function () { applyField('category', this.value); });
    $('edit-tag').addEventListener('change', function () { applyField('tag', this.value); });
    $('edit-material').addEventListener('input', function () { applyField('material', this.value); });
    $('edit-price').addEventListener('input', function () {
      applyField('price', this.value === '' ? null : parseFloat(this.value));
    });
    $('edit-description').addEventListener('input', function () { applyField('description', this.value); });
    $('edit-active').addEventListener('change', function () { applyField('active', this.checked); });

    $('edit-featured').addEventListener('change', function () {
      var p = findProduct(currentId);
      if (!p) return;
      alternarDestacado(p, this.checked);
      renderGrid();
      updateSaveAll();
    });
    $('edit-photo').addEventListener('input', function () {
      $('edit-photo-preview').src = this.value;
      applyField('photo', this.value);
    });

    /* selector de fotos existentes */
    $('photo-picker-btn').addEventListener('click', function () {
      var picker = $('photo-picker');
      if (picker.hidden) buildPhotoPicker();
      picker.hidden = !picker.hidden;
    });

    /* subir una foto nueva desde la galería o el disco */
    $('photo-upload-btn').addEventListener('click', function () {
      if (demoMode) { photoStatus('En modo demo no se pueden subir fotos.', 'err'); return; }
      $('photo-file').click();
    });
    $('photo-file').addEventListener('change', function () {
      var file = this.files && this.files[0];
      this.value = '';   /* permite volver a elegir el mismo archivo */
      if (file) subirFoto(file);
    });

    $('save-btn').addEventListener('click', function () {
      if (currentId) saveProducts([currentId]);
    });

    $('delete-btn').addEventListener('click', function () {
      var p = findProduct(currentId);
      if (!p) return;
      if (!confirm('¿Eliminar "' + p.name + '" definitivamente?\n(Si solo quieres ocultarlo del catálogo, usa el switch de visibilidad.)')) return;
      deleteProduct(p.id);
    });
  }

  /* ══════════════════════════════════════════
     SUBIR FOTO (galería del móvil o disco)
  ══════════════════════════════════════════ */
  function photoStatus(msg, tipo) {
    var el = $('photo-status');
    if (!msg) { el.hidden = true; return; }
    el.textContent = msg;
    el.className = 'photo-status' + (tipo ? ' ' + tipo : '');
    el.hidden = false;
  }

  /* Redimensiona en el navegador antes de subir: una foto de celular
     pesa 3–5 MB, y subirla tal cual llena el plan gratuito y hace la
     web lenta. createImageBitmap respeta la orientación EXIF, así que
     las fotos verticales no acaban tumbadas. */
  function comprimirImagen(file) {
    var carga = (typeof createImageBitmap === 'function')
      ? createImageBitmap(file, { imageOrientation: 'from-image' })
      : new Promise(function (resolve, reject) {
          var url = URL.createObjectURL(file);
          var img = new Image();
          img.onload  = function () { URL.revokeObjectURL(url); resolve(img); };
          img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('no se pudo leer la imagen')); };
          img.src = url;
        });

    return carga.then(function (src) {
      var w = src.width  || src.naturalWidth;
      var h = src.height || src.naturalHeight;
      if (!w || !h) throw new Error('no se pudo leer la imagen');

      var escala = Math.min(1, MAX_LADO / Math.max(w, h));
      var cw = Math.max(1, Math.round(w * escala));
      var ch = Math.max(1, Math.round(h * escala));

      var canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      canvas.getContext('2d').drawImage(src, 0, 0, cw, ch);
      if (src.close) src.close();

      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error('no se pudo procesar la imagen'));
        }, 'image/jpeg', CALIDAD);
      });
    });
  }

  function subirFoto(file) {
    if (!db) return;
    if (!/^image\//.test(file.type)) { photoStatus('Ese archivo no es una imagen.', 'err'); return; }
    if (file.size > MAX_ORIGINAL)    { photoStatus('La imagen pesa más de 15 MB.', 'err'); return; }

    var btn = $('photo-upload-btn');
    btn.disabled = true;
    photoStatus('Preparando la imagen…');

    comprimirImagen(file)
      .then(function (blob) {
        photoStatus('Subiendo… (' + Math.round(blob.size / 1024) + ' KB)');
        /* nombre único: nunca pisa una foto ya publicada */
        var nombre = (currentId || 'foto') + '-' + Date.now() + '.jpg';
        return db.storage.from(BUCKET)
          .upload(nombre, blob, { contentType: 'image/jpeg', upsert: false })
          .then(function (res) {
            if (res.error) throw res.error;
            return db.storage.from(BUCKET).getPublicUrl(nombre);
          });
      })
      .then(function (pub) {
        var url = pub && pub.data && pub.data.publicUrl;
        if (!url) throw new Error('Supabase no devolvió la URL pública');
        $('edit-photo').value = url;
        $('edit-photo-preview').src = url;
        applyField('photo', url);
        photoStatus('Foto lista ✓ — recuerda guardar los cambios.', 'ok');
      })
      .catch(function (err) {
        var m = (err && err.message) || '';
        if (/bucket.*not found|not found.*bucket/i.test(m)) {
          photoStatus('Falta crear el almacén de fotos en Supabase (bucket "' + BUCKET + '").', 'err');
        } else if (/policy|permission|unauthorized|row-level/i.test(m)) {
          photoStatus('Tu cuenta no tiene permiso para subir fotos. Falta la política del bucket.', 'err');
        } else {
          photoStatus('No se pudo subir la foto. ' + m, 'err');
        }
      })
      .then(function () { btn.disabled = false; });
  }

  function buildPhotoPicker() {
    var grid = $('photo-picker-grid');
    if (grid.childNodes.length) return; /* ya construido */
    var current = $('edit-photo').value;
    for (var i = 1; i <= TOTAL_FOTOS; i++) {
      (function (n) {
        var src = 'assets/img/foto-' + n + '.jpeg';
        var img = document.createElement('img');
        img.src = src;
        img.loading = 'lazy';
        img.alt = 'foto-' + n;
        if (src === current) img.className = 'selected';
        img.addEventListener('click', function () {
          $('edit-photo').value = src;
          $('edit-photo-preview').src = src;
          applyField('photo', src);
          var sel = grid.querySelector('.selected');
          if (sel) sel.classList.remove('selected');
          img.classList.add('selected');
        });
        grid.appendChild(img);
      })(i);
    }
  }

  /* ══════════════════════════════════════════
     GUARDADO / BORRADO
  ══════════════════════════════════════════ */
  function rowFor(p) {
    var fila = {
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description || '',
      material: p.material || '',
      price: p.price == null ? 0 : p.price,
      photo: p.photo || '',
      tag: p.tag || '',
      active: p.active !== false,
      sort_order: p.sort_order || 0
    };
    /* solo si la columna existe: ver soportaDestacados en loadProducts */
    if (soportaDestacados) {
      fila.featured_rank = p.featured_rank == null ? null : p.featured_rank;
    }
    return fila;
  }

  /* ══════════════════════════════════════════
     DESTACADOS (salen primero en la web)
  ══════════════════════════════════════════ */
  function destacados() {
    return products
      .filter(function (p) { return p.featured_rank != null; })
      .sort(function (a, b) { return a.featured_rank - b.featured_rank; });
  }

  /* Renumera 1,2,3… para que no queden huecos al quitar uno del medio. */
  function renumerarDestacados(lista) {
    (lista || destacados()).forEach(function (p, i) {
      if (p.featured_rank !== i + 1) {
        p.featured_rank = i + 1;
        dirty[p.id] = true;
      }
    });
  }

  function moverDestacado(id, dir) {
    var lista = destacados();
    var i = -1;
    for (var k = 0; k < lista.length; k++) { if (lista[k].id === id) { i = k; break; } }
    var j = i + dir;
    if (i < 0 || j < 0 || j >= lista.length) return;   /* ya está en el extremo */

    var tmp = lista[i];
    lista[i] = lista[j];
    lista[j] = tmp;

    renumerarDestacados(lista);
    renderAll();
  }

  function alternarDestacado(p, activar) {
    if (activar) {
      var max = 0;
      products.forEach(function (x) {
        if (x.featured_rank != null && x.featured_rank > max) max = x.featured_rank;
      });
      p.featured_rank = max + 1;
    } else {
      p.featured_rank = null;
    }
    dirty[p.id] = true;
    renumerarDestacados();
  }

  function clearDirty(ids) {
    ids.forEach(function (id) {
      delete dirty[id];
      var p = findProduct(id);
      if (p) delete p._isNew;
    });
    renderGrid();
    updateSaveAll();
  }

  function saveProducts(ids) {
    var rows = ids.map(findProduct).filter(Boolean);
    if (!rows.length) return;

    /* validación mínima */
    for (var i = 0; i < rows.length; i++) {
      if (!String(rows[i].name || '').trim()) {
        toast('El nombre no puede estar vacío.', 'error');
        openDrawer(rows[i].id);
        return;
      }
    }

    if (demoMode) {
      clearDirty(ids);
      toast('Cambios aplicados (modo demo — no se guardan en BD)', 'ok');
      return;
    }

    var btn = $('save-btn');
    btn.disabled = true;
    db.from('products').upsert(rows.map(rowFor)).then(function (res) {
      btn.disabled = false;
      if (res.error) {
        toast('Error al guardar: ' + res.error.message, 'error');
        return;
      }
      clearDirty(ids);
      toast(ids.length === 1 ? 'Producto guardado ✓' : ids.length + ' productos guardados ✓', 'ok');
    });
  }

  function deleteProduct(id) {
    function done() {
      products = products.filter(function (p) { return p.id !== id; });
      delete dirty[id];
      closeDrawer();
      renderGrid();
      updateSaveAll();
      toast('Producto eliminado', 'ok');
    }
    var p = findProduct(id);
    if (demoMode || (p && p._isNew)) { done(); return; }
    db.from('products').delete().eq('id', id).then(function (res) {
      if (res.error) {
        toast('Error al eliminar: ' + res.error.message, 'error');
        return;
      }
      done();
    });
  }

  /* ══════════════════════════════════════════
     TOOLBAR / TOPBAR
  ══════════════════════════════════════════ */
  function initToolbar() {
    $('search-input').addEventListener('input', function () {
      searchTerm = this.value.trim();
      renderGrid();
    });

    $('new-product-btn').addEventListener('click', function () {
      var maxSort = products.reduce(function (m, p) {
        return Math.max(m, p.sort_order || 0);
      }, 0);
      var p = {
        id: 'p' + Date.now().toString(36),
        name: '',
        category: activeCat !== 'todos' ? activeCat : 'anillo',
        description: '',
        material: 'Plata 925',
        price: 50,
        photo: '',
        tag: '',
        active: true,
        sort_order: maxSort + 1,
        featured_rank: null,
        _isNew: true
      };
      products.push(p);
      dirty[p.id] = true;
      renderGrid();
      updateSaveAll();
      openDrawer(p.id);
    });

    $('save-all-btn').addEventListener('click', function () {
      saveProducts(Object.keys(dirty));
    });

    $('logout-btn').addEventListener('click', logout);
    $('import-btn').addEventListener('click', importCatalog);

    window.addEventListener('beforeunload', function (ev) {
      if (dirtyCount() > 0 && !demoMode) {
        ev.preventDefault();
        ev.returnValue = '';
      }
    });
  }

  /* ── init ────────────────────────────────── */
  initLogin();
  initDrawer();
  initToolbar();
})();
