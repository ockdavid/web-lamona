/* la Mona — Configuración de Supabase
   ─────────────────────────────────────────────────────────
   PASOS PARA ACTIVAR (ver supabase/README-SUPABASE.md):
   1. Crea una cuenta y un proyecto en https://supabase.com
   2. Ejecuta supabase/schema.sql en el SQL Editor del proyecto
   3. Crea los 3 usuarios en Authentication → Users
   4. Pega aquí la URL y la anon key (Settings → API)
   Mientras estos valores sean placeholders, el panel admin
   funcionará en MODO DEMO (sin guardar en base de datos).
   ───────────────────────────────────────────────────────── */
(function () {
  "use strict";
  window.__SUPABASE__ = {
    /* Settings → API → Project URL  (ej: https://abcdefgh.supabase.co) */
    url: "TU_SUPABASE_URL",

    /* Settings → API → anon / public key */
    anonKey: "TU_SUPABASE_ANON_KEY",

    /* Únicos correos con acceso al panel admin.
       ⚠️ Deben coincidir con los del schema.sql y con los
       usuarios creados en Authentication → Users. */
    allowedEmails: [
      "davidwp37@gmail.com",
      "correo2@cambiar.com",
      "correo3@cambiar.com"
    ]
  };
})();
