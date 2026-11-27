export const RELEASE_STORAGE_KEY = 'scarlett_byron_release_v';

function clearDocumentCookies(doc) {
  if (!doc || typeof doc.cookie !== 'string' || !doc.cookie.trim()) return 0;
  const parts = doc.cookie.split(';');
  let cleared = 0;
  for (const part of parts) {
    const eqIdx = part.indexOf('=');
    const name = (eqIdx >= 0 ? part.slice(0, eqIdx) : part).trim();
    if (!name) continue;
    doc.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
    cleared++;
  }
  return cleared;
}

/**
 * Sincroniza la versión publicada de la invitación en cada dispositivo.
 * Si el navegador tenía una versión anterior (o llega con `?reset=1`), limpia
 * localStorage, sessionStorage, cookies del sitio, Cache Storage y Service Workers
 * una sola vez para garantizar que carguen la música y fotos más recientes.
 */
export function syncAppReleaseVersion(releaseVersion, env = globalThis) {
  const version = String(releaseVersion || '').trim();
  if (!version || !env) {
    return { reset: false, reason: 'missing-version', currentVersion: version };
  }

  let forceReset = false;
  try {
    const search = env.location?.search || '';
    if (search) {
      const params = new URLSearchParams(search);
      if (params.get('reset') === '1') {
        forceReset = true;
        params.delete('reset');
        const nextQuery = params.toString();
        const nextUrl = `${env.location.pathname || '/'}${nextQuery ? `?${nextQuery}` : ''}${env.location.hash || ''}`;
        env.history?.replaceState?.(null, '', nextUrl);
      }
    }
  } catch {
    // Ignorar errores de URL/history en entornos restringidos
  }

  let previousVersion = null;
  try {
    previousVersion = env.localStorage?.getItem?.(RELEASE_STORAGE_KEY) ?? null;
  } catch {
    previousVersion = null;
  }

  if (!forceReset && previousVersion === version) {
    return { reset: false, previousVersion, currentVersion: version };
  }

  try {
    env.localStorage?.clear?.();
    env.localStorage?.setItem?.(RELEASE_STORAGE_KEY, version);
  } catch {
    // Modo privado o cuota llena
  }

  try {
    env.sessionStorage?.clear?.();
  } catch {
    // Ignorar restricciones de sessionStorage
  }

  let clearedCookies = 0;
  try {
    clearedCookies = clearDocumentCookies(env.document);
  } catch {
    // Ignorar restricciones de cookies
  }

  try {
    if (env.caches && typeof env.caches.keys === 'function') {
      Promise.resolve(env.caches.keys())
        .then((keys) => Promise.all(keys.map((key) => env.caches.delete(key))))
        .catch(() => { });
    }
  } catch {
    // Ignorar si Cache API no está disponible
  }

  try {
    const sw = env.navigator?.serviceWorker;
    if (sw && typeof sw.getRegistrations === 'function') {
      Promise.resolve(sw.getRegistrations())
        .then((regs) => Promise.all(regs.map((reg) => reg.unregister())))
        .catch(() => { });
    }
  } catch {
    // Ignorar si Service Worker no está disponible
  }

  return {
    reset: true,
    forced: forceReset,
    previousVersion,
    currentVersion: version,
    clearedCookies,
  };
}
