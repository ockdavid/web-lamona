# la Mona — Sitio Web Oficial

Sitio web de venta y catálogo para **la Mona**, marca peruana de joyas de plata 925 y baño de oro 18k con personalización a pedido. El sitio actúa como escaparate de producto, herramienta de generación de pedidos por WhatsApp y canal de contacto directo con la marca.

---

## Propósito

La Mona vende joyas artesanales en Lima, Perú. No usa un carrito de compra tradicional con pasarela de pago — el flujo de venta es:

1. El cliente explora el catálogo o personaliza su joya en el simulador en vivo.
2. Agrega piezas a su selección.
3. Presiona **"Solicitar por WhatsApp"** y se genera automáticamente un mensaje con el detalle del pedido listo para enviar.
4. La familia gestiona el pedido y coordina el pago contra entrega o envío.

Esto elimina la fricción de plataformas de pago y aprovecha WhatsApp, canal que ya usa la marca con sus clientes.

---

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Estructura | HTML5 semántico (un solo archivo `index.html`) |
| Estilos | CSS3 vanilla con custom properties (variables) |
| Lógica | JavaScript vanilla, patrón IIFE — sin frameworks, sin build step |
| Animaciones | GSAP 3 + ScrollTrigger (incluidos en `/lib`) |
| Tipografía | Google Fonts: Cormorant Garamond (display) + Inter (body) |
| Iconos | SVG inline — sin dependencias externas de iconos |
| Despliegue | Cloudflare Pages (conectado al repo de GitHub) |

> **Sin Node.js, sin npm, sin bundler.** El sitio se abre directamente en el navegador o se sube tal cual a cualquier hosting estático.

---

## Estructura del Proyecto

```
web-lamona-peru/
│
├── index.html          # Toda la estructura HTML del sitio
├── main.js             # Lógica JS completa (IIFE, ~600 líneas)
├── styles.css          # Todos los estilos (~1 700 líneas)
│
├── lib/
│   ├── gsap.min.js         # GSAP 3 (animaciones scroll)
│   ├── ScrollTrigger.min.js# Plugin ScrollTrigger de GSAP
│   └── manifest.js         # Base de datos de productos y config de marca
│
├── assets/
│   └── img/
│       ├── logo.png        # Logotipo de la marca
│       ├── hero-bg.png     # Imagen de fondo del hero
│       ├── profile.jpg     # Foto para sección Nosotros
│       ├── foto-1.jpeg … foto-78.jpeg   # Fotos de productos
│       └── post-1.jpg  … post-12.jpg    # Fotos para feed de Instagram
│
└── .htaccess           # Reglas para Apache (redirects, caché)
```

### `lib/manifest.js` — Base de datos de productos

Contiene el objeto `window.__BRAND__` con toda la información de la marca y el array completo de productos. Cada producto tiene:

```js
{
  id:    "p01",
  cat:   "anillo",              // anillo | collar | pulsera | arete | conjunto
  name:  "Anillos con Piedras Naturales",
  desc:  "Descripción detallada...",
  photo: "assets/img/foto-1.jpeg",
  tag:   "Personalizable"       // opcional: "Personalizable" | "Set" | "Nuevo"
}
```

Para agregar o editar productos **solo hay que editar este archivo**, sin tocar HTML ni CSS.

---

## Secciones del Sitio

### 1. Navegación (`#nav`)
- Header fijo con efecto glassmorphism al hacer scroll.
- Logo, links de navegación, botón de WhatsApp y botón del carrito con badge de cantidad.
- Menú hamburguesa en móvil.

### 2. Hero (`#inicio`)
- Sección de bienvenida a pantalla completa con imagen de fondo.
- Headline con tipografía display, subtítulo de propuesta de valor y dos CTAs: ver catálogo y personalizar.
- Contadores animados: piezas disponibles, seguidores en Instagram, publicaciones.
- Badge de precio fijo ("Todo a S/. 50").

### 3. Catálogo (`#catalogo`)
- Muestra las **69 piezas** disponibles.
- Barra de filtros por categoría: Todos / Anillos / Collares / Pulseras / Aretes / Conjuntos.
- Cada tarjeta de producto incluye foto, nombre, categoría, precio y botón **"+ Agregar"** al carrito.
- Los productos viven dentro de una ventana scrolleable (720 px altura en desktop, 520 px en móvil) para no alargar demasiado la página.
- Al hacer clic en una categoría del filtro, la vista se actualiza sin recargar la página.

### 4. Personalizador en vivo (`#personalizar`)
- Simulador interactivo donde el cliente puede:
  - Escribir su nombre o iniciales y verlos grabados en tiempo real sobre la joya.
  - Cambiar el tipo de joya: collar, anillo o pulsera.
  - Cambiar el metal: plata 925 o baño de oro 18k.
  - Cambiar la forma del dije: círculo, corazón u óvalo (para collares).
  - Cambiar el estilo de fuente: script (cursiva) o imprenta.
- Al finalizar, el botón **"Personalizar por WhatsApp"** genera un mensaje con el texto grabado, el tipo de joya y el metal seleccionados.

### 5. Proceso (`#proceso`)
- Sección oscura con fondo `#2A1F1B` que explica los **4 pasos** del pedido:
  1. Eliges tu joya del catálogo o personalizas.
  2. Confirmamos el diseño (envío de boceto antes de empezar).
  3. Grabado a mano en plata 925 o baño de oro 18k.
  4. Empaque de regalo + envío a tu puerta.
- Grid de 4 columnas en desktop, 2 en tablet, 1 en móvil.
- Cada paso incluye foto del proceso real.

### 6. Nosotros (`#nosotros`)
- Historia de la marca, valores y datos de comunidad (seguidores, publicaciones).
- Links a redes sociales: Instagram y Facebook.

### 7. Footer CTA
- Llamada a la acción final con gradiente de fondo.
- Botón directo a WhatsApp con número pre-cargado.
- Barra inferior con logo, copyright y links sociales.

---

## Funcionalidades Interactivas

### Carrito de Compras
- Botón flotante en la navegación con badge de cantidad.
- Al presionar **"+ Agregar"** en cualquier producto, se añade al carrito y el badge se actualiza.
- Al abrir el carrito (pantalla completa, overlay sobre la página), se puede:
  - Ver todos los productos seleccionados con foto, nombre y precio.
  - Aumentar o disminuir la cantidad de cada pieza.
  - Eliminar una pieza individual.
  - Limpiar todo el carrito.
  - Volver a la página principal.
- El botón **"Solicitar por WhatsApp"** genera un mensaje estructurado con el detalle completo del pedido (nombre de cada pieza, cantidad y precio) y lo abre directamente en WhatsApp.

```
Hola! Me gustaría solicitar las siguientes piezas de La Mona ✨

• Anillos con Piedras Naturales x2 — S/. 100
• Collar con Nombre Grabado x1   — S/. 50

Total: S/. 150

¿Están disponibles? 🌸
```

### Chatbot "Mona" (asistente virtual)
- Botón flotante en la esquina inferior derecha con animación de pulso.
- A los 4 segundos de abrir la página aparece un badge rojo indicando un mensaje nuevo, para atraer la atención sin ser intrusivo.
- Al abrir el chat, Mona saluda y muestra 6 botones de respuesta rápida.
- Detecta **palabras clave en español** (con o sin tildes) para responder a 12 tipos de consultas:

| Intención | Palabras clave detectadas |
|-----------|--------------------------|
| Materiales | plata, oro, 925, 18k, material, calidad |
| Precios | precio, costo, cuánto, vale, soles |
| Personalización | grabar, nombre, iniciales, personalizar |
| Envíos | envío, entrega, Lima, provincias, Olva, Shalom |
| Costo de envío | costo + envío, precio + envío |
| Tiempos | demora, tarda, días, cuándo, rápido |
| Catálogo | catálogo, todos, cuántos, 69, piezas |
| Collares | collar |
| Anillos | anillo |
| Pulseras | pulsera |
| Aretes | arete |
| Regalos | regalo, regalar |
| WhatsApp | whatsapp, contacto, pedido, comprar, solicitar |

- Muestra un indicador de "escribiendo" (3 puntos animados) con un delay de 650–1100 ms antes de cada respuesta para simular naturalidad.
- "Ir al catálogo" hace scroll suave hasta la sección y cierra el chat.
- "Hablar por WhatsApp" abre el chat de WhatsApp en una nueva pestaña.
- Completamente **sin API externa** — funciona offline, sin costo.

---

## Sistema de Diseño

### Paleta de colores

```css
--bg:           #faf5f0   /* Crema cálido — fondo principal */
--bg-alt:       #f5ede6   /* Crema oscuro — fondos secundarios */
--accent:       #c07890   /* Rosa palo — color principal de marca */
--accent-dark:  #a05c72   /* Rosa oscuro — hover states */
--gold:         #c8a060   /* Oro — detalles y acentos */
--text:         #1a1012   /* Casi negro cálido — texto principal */
--text-muted:   #6b5058   /* Marrón medio — texto secundario */
--text-light:   #9c7880   /* Rosa grisáceo — texto terciario */
```

### Tipografías

- **Cormorant Garamond** (serif display): títulos, precios, headings de secciones. Transmite elegancia y artesanía.
- **Inter** (sans-serif): texto de cuerpo, botones, etiquetas, UI elements. Transmite claridad y modernidad.

### Tokens de diseño

```css
--radius:      18px    /* Border radius estándar */
--radius-sm:   10px    /* Border radius pequeño */
--radius-pill: 999px   /* Cápsulas y badges */
--ease: cubic-bezier(0.25, 0.46, 0.45, 0.94)  /* Curva de animación */
--t:   0.3s            /* Duración de transiciones */
```

### Animaciones
- **Reveal on scroll**: elementos con `data-reveal` aparecen con fade + translateY al entrar en viewport (usando IntersectionObserver).
- **GSAP ScrollTrigger**: animaciones más complejas en el hero y secciones destacadas.
- **Contadores**: los números del hero se animan desde 0 al valor real al hacer scroll.
- **Tilt 3D**: las tarjetas de producto responden al movimiento del cursor con efecto de perspectiva suave.

---

## Cómo Correr Localmente

No se necesita ninguna instalación. Solo abre el archivo en el navegador:

```
# Opción 1 — Abrir directo (algunos browsers bloquean assets locales)
Doble clic en index.html

# Opción 2 — Servidor local recomendado
# Con Python (viene instalado en macOS/Linux):
python -m http.server 8080
# Luego abrir: http://localhost:8080

# Con Node.js:
npx serve .
# Luego abrir: http://localhost:3000

# Con VS Code:
# Instalar extensión "Live Server" y hacer clic en "Go Live"
```

---

## Despliegue en Cloudflare Pages

El sitio está conectado al repositorio de GitHub [`ockdavid/web-lamona`](https://github.com/ockdavid/web-lamona). Cada `git push` a la rama `main` dispara un despliegue automático.

**Configuración en Cloudflare Pages:**
- **Build command**: *(vacío — no hay build step)*
- **Output directory**: `/` *(raíz del repo)*
- **Branch de producción**: `main`

---

## Roadmap — Próximas Funcionalidades

### Fase 2 — Base de datos dinámica (Supabase)
Actualmente los productos están hardcodeados en `lib/manifest.js`. El plan es migrar a una base de datos en **Supabase (PostgreSQL)** para que los productos puedan gestionarse sin tocar código.

```
Tabla: products
─────────────────────────────────
id          uuid (PK)
name        text
category    text
description text
photo_url   text
tag         text
active      boolean
created_at  timestamp
```

### Fase 3 — Panel de administración (`/admin`)
Interfaz visual protegida con contraseña (Supabase Auth) para que la familia pueda:
- Agregar nuevos productos con foto.
- Activar / desactivar productos sin borrarlos.
- Actualizar fotos y descripciones.

Sin conocimientos técnicos requeridos — solo subir foto, escribir nombre y guardar.

### Fase 4 — Imágenes en la nube
Migración de las fotos de `/assets/img/` a **Cloudinary** o **Supabase Storage** para:
- Optimización automática de imágenes (WebP, lazy loading inteligente).
- URLs permanentes independientes del código.
- Subida directa desde el panel admin.

---

## Información de la Marca

| | |
|---|---|
| **Marca** | la Mona |
| **País** | Perú 🇵🇪 |
| **Ciudad** | Lima |
| **Materiales** | Plata 925 · Baño de oro 18k |
| **Precio** | S/. 50 por pieza (precio único) |
| **Piezas disponibles** | 69 en 4 categorías |
| **Personalización** | Grabado de nombre o iniciales incluido |
| **Envíos** | Lima (contra entrega) · Provincias (Olva / Shalom) |
| **WhatsApp** | +51 997 918 216 |
| **Instagram** | [@lamona_peru](https://www.instagram.com/lamona_peru/) |
| **Facebook** | [la Mona](https://www.facebook.com/share/1YAsh5Ffs1/) |

---

*Desarrollado por David Landeo · Madrid, 28 Mayo 2026*
