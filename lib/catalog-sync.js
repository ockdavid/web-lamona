/* la Mona — sincroniza el catálogo público con Supabase.
   ─────────────────────────────────────────────────────────
   Las 69 tarjetas siguen escritas en index.html: Google las ve, la
   página pinta al instante y el sitio funciona aunque Supabase no
   responda. Este script las actualiza con lo que haya en la base.

   Empareja por data-id (tarjeta) ↔ id (fila). Usa la API REST
   directamente para no cargar el SDK (203 KB) en la página pública.

   Si algo falla, no toca nada: se queda el catálogo estático.
   ───────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var CFG = window.__SUPABASE__ || {};
  if (typeof CFG.url !== 'string' || CFG.url.indexOf('https://') !== 0) return;
  if (typeof CFG.anonKey !== 'string' || !CFG.anonKey) return;

  var WA = '51997918216';
  var CAT_LABEL = {
    anillo: 'Anillo', collar: 'Collar', pulsera: 'Pulsera',
    arete: 'Arete', conjunto: 'Conjunto'
  };

  function money(v) {
    var n = Number(v);
    if (!isFinite(n)) return null;
    return 'S/. ' + (n % 1 === 0 ? String(n) : n.toFixed(2));
  }

  function waHref(name) {
    return 'https://wa.me/' + WA + '?text=' +
      encodeURIComponent('Hola! Me interesa: ' + name + ' 🌸');
  }

  /* ── actualizar una tarjeta existente ─────── */
  function applyRow(card, row) {
    var name = row.name || '';

    var h3 = card.querySelector('.card-name');
    if (h3 && name && h3.textContent !== name) h3.textContent = name;

    var desc = card.querySelector('.card-desc');
    if (desc && typeof row.description === 'string' && desc.textContent !== row.description) {
      desc.textContent = row.description;
    }

    var precio = money(row.price);
    if (precio) {
      var span = card.querySelector('.card-price');
      if (span && span.textContent !== precio) span.textContent = precio;
      card.setAttribute('data-price', String(Number(row.price)));
    }

    if (row.category && CAT_LABEL[row.category]) {
      card.setAttribute('data-cat', row.category);
      var cat = card.querySelector('.card-cat');
      if (cat) cat.textContent = CAT_LABEL[row.category];
    }

    var img = card.querySelector('.card-img-wrap img');
    if (img) {
      if (row.photo && img.getAttribute('src') !== row.photo) img.setAttribute('src', row.photo);
      if (name) img.setAttribute('alt', name);
    }

    /* la etiqueta puede aparecer, cambiar o desaparecer */
    var wrap = card.querySelector('.card-img-wrap');
    var tagEl = card.querySelector('.card-tag');
    var tag = (row.tag || '').trim();
    if (tag && !tagEl && wrap) {
      tagEl = document.createElement('span');
      tagEl.className = 'card-tag';
      wrap.appendChild(tagEl);
    }
    if (tagEl) {
      if (tag) tagEl.textContent = tag;
      else tagEl.remove();
    }

    /* el enlace de WhatsApp lleva el nombre dentro */
    var link = card.querySelector('.card-footer a.btn-wa');
    if (link && name) link.setAttribute('href', waHref(name));
  }

  /* ── crear una tarjeta nueva copiando la estructura ── */
  function buildCard(row, modelo) {
    var card = modelo.cloneNode(true);
    card.setAttribute('data-id', row.id);
    card.classList.remove('cat-collapsed', 'hidden');

    /* .product-card nace con opacity:0 y solo la clase "revealed" la
       hace visible. El IntersectionObserver que la reparte se registra
       al arrancar, así que nunca alcanza a una tarjeta creada después:
       sin esto queda invisible ocupando su hueco en la rejilla. */
    card.classList.add('revealed');
    card.style.transitionDelay = '0s';

    /* Fuera loading="lazy" en las tarjetas creadas por JS.
       Comprobado en producción: el navegador no llega a registrar la
       imagen de un nodo clonado, se queda con complete=false y no la
       pide NUNCA, ni al hacer scroll. Las tarjetas del HTML sí pueden
       seguir siendo lazy; estas son pocas y deben verse sí o sí. */
    var foto = card.querySelector('.card-img-wrap img');
    if (foto) foto.removeAttribute('loading');

    /* el botón del carrito se re-engancha con el evento de abajo */
    var btn = card.querySelector('.btn-add-cart');
    if (btn) {
      var a = document.createElement('a');
      a.className = 'btn btn-wa btn-sm';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Pedir';
      btn.parentNode.replaceChild(a, btn);
    }
    applyRow(card, row);
    return card;
  }

  var url = CFG.url + '/rest/v1/products?select=*&order=sort_order.asc';

  /* La consulta arranca ya, en paralelo con el resto de la carga, pero
     no se aplica hasta que el DOM esté listo: main.js engancha en
     DOMContentLoaded y debe oír el evento de abajo. */
  var domReady = new Promise(function (resolve) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { resolve(); });
    } else {
      resolve();
    }
  });

  var pedido = fetch(url, {
    headers: { apikey: CFG.anonKey, Authorization: 'Bearer ' + CFG.anonKey },
    cache: 'no-store'
  }).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  });

  Promise.all([pedido, domReady])
    .then(function (res) {
      var rows = res[0];
      /* respuesta vacía o rara: mejor quedarse con el catálogo estático
         que dejar la tienda sin productos */
      if (!Array.isArray(rows) || !rows.length) return;

      var grid = document.getElementById('product-grid');
      var modelo = document.querySelector('.product-card');
      if (!grid || !modelo) return;

      var cambios = 0, ocultos = 0, creados = 0;

      rows.forEach(function (row) {
        if (!row || !row.id) return;
        var card = grid.querySelector('.product-card[data-id="' + row.id + '"]');

        if (card) {
          if (row.active === false) { card.remove(); ocultos++; }
          else { applyRow(card, row); cambios++; }
          return;
        }
        /* fila sin tarjeta: producto añadido desde el panel */
        if (row.active !== false) {
          var nueva = buildCard(row, modelo);
          /* Se coloca junto a las de su categoría en vez de al final de
             todo: si no, una pulsera nueva aparecía la última de 72 y
             pasaba desapercibida. */
          var hermanas = CAT_LABEL[row.category]
            ? grid.querySelectorAll('.product-card[data-cat="' + row.category + '"]')
            : null;
          var ultima = hermanas && hermanas.length ? hermanas[hermanas.length - 1] : null;
          if (ultima) grid.insertBefore(nueva, ultima.nextSibling);
          else grid.appendChild(nueva);
          creados++;
        }
      });

      /* Destacados al principio del catálogo, en el orden que les haya
         dado el panel. Se recorre al revés e insertando en primera
         posición, así el primero acaba el primero. */
      var destacados = rows
        .filter(function (r) { return r.featured_rank != null && r.active !== false; })
        .sort(function (a, b) { return a.featured_rank - b.featured_rank; });

      for (var i = destacados.length - 1; i >= 0; i--) {
        var dc = grid.querySelector('.product-card[data-id="' + destacados[i].id + '"]');
        if (dc) grid.insertBefore(dc, grid.firstChild);
      }

      /* el subtítulo del catálogo también lleva el precio escrito */
      var sub = document.getElementById('catalog-sub');
      if (sub) {
        var precios = [];
        grid.querySelectorAll('.product-card[data-price]').forEach(function (c) {
          var p = parseFloat(c.getAttribute('data-price'));
          if (isFinite(p)) precios.push(p);
        });
        if (precios.length) {
          precios.sort(function (a, b) { return a - b; });
          var min = precios[0], max = precios[precios.length - 1];
          sub.textContent = (min === max ? 'Todas a ' + money(min) : 'Desde ' + money(min)) +
                            ' · Envíos a todo el Perú · Pago al recibir';
        }
      }

      document.dispatchEvent(new CustomEvent('catalog:updated', {
        detail: { actualizados: cambios, retirados: ocultos, nuevos: creados }
      }));
    })
    .catch(function () {
      /* sin red o Supabase caído: la web sigue con lo que ya está en el HTML */
    });
})();
