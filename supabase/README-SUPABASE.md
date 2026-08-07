# Activar Supabase para el panel admin de la Mona

El panel (`admin.html`) funciona en **modo demo** mientras no haya credenciales,
y en **modo conectado** cuando las hay.

**Estado actual:** proyecto `ponjilrwakjgwkzyrhdd` creado y credenciales ya pegadas
en `lib/supabase-config.js`. Correo autorizado: `davidwp37@gmail.com`.
Quedan por hacer los pasos 2, 3 y 5 dentro del dashboard de Supabase.

## 1. Crear el proyecto ✅ hecho
1. Regístrate en [supabase.com](https://supabase.com) (gratis).
2. **New project** → nombre: `lamona` → elige una contraseña de base de datos → región: `South America (São Paulo)`.

## 2. Crear la tabla de productos
1. En el dashboard del proyecto: **SQL Editor → New query**.
2. Copia todo el contenido de `supabase/schema.sql`, pégalo y presiona **Run**.

## 3. Crear el usuario autorizado
1. **Authentication → Users → Add user → Create new user**.
2. Crea el usuario `davidwp37@gmail.com` con su contraseña.
   Marca **Auto Confirm User** para no depender del correo de confirmación.
3. (Recomendado) **Authentication → Sign In / Up → desactivar "Allow new users to sign up"**
   para que nadie más pueda registrarse.

Para autorizar a alguien más después: créale el usuario aquí, y añade su correo
tanto a `allowedEmails` en `lib/supabase-config.js` como a los dos bloques de
correos en `schema.sql` (reejecutando el archivo).

## 4. Conectar el sitio ✅ hecho
1. **Settings → API**: copia **Project URL** y la **publishable key**.
2. Pégalos en `lib/supabase-config.js` (campos `url` y `anonKey`).
3. Actualiza también `allowedEmails` con los correos reales.

## 5. Importar el catálogo inicial
1. Abre `admin.html` **servido por HTTP** (Hostinger o un servidor local — con
   `file://` la sesión de Supabase no persiste) e inicia sesión.
2. Como la tabla está vacía, el panel te ofrecerá **"Importar catálogo inicial (69 piezas)"** — un clic y listo.

---

### Seguridad
- La publishable key es pública por diseño (viaja al navegador en cualquier sitio estático);
  la protección real son las políticas RLS del `schema.sql`: cualquiera puede **leer**
  el catálogo, pero solo los correos autenticados y autorizados pueden **escribir**.
- La lista de correos en `lib/supabase-config.js` es solo un filtro de interfaz;
  la que manda es la de las políticas en `schema.sql`.

### Próximos pasos (opcionales)
- Migrar el catálogo público (`index.html`) a leer desde Supabase en vez de `lib/manifest.js`.
- Subida de fotos nuevas a Supabase Storage desde el panel (Fase 4 del roadmap).
