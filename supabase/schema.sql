-- ════════════════════════════════════════════════════════════
-- la Mona — Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ════════════════════════════════════════════════════════════

-- ── Tabla de productos ──────────────────────────────────────
create table if not exists public.products (
  id          text primary key,                  -- "p01" … compatible con lib/manifest.js
  name        text not null,
  category    text not null check (category in ('anillo','collar','pulsera','arete','conjunto')),
  description text default '',
  material    text default 'Plata 925',
  price       numeric(10,2) default 50,          -- en soles (S/.)
  photo       text default '',                   -- ruta relativa (assets/img/...) o URL completa
  tag         text default '',                   -- '', Personalizable, Set, Nuevo, Baño de oro, Exclusivo
  active      boolean default true,
  sort_order  integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── updated_at automático en cada UPDATE ────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── Seguridad: Row Level Security ───────────────────────────
alter table public.products enable row level security;

-- Lectura pública (el catálogo del sitio podrá leer sin login)
drop policy if exists "lectura publica" on public.products;
create policy "lectura publica"
  on public.products for select
  using (true);

-- Escritura SOLO para los correos autorizados.
-- ⚠️ IMPORTANTE: estos correos deben coincidir con
--    lib/supabase-config.js y con los usuarios creados
--    en Authentication → Users.
--    Para sumar a alguien: añádelo a la lista de AMBOS
--    bloques de abajo, vuelve a ejecutar este archivo y
--    agrégalo también en lib/supabase-config.js.
drop policy if exists "escritura admins" on public.products;
create policy "escritura admins"
  on public.products for all
  to authenticated
  using (
    (auth.jwt() ->> 'email') in (
      'davidwp37@gmail.com',
      'alandeo@pucp.edu.pe',
      'karina_jesica_v@hotmail.com'
    )
  )
  with check (
    (auth.jwt() ->> 'email') in (
      'davidwp37@gmail.com',
      'alandeo@pucp.edu.pe',
      'karina_jesica_v@hotmail.com'
    )
  );
