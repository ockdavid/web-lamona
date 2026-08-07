-- ════════════════════════════════════════════════════════════
-- la Mona — Almacén de fotos de productos (Supabase Storage)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
--
-- Habilita el botón "Subir foto" del panel. Sin esto, el panel
-- avisa de que falta el almacén y no rompe nada.
-- ════════════════════════════════════════════════════════════

-- ── Bucket público de fotos ─────────────────────────────────
-- El panel comprime a JPEG antes de subir (~200–400 KB por foto),
-- así que 5 MB de tope es de sobra y frena cualquier subida rara.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ── Lectura pública ─────────────────────────────────────────
-- Las fotos salen en la web, así que cualquiera debe poder verlas.
drop policy if exists "fotos lectura publica" on storage.objects;
create policy "fotos lectura publica"
  on storage.objects for select
  using (bucket_id = 'productos');

-- ── Escritura solo para los correos autorizados ─────────────
-- ⚠️ Esta lista debe coincidir con la de schema.sql y con
--    allowedEmails de lib/supabase-config.js.
drop policy if exists "fotos escritura admins" on storage.objects;
create policy "fotos escritura admins"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'productos'
    and (auth.jwt() ->> 'email') in (
      'davidwp37@gmail.com',
      'alandeo@pucp.edu.pe',
      'karina_jesica_v@hotmail.com'
    )
  )
  with check (
    bucket_id = 'productos'
    and (auth.jwt() ->> 'email') in (
      'davidwp37@gmail.com',
      'alandeo@pucp.edu.pe',
      'karina_jesica_v@hotmail.com'
    )
  );
