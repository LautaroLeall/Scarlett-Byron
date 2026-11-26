# Invitación de Matrimonio — Scarlett & Byron

Invitación digital interactiva y responsiva con temática _La Bella y la Bestia_ para el matrimonio religioso de **Scarlett & Byron** (**10 de Abril, 2027 · 14:00 hs · Tucapel 2100a, La Pintana, Santiago, Chile**), desarrollada con **React 19 + Vite 8 + Tailwind CSS v4 + Framer Motion + Google Sheets (Drive)**.

---

## Características principales

- **Sobre interactivo con música real:** sello de lacre interactivo que reproduce al instante **`Young and Beautiful — Lana Del Rey`** (`public/audio/cancion.mp3`) dentro del toque del usuario (compatible con iOS Safari, Android y PC), con pausa automática al cambiar de app o bloquear la pantalla.
- **Datos reales de Chile:**
  - Ceremonia religiosa y recepción en `Tucapel 2100a, La Pintana` con mapa directo y descarga de recordatorio (Google Calendar + `.ics` para iPhone/Outlook en `America/Santiago`).
  - **Código de Vestimenta:** Etiqueta Formal / Gala con muestras visuales de colores prohibidos (_Blanco y tonos similares, Azul rey, Rojo y Dorado metálico_).
  - **Mesa de Regalos:** Banco Falabella · Chequera Electrónica (`Byron Hormazabal Sarmiento`, RUT `19.186.908-7`, cuenta `50013860033`) con botones rápidos **`Copiar Cuenta`** y **`Copiar RUT`**.
- **Google Drive / Google Sheets sin WhatsApp** ([`google-apps-script/Code.gs`](google-apps-script/Code.gs) + [`src/services/driveSheets.js`](src/services/driveSheets.js)):
  - **4 pestañas automáticas:** **`Resumen`** (contadores en vivo compatibles con `;` en Chile/Argentina), **`Confirmaciones`** (sin duplicados, filtro nativo `Sí` / `No`, desplegable y colores verde/rojo), **`Solo Asisten`** (vista filtrada en tiempo real para el salón/catering) y **`Musica`** (playlist filtrable).
  - **Súper validaciones:** nombre y apellido completo obligatorio, normalización sin tildes/mayúsculas para **actualizar la misma fila en vez de duplicar**, protección honeypot anti-bots, **música nunca anónima** (solo desbloqueada tras confirmar asistencia y verificada contra `Confirmaciones`), bloqueo de canciones duplicadas y tope de 5 temas por invitado.
- **SEO & Vista previa de WhatsApp 100 % automatizados** ([`scripts/seoAutoPlugin.mjs`](scripts/seoAutoPlugin.mjs) + [`scripts/generate-og.mjs`](scripts/generate-og.mjs)):
  - En cada build resuelve automáticamente la URL pública HTTPS (`VITE_SITE_URL`, `VERCEL_PROJECT_PRODUCTION_URL` o `VERCEL_URL`) e inyecta URLs absolutas en `canonical`, Open Graph, Twitter Card, `JSON-LD Event`, `robots.txt`, `sitemap.xml` y `manifest.json`.
  - Genera `public/og-image.jpg` (**1200×630, ~74 KB**, muy por debajo del límite de 300 KB de WhatsApp) e íconos PWA/iOS.
- **Calidad, seguridad y CI:** Oxlint + `node:test` + suite SEO/CSP + auditoría de higiene + GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) + `vercel.json` (CSP, HSTS y rewrite SPA protegido).

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
2. **Música:** el archivo activo es `public/audio/cancion.mp3` (**Young and Beautiful — Lana Del Rey**).
3. **Fotos reales:** reemplaza `couple-hero.webp` y `gallery-1..3.webp` en `public/images/` y optimízalas automáticamente con:
   ```bash
   npm run assets:optimize
   ```
4. **Regenerar imagen de vista previa (WhatsApp):**
   ```bash
   npm run og:generate
   ```

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
