# Activar Supabase para el panel admin de la Mona

El panel (`admin.html`) funciona en **modo demo** mientras no haya credenciales,
y en **modo conectado** cuando las hay.

> **Las credenciales no se versionan.** `lib/supabase-config.js` está en
> `.gitignore`. En el repo solo vive la plantilla `lib/supabase-config.example.js`.
> Tras clonar, copia la plantilla y rellénala — sin ese archivo el panel
> arranca en modo demo.

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

## 4. Conectar el sitio
1. Copia `lib/supabase-config.example.js` a `lib/supabase-config.js`
   (ese nombre está en `.gitignore`, así que no se sube al repo).
2. **Settings → API**: copia **Project URL** y la **publishable key**.
3. Pégalos en `lib/supabase-config.js` (campos `url` y `anonKey`).
4. Actualiza también `allowedEmails` con los correos reales.

En **producción no se sube el archivo**: Cloudflare Pages lo genera en cada
despliegue con `build-config.js` a partir de variables de entorno.

Pages → tu proyecto → **Settings → Builds & deployments**:
- **Build command:** `node build-config.js`
- **Output directory:** `/`

Pages → **Settings → Environment variables** (entorno *Production*):

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | Project URL de Supabase |
| `SUPABASE_ANON_KEY` | publishable key |
| `ADMIN_EMAILS` | los correos separados por comas |

Si falta alguna variable el despliegue falla a propósito, en vez de publicar
un panel en modo demo sin avisar. Cloudflare mantiene vivo el deploy anterior.

## Fotos subidas desde el panel

Para que el botón **Subir foto** funcione hay que crear el almacén una vez:
**SQL Editor → New query** → pega `supabase/storage.sql` → **Run**.

Crea el bucket `productos` (público, tope de 5 MB, solo imágenes) y sus dos
políticas: cualquiera puede **ver** las fotos, solo los correos autorizados
pueden **subirlas**. Es idempotente: se puede reejecutar sin romper nada.

El panel redimensiona la imagen a 1400 px de lado largo y la convierte a JPEG
antes de subirla, así una foto de celular de 4 MB acaba pesando ~70 KB. Se
respeta la orientación EXIF, así que las fotos verticales no salen tumbadas.

Mientras el SQL no se ejecute, el panel avisa de que falta el almacén y el
resto sigue funcionando con normalidad.

## URLs de autenticación

Authentication → **URL Configuration**:
- **Site URL:** `https://lamona.pages.dev/admin.html`
  Tiene que apuntar a `admin.html`, no a la raíz: ahí es donde vive la pantalla
  que recibe los enlaces de invitación y de recuperación.
- **Redirect URLs:** añade `https://lamona.pages.dev/admin.html`
  y `http://localhost:3000/admin.html` (para probar en local).

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
