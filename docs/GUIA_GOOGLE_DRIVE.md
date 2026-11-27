# Conectar Confirmaciones y Música con Google Drive (Google Sheets)

Esta guía activa el guardado automático en Google Drive gratis, sin servidor externo y **sin guardar ninguna contraseña en el código**.

---

## Qué crea y protege automáticamente `Code.gs`

Al ejecutar `inicializarPlanilla` se configuran **4 pestañas** listas para usar desde PC o celular:

1. **`Resumen`**: contadores en vivo (respuestas `Sí`, `No`, total de personas sumando acompañantes y canciones). Detecta automáticamente el separador regional (`;` en Chile/Argentina/España o `,` en EE. UU./México).
2. **`Confirmaciones`**: lista maestra **sin duplicados** con **Nombres de Acompañantes** obligatorios cuando asisten con compañía, **filtro nativo activado** en encabezados (para filtrar `Sí` / `No` en 1 clic), desplegable `Sí` / `No`, colores automáticos (verde/rojo) y columna `Estado` (`Nuevo` / `Actualizado`). Si un invitado vuelve a confirmar con el mismo nombre y apellido (sin importar tildes ni mayúsculas), **actualiza su fila existente en vez de duplicarlo**.
3. **`Solo Asisten`**: vista automática filtrada en tiempo real (`FILTER`) únicamente con quienes confirmaron **`Sí`**, lista para compartir con el salón o el catering.
4. **`Musica`**: playlist filtrable sin duplicados globales, tope de **5 canciones por invitado** y **cero anónimos** (el script verifica que el invitado exista primero en `Confirmaciones`).

---

## Paso 1 — Crear la planilla en Google Drive

1. Inicia sesión en Google Drive con la cuenta de los novios (`scarybyron08@gmail.com`).
2. Crea una nueva **Hoja de cálculo de Google** (Google Sheets), por ejemplo:
   `Matrimonio Scarlett & Byron — Invitados y Música`.

---

## Paso 2 — Pegar o actualizar el script automático

1. Dentro de la planilla, abre **Extensiones → Apps Script**.
2. Reemplaza todo el contenido de `Código.gs` por [`google-apps-script/Code.gs`](../google-apps-script/Code.gs) y guarda (`Ctrl + S`).
3. En la barra superior elige la función **`inicializarPlanilla`** y haz clic en **Ejecutar** (crea las 4 pestañas, aplica los filtros `Sí` / `No` y los colores sin borrar invitados ya cargados).

---

## Paso 3 — Publicar o actualizar la Aplicación Web

- **Primera vez:** **Implementar → Nueva implementación** → Tipo: **Aplicación web** → `Ejecutar como: Yo` → `Quién tiene acceso: Cualquier persona` → copiar la URL `https://script.google.com/macros/s/.../exec`.
- **Cuando actualizas `Code.gs`:** **Implementar → Administrar implementaciones → ícono de lápiz (Editar) → Versión: Nueva versión → Implementar**. Así la URL `/exec` **no cambia** y no necesitas tocar `.env` ni Vercel.

---

## Paso 4 — Conectar la URL de forma segura (`.env` y Vercel)

1. **En local:** copia `.env.example` a `.env` (ignorado por `.gitignore`) y pega `VITE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec`.
2. **En Vercel (producción):** en tu proyecto ve a **Settings → Environment Variables**, agrega `VITE_SHEETS_WEBHOOK_URL` con la URL `/exec` y haz **Redeploy**.

---

## Verificación rápida

Abre tu URL `https://script.google.com/macros/s/.../exec` en el navegador. Debe responder:

```json
{
  "ok": true,
  "service": "scarlett-byron-wedding-sheets",
  "status": "ready",
  "features": [
    "upsert-rsvp",
    "required-companion-names",
    "verified-guest-songs",
    "auto-filters"
  ]
}
```

> **Seguridad:** nunca guardes contraseñas de Gmail en el proyecto ni subas `.env` a Git. Si alguna vez necesitan revocar el acceso, desde _Extensiones → Apps Script → Administrar implementaciones_ pueden desactivar la URL en un clic.
