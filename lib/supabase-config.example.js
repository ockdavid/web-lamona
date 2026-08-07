/* la Mona — Plantilla de configuración de Supabase
   ─────────────────────────────────────────────────────────
   Este archivo SÍ se versiona; el real NO (está en .gitignore).

   PARA ACTIVAR:
   1. Copia este archivo como  lib/supabase-config.js
   2. Rellena url y anonKey con los valores de tu proyecto
      (Supabase → Settings → API)
   3. Ajusta allowedEmails con los correos del equipo

   Sin lib/supabase-config.js el panel arranca en MODO DEMO
   (se puede explorar, pero no guarda en la base de datos).

   NOTA: en un sitio estático esta clave viaja al navegador de
   cualquier visitante, así que no es un secreto. Lo que protege
   la base de datos son las políticas RLS de supabase/schema.sql.
   ───────────────────────────────────────────────────────── */
(function () {
  "use strict";
  window.__SUPABASE__ = {
    /* Settings → API → Project URL */
    url: "TU_SUPABASE_URL",

    /* Settings → API Keys → publishable key */
    anonKey: "TU_SUPABASE_PUBLISHABLE_KEY",

    /* Únicos correos con acceso al panel admin.
       ⚠️ Deben coincidir con los del schema.sql y con los
       usuarios creados en Authentication → Users. */
    allowedEmails: [
      "correo1@cambiar.com",
      "correo2@cambiar.com",
      "correo3@cambiar.com"
    ]
  };
})();
