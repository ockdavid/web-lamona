/* la Mona — Configuración de Supabase
   ─────────────────────────────────────────────────────────
   Proyecto conectado. Guía completa en supabase/README-SUPABASE.md.
   La publishable key es pública por diseño (viaja al navegador);
   lo que protege la base de datos son las políticas RLS de
   supabase/schema.sql, no el secreto de esta clave.
   ───────────────────────────────────────────────────────── */
(function () {
  "use strict";
  window.__SUPABASE__ = {
    /* Settings → API → Project URL */
    url: "https://ponjilrwakjgwkzyrhdd.supabase.co",

    /* Settings → API Keys → publishable key */
    anonKey: "sb_publishable_y8c7m68SJ2qxruMcq_uB0A_bpfHXbez",

    /* Únicos correos con acceso al panel admin.
       ⚠️ Deben coincidir con los del schema.sql y con los
       usuarios creados en Authentication → Users. */
    allowedEmails: [
      "davidwp37@gmail.com",
      "alandeo@pucp.edu.pe",
      "karina_jesica_v@hotmail.com"
    ]
  };
})();
