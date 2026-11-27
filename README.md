# Invitación de Matrimonio — Scarlett & Byron

Invitación digital interactiva y responsiva con temática _La Bella y la Bestia_ para el matrimonio religioso de **Scarlett & Byron** (**10 de Abril, 2027 · 14:00 hs · Tucapel 2100a, La Pintana, Santiago, Chile**), desarrollada con **React 19 + Vite 8 + Tailwind CSS v4 + Framer Motion + Google Sheets (Drive)**.

---

## Características principales

- **Sobre 3D interactivo y música real:** apertura física secuencial sin scroll (lacre → solapa 3D → salida de tarjeta → tarjeta revelada) con reproducción instantánea de **`Young and Beautiful — Lana Del Rey`** (`public/audio/cancion.mp3`), pausa automática al cambiar de app y calendario ilustrado de **Abril 2027** con corazón en el día 10 y trazo _Para siempre_.
- **Cuatro capítulos claros, carrusel coverflow inteligente y visor aislado:** `Portada` (retrato real en marco barroco), `Ceremonia`, `Historia` (carrusel 3D circular de **7 fotos reales** con auto-avance inteligente por visibilidad/interacción, arrastre táctil, tira de miniaturas y visor Lightbox en Portal con bloqueo total de scroll) y `Confirmar`, sincronizados entre el Navbar, barra superior animada y riel lateral de progreso.
- **Control anti-caché y reinicio automático en celulares:** versionado automático `?v=` en audio, fotos, íconos y preloads ([`src/data/weddingData.js`](src/data/weddingData.js)), cabeceras `no-cache` / `must-revalidate` en [`vercel.json`](vercel.json) y sincronización de versión ([`src/utils/releaseReset.js`](src/utils/releaseReset.js)) que limpia almacenamiento previo, cookies y cachés una sola vez por release (o bajo demanda con `?reset=1`).
- **Datos reales de Chile:**
  - Ceremonia religiosa y recepción en `Tucapel 2100a, La Pintana` con mapa directo y descarga de recordatorio (Google Calendar + `.ics` para iPhone/Outlook en `America/Santiago`).
  - **Código de Vestimenta:** Etiqueta Formal con muestras visuales de colores prohibidos (_Blanco y tonos similares, Azul rey, Rojo y Dorado metálico_).
  - **Mesa de Regalos:** mensaje completo de los novios + Banco Falabella · Chequera Electrónica (`Byron Hormazabal Sarmiento`, RUT `19.186.908-7`, cuenta `50013860033`) con botones **`Copiar Cuenta`** y **`Copiar RUT`**.
- **Google Drive / Google Sheets sin WhatsApp** ([`google-apps-script/Code.gs`](google-apps-script/Code.gs) + [`src/services/driveSheets.js`](src/services/driveSheets.js)):
  - **4 pestañas automáticas:** **`Resumen`** (contadores en vivo compatibles con `;` en Chile/Argentina), **`Confirmaciones`** (sin duplicados, columna **`Nombres de Acompañantes`**, filtro nativo `Sí` / `No`, desplegable y colores verde/rojo), **`Solo Asisten`** (vista filtrada en tiempo real para salón/catering) y **`Musica`** (playlist filtrable).
  - **Súper validaciones:** confirmación hasta el **15 de enero**, máximo estricto de **2 acompañantes** (validado en formulario, lógica, servicio y Apps Script), mensaje de celebración **solo para adultos** tras confirmar, nombre y apellido completo obligatorio para titular y **para cada acompañante**, bloqueo de nombres duplicados, normalización sin tildes/mayúsculas para **actualizar la misma fila sin duplicar**, protección honeypot anti-bots, **música nunca anónima** verificada contra `Confirmaciones`, bloqueo de temas duplicados y tope de 5 canciones por invitado.
- **SEO & Vista previa de WhatsApp 100 % automatizados** ([`scripts/seoAutoPlugin.mjs`](scripts/seoAutoPlugin.mjs) + [`scripts/generate-og.mjs`](scripts/generate-og.mjs)):
  - En cada build resuelve automáticamente la URL pública HTTPS (`VITE_SITE_URL`, `VERCEL_PROJECT_PRODUCTION_URL` o `VERCEL_URL`) e inyecta URLs absolutas en `canonical`, Open Graph, Twitter Card, `JSON-LD Event`, `robots.txt`, `sitemap.xml` y `manifest.json`.
  - Genera `public/og-image.jpg` (**1200×630, < 100 KB**, muy por debajo del límite de 300 KB de WhatsApp) e íconos PWA/iOS con sello de lacre dorado sobre Azul Real Medianoche.
- **Calidad, seguridad y CI:** Oxlint + `node:test` (lógica, calendario, scroll-spy, SEO y pruebas end-to-end del script `Code.gs`) + suite SEO/CSP + auditoría de higiene + GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) + `vercel.json` (CSP, HSTS y rewrite SPA protegido).

---

## Subida a producción (GitHub → Vercel)

### 1. Subir a GitHub (seguro, sin secretos)

- El archivo `.env` está protegido por `.gitignore` y **nunca se sube a GitHub** (el repositorio incluye únicamente `.env.example` sin IDs reales).
- Verifica antes de subir:
  ```bash
  npm run verify
  git status
  ```
- Haz commit y sube tu rama (`LautyGod` o `main`) al repositorio remoto. GitHub Actions ejecutará automáticamente `npm run verify`.

### 2. Desplegar en Vercel

1. Importa el repositorio `LautaroLeall/Scarlett-Byron` en **Vercel** (detecta Vite automáticamente; `vercel.json` ya define build, headers CSP/HSTS y rewrites).
2. En **Project Settings → Environment Variables**, agrega:
   - **`VITE_SHEETS_WEBHOOK_URL`**: tu URL pública `/exec` de Google Apps Script (la misma que tienes en `.env` local).
   - _(Opcional)_ **`VITE_SITE_URL`**: tu dominio final sin barra al final (si usas el dominio asignado por Vercel se detecta solo vía `VERCEL_PROJECT_PRODUCTION_URL`).
3. Despliega y prueba el enlace en WhatsApp / celular (confirmación + sugerencia de canción en tu planilla de Google Drive).

> Guía completa de Google Drive / Apps Script: **[`docs/GUIA_GOOGLE_DRIVE.md`](docs/GUIA_GOOGLE_DRIVE.md)**

---

## Cómo actualizar datos, fotos o música

1. **Datos del evento, vestimenta o transferencia:** edita únicamente [`src/data/weddingData.js`](src/data/weddingData.js).
2. **Música:** el archivo activo es `public/audio/cancion.mp3` (**Young and Beautiful — Lana Del Rey**). Si reemplazas el MP3, sube también `ASSET_VERSION` y `APP_RELEASE_VERSION` en [`src/data/weddingData.js`](src/data/weddingData.js) para forzar la actualización inmediata en todos los celulares.
3. **Fotos reales:** reemplaza `couple-hero.webp` o `gallery-1..7.webp` en `public/images/`, sube `ASSET_VERSION` en [`src/data/weddingData.js`](src/data/weddingData.js) y optimízalas automáticamente con:
   ```bash
   npm run assets:optimize
   ```
4. **Regenerar imagen de vista previa (WhatsApp):**
   ```bash
   npm run og:generate
   ```
5. **Reinicio manual desde un enlace (opcional):** abrir la invitación con `?reset=1` limpia `localStorage`, `sessionStorage`, cookies y cachés locales del navegador y elimina automáticamente el parámetro de la URL.

---

## Comandos disponibles

```bash
npm install              # Instalar dependencias (Node >= 20.19)
npm run dev              # Servidor local de desarrollo
npm run lint             # Análisis estático con Oxlint
npm run assets:optimize  # Comprimir imágenes de public/images/ a WebP óptimo
npm run og:generate      # Regenerar og-image.jpg (1200×630) + íconos iOS/PWA
npm run test             # Unit tests + SEO/WhatsApp OG + auditoría de higiene
npm run build            # Build optimizado en dist/ (con SEO automático)
npm run verify           # Lint + Build + Tests completos
npm run preview          # Previsualizar el build de producción
```

---

Desarrollado por **[Lautaro.Dev](https://lautarolealdev.com/)**.
