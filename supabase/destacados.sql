-- ════════════════════════════════════════════════════════════
-- la Mona — Productos destacados (salen primero en el catálogo)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
--
-- Una sola columna en vez de dos (un booleano + un número) para que
-- no puedan contradecirse:
--   featured_rank = NULL  → producto normal, va en su categoría
--   featured_rank = 1,2,3 → destacado, sale al principio en ese orden
-- ════════════════════════════════════════════════════════════

alter table public.products
  add column if not exists featured_rank integer;

comment on column public.products.featured_rank is
  'NULL = normal. Un número lo destaca al principio del catálogo, ordenados de menor a mayor.';

-- Consultar los destacados actuales
select id, name, featured_rank
  from public.products
 where featured_rank is not null
 order by featured_rank;
