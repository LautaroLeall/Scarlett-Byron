# Invitación de Casamiento — Scarlett & Byron

Invitación digital interactiva y responsiva con temática *La Bella y la Bestia* (paleta marfil pergamino, dorado metálico y lacre carmesí), desarrollada con **React 19 + Vite 8 + Tailwind CSS v4 + Framer Motion**.

---

## Tecnologías y estándares

- **React 19** + **Vite 8** (JavaScript ES Modules `.jsx` / `.js`)
- **Tailwind CSS v4** (`@tailwindcss/vite`) con sintaxis canónica, tokens `@theme` y blindaje móvil iOS (`100dvh`, `overflow-x: clip`, inputs `16px`, `prefers-reduced-motion`)
- **Framer Motion** (`<MotionConfig reducedMotion="user">`) + **Lucide React** + **Canvas Confetti**
- **SEO & WhatsApp Preview 100% automatizados** (`scripts/seoAutoPlugin.mjs`):
  - En cada build (`vite build`), resuelve automáticamente la URL pública HTTPS desde `VITE_SITE_URL`, `VERCEL_PROJECT_PRODUCTION_URL` o `VERCEL_URL` (con respaldo en `weddingData.js`) e inyecta URLs absolutas en `canonical`, `og:url`, `og:image`, `og:image:secure_url`, `twitter:image`, `JSON-LD Event`, `robots.txt`, `sitemap.xml` y `manifest.json`.
  - `scripts/generate-og.mjs` genera automáticamente `public/og-image.jpg` (**1200×630, ~75 KB**, muy por debajo del tope de 300 KB de WhatsApp) e íconos PWA/iOS (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) leyendo los datos directamente de `src/data/weddingData.js`.
- **Calidad y CI automatizados:** Oxlint + `node:test` (`weddingLogic.test.mjs`) + `seo.test.mjs` + `hygiene.test.mjs` + GitHub Actions (`.github/workflows/ci.yml`)
- **Vercel:** `vercel.json` con CSP, HSTS, caché inmutable en `/assets/*`, caché corto en `og-image.jpg` y SPA rewrite protegido

---

## Cómo actualizar datos, música y fotos

### 1. Datos de los novios, sedes, CBU/Alias y WhatsApp
Editá únicamente [`src/data/weddingData.js`](src/data/weddingData.js):
- `coupleNames`, `monogram`, `dateFormatted`, `targetDateIso`, `eventEndIso`
- `ceremony` y `reception` (horarios, sedes, direcciones y links de Google Maps)
- `gifts` (`entity`, `holder`, `cuil`, `cbu`, `alias`)
- `rsvp.whatsappPhone`: número en formato internacional sin `+` ni espacios (ej. `5491112345678`)
- `audio.title`: nombre visible del tema musical
- `seo.siteUrl` / `seo.ogVersion`: dominio de respaldo y versión para refrescar caché de WhatsApp si cambiás la imagen OG

### 2. Agregar el archivo MP3 real
Cuando los novios confirmen el tema, guardá el archivo en:

```text
public/audio/cancion.mp3
```

`useAudioPlayer` detecta automáticamente `public/audio/cancion.mp3`, lo reproduce en bucle al abrir el sobre y pausa/reanuda solo al bloquear el celular o cambiar de app. Mientras no exista el MP3, suena el vals Web Audio integrado como respaldo sin errores.

### 3. Reemplazar fotos reales de la pareja
Reemplazá estos archivos en `public/images/` (o actualizá `GALLERY_PHOTOS` en `src/data/weddingData.js`):
- `couple-hero.webp` (foto principal dentro del marco barroco)
- `gallery-1.webp`, `gallery-2.webp`, `gallery-3.webp` (álbum *Nuestra Historia*, con Lightbox táctil swipe + teclado)

Si cambiás nombres o fecha en `weddingData.js`, regenerá la imagen de vista previa de WhatsApp con:

```bash
npm run og:generate
```

*(Subí `seo.ogVersion` de `'1'` a `'2'` en `weddingData.js` para forzar a WhatsApp a descargar la nueva miniatura al instante.)*

---

## Comandos disponibles

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor local de desarrollo
npm run lint         # Análisis estático con Oxlint
npm run og:generate  # Regenerar og-image.jpg (1200×630) + íconos iOS/PWA
npm run test         # Unit tests + SEO/WhatsApp OG + auditoría de higiene
npm run build        # Build optimizado en dist/ (con SEO automático)
npm run verify       # Lint + Build + Tests completos (mismo pipeline que CI)
npm run preview      # Previsualizar el build de producción
```

---

## Despliegue en Vercel

1. Conectá la carpeta `Scarlett-Byron` como **Root Directory** en Vercel.
2. Framework Preset: **Vite** (`npm run build` → `dist`).
3. **Listo:** Vercel inyecta automáticamente `VERCEL_PROJECT_PRODUCTION_URL` en el build y `seoAutoPlugin.mjs` genera todas las URLs absolutas HTTPS para que el enlace muestre siempre la imagen en WhatsApp.
4. Si conectás un dominio propio, agregá `VITE_SITE_URL=https://tudominio.com` en Vercel → Settings → Environment Variables y hacé Redeploy.
# Scarlett-Byron
