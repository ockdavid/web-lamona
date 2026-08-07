#!/usr/bin/env node
/* la Mona — genera lib/supabase-config.js desde variables de entorno.
   ─────────────────────────────────────────────────────────
   Lo ejecuta Cloudflare Pages en cada despliegue:
     Build command:     node build-config.js
     Output directory:  /

   Variables a definir en Pages → Settings → Environment variables:
     SUPABASE_URL       https://xxxxxxxx.supabase.co
     SUPABASE_ANON_KEY  sb_publishable_...
     ADMIN_EMAILS       correo1@x.com,correo2@y.com

   En local no hace falta: se copia lib/supabase-config.example.js
   a lib/supabase-config.js y se rellena a mano.
   ───────────────────────────────────────────────────────── */
'use strict';

var fs = require('fs');
var path = require('path');

var url = (process.env.SUPABASE_URL || '').trim();
var key = (process.env.SUPABASE_ANON_KEY || '').trim();
var emails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(function (s) { return s.trim(); })
  .filter(Boolean);

/* Falla el despliegue en vez de publicar un panel en modo demo sin
   avisar. Cloudflare mantiene vivo el deploy anterior si esto falla. */
var missing = [];
if (!url) missing.push('SUPABASE_URL');
if (!key) missing.push('SUPABASE_ANON_KEY');
if (!emails.length) missing.push('ADMIN_EMAILS');

if (missing.length) {
  console.error('\n[build-config] Faltan variables de entorno: ' + missing.join(', '));
  console.error('[build-config] Defínelas en Cloudflare Pages → Settings → Environment variables.\n');
  process.exit(1);
}

var out = '/* Generado por build-config.js en el despliegue. NO editar a mano. */\n' +
  '(function () {\n' +
  '  "use strict";\n' +
  '  window.__SUPABASE__ = {\n' +
  '    url: ' + JSON.stringify(url) + ',\n' +
  '    anonKey: ' + JSON.stringify(key) + ',\n' +
  '    allowedEmails: ' + JSON.stringify(emails) + '\n' +
  '  };\n' +
  '})();\n';

var dest = path.join(__dirname, 'lib', 'supabase-config.js');
fs.writeFileSync(dest, out, 'utf8');

console.log('[build-config] lib/supabase-config.js generado — ' +
            emails.length + ' correo(s) autorizado(s).');
