# Activar Supabase para el panel admin de la Mona

El panel (`admin.html`) ya está listo y funciona en **modo demo** sin configuración.
Para que guarde de verdad en base de datos, sigue estos 5 pasos (~10 minutos):

## 1. Crear el proyecto
1. Regístrate en [supabase.com](https://supabase.com) (gratis).
2. **New project** → nombre: `lamona` → elige una contraseña de base de datos → región: `South America (São Paulo)`.

## 2. Crear la tabla de productos
1. En el dashboard del proyecto: **SQL Editor → New query**.
2. Antes de ejecutar, **edita los 2 correos placeholder** (`correo2@cambiar.com`, `correo3@cambiar.com`) en `schema.sql` por los correos reales.
3. Copia todo el contenido de `supabase/schema.sql`, pégalo y presiona **Run**.

## 3. Crear los 3 usuarios autorizados
1. **Authentication → Users → Add user → Create new user**.
2. Crea un usuario por cada correo autorizado, con su contraseña.
   Marca **Auto Confirm User** para no depender del correo de confirmación.
3. (Recomendado) **Authentication → Sign In / Up → desactivar "Allow new users to sign up"**
   para que nadie más pueda registrarse.

## 4. Conectar el sitio
1. **Settings → API**: copia **Project URL** y **anon public key**.
2. Pégalos en `lib/supabase-config.js` (campos `url` y `anonKey`).
3. Actualiza también `allowedEmails` con los 3 correos reales.

## 5. Importar el catálogo inicial
1. Abre `admin.html`, inicia sesión con uno de los 3 correos.
2. Como la tabla está vacía, el panel te ofrecerá **"Importar catálogo inicial (69 piezas)"** — un clic y listo.

---

### Seguridad
- La `anon key` es pública por diseño; la protección real son las políticas RLS del `schema.sql`:
  cualquiera puede **leer** el catálogo, pero solo los 3 correos autenticados pueden **escribir**.
- La lista de correos en `lib/supabase-config.js` es solo un filtro de interfaz;
  la que manda es la de las políticas en `schema.sql`.

### Próximos pasos (opcionales)
- Migrar el catálogo público (`index.html`) a leer desde Supabase en vez de `lib/manifest.js`.
- Subida de fotos nuevas a Supabase Storage desde el panel (Fase 4 del roadmap).
