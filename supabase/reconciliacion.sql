-- ════════════════════════════════════════════════════════════
-- la Mona — Reconciliar la base con lo que hay publicado
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
--
-- Se verificó imagen por imagen (no solo por nombre):
--   · 6 filas muestran un producto que YA está publicado con otro id
--     → se desactivan (active = false). No se borra nada: se pueden
--       reactivar desde el panel cuando quieras.
--   · 8 productos publicados no existían en la base → se insertan,
--     para que se puedan editar desde el panel.
--   · p37 (corazón con circonita) y p46 (set con aretes de gota) SÍ son
--     productos distintos y siguen activos: el catálogo los publicará.
-- ════════════════════════════════════════════════════════════

-- ── 1. Desactivar las 6 filas que repiten un producto publicado ──
--    p23, p26 → mismo colgante oval grabado que p22
--    p30, p31 → mismo collar de nombre en cursiva que p28 y p29
--    p53, p55 → misma pulsera de bolitas con corazón que p40
update public.products
   set active = false
 where id in ('p23', 'p26', 'p30', 'p31', 'p53', 'p55');

-- ── 2. Insertar los 8 productos publicados que faltaban ─────────
insert into public.products
  (id, name, category, description, material, price, photo, tag, active, sort_order)
values
  ('p70', 'Colgante Cuarzo Rosa', 'collar', 'Dije circular con cuarzo rosa natural engarzado en hilo de plata. Pura ternura.', 'Plata 925', 50, 'assets/img/foto-70.jpeg', '', true, 62),
  ('p71', 'Collar Coffee Addict', 'collar', 'Dije dorado redondo con grabado "coffee addict" e icono de taza. Para las amantes del café.', 'Plata 925', 50, 'assets/img/foto-71.jpeg', '', true, 63),
  ('p72', 'Anillo Grano de Café', 'anillo', 'Anillo minimalista en plata con charm de grano de café. Ideal para cafeteras de corazón.', 'Plata 925', 50, 'assets/img/foto-72.jpeg', '', true, 64),
  ('p73', 'Aretes Taza con Corazón', 'arete', 'Topo plateado con forma de taza de té y corazón grabado. Dulces y únicos.', 'Plata 925', 50, 'assets/img/foto-73.jpeg', '', true, 65),
  ('p74', 'Aretes Asimétricos Café', 'arete', 'Un grano de café y una taza: la pareja perfecta para quienes aman el café.', 'Plata 925', 50, 'assets/img/foto-74.jpeg', '', true, 66),
  ('p75', 'Aretes Taza de Café Dorados', 'arete', 'Topo dorado circular con taza de café grabada. Pequeños, delicados y con mucho estilo.', 'Plata 925', 50, 'assets/img/foto-76.jpeg', '', true, 67),
  ('p76', 'Conjunto Grano de Café', 'conjunto', 'Collar con dije y aretes colgantes en forma de grano de café. Todo en plata 925.', 'Plata 925', 50, 'assets/img/foto-77.jpeg', '', true, 68),
  ('p77', 'Conjunto Café — Collar y Topos', 'conjunto', 'Collar con dije grano de café + aretes topo a juego. Set completo en plata.', 'Plata 925', 50, 'assets/img/foto-78.jpeg', '', true, 69)
on conflict (id) do nothing;

-- ── 3. Comprobación ─────────────────────────────────────────────
select
  count(*) filter (where active)     as activos,
  count(*) filter (where not active) as ocultos,
  count(*)                           as total
from public.products;
