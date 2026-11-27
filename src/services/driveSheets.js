import { WEDDING_DETAILS } from '../data/weddingData.js';

const REQUEST_TIMEOUT_MS = 12000;

export function getDriveWebhookUrl(env = import.meta.env) {
  const fromEnv = typeof env?.VITE_SHEETS_WEBHOOK_URL === 'string'
    ? env.VITE_SHEETS_WEBHOOK_URL.trim()
    : '';
  const fromConfig = typeof WEDDING_DETAILS.driveSheets?.webhookUrl === 'string'
    ? WEDDING_DETAILS.driveSheets.webhookUrl.trim()
    : '';
  return fromEnv || fromConfig;
}

export function isDriveConfigured(env = import.meta.env) {
  const url = getDriveWebhookUrl(env);
  return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/i.test(url);
}

/**
 * Envía un registro JSON a Google Apps Script usando `text/plain;charset=utf-8`
 * (petición simple CORS sin preflight OPTIONS, compatible con iOS Safari, Android y PC).
 */
export async function postToDriveSheet(
  payload,
  { webhookUrl = getDriveWebhookUrl(), fetchImpl = globalThis.fetch } = {}
) {
  if (!webhookUrl) {
    return {
      ok: true,
      mode: 'local-only',
      action: payload?.previousGuestName ? 'updated' : 'created',
    };
  }

  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetchImpl(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        ok: false,
        code: 'HTTP_ERROR',
        error: 'El servidor de Google Drive no respondió correctamente. Intenta nuevamente.',
      };
    }

    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      if (parsed && parsed.ok === false) {
        return {
          ok: false,
          code: parsed.code || 'VALIDATION_ERROR',
          error: parsed.error || 'No pudimos guardar el registro. Intenta nuevamente.',
        };
      }
      return {
        ok: true,
        mode: 'drive',
        action: parsed?.action || 'created',
        data: parsed,
      };
    } catch {
      // Si Apps Script devuelve 200 OK sin JSON legible, se considera recibido
      return { ok: true, mode: 'drive', action: 'created' };
    }
  } catch (err) {
    if (err?.name === 'AbortError') {
      return {
        ok: false,
        code: 'TIMEOUT',
        error: 'La conexión tardó demasiado. Revisa tu señal e intenta nuevamente.',
      };
    }
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      error: 'No pudimos conectar con Google Drive. Revisa tu conexión e intenta nuevamente.',
    };
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

export function submitRsvpToDrive(record, options) {
  const attending = Boolean(record.attending);
  const companions = attending ? Number(record.companions) || 0 : 0;
  const companionNames =
    attending && companions > 0 && Array.isArray(record.companionNames)
      ? record.companionNames.slice(0, companions)
      : [];

  return postToDriveSheet(
    {
      type: 'rsvp',
      guestName: record.guestName,
      previousGuestName: record.previousGuestName || '',
      attending,
      companions,
      companionNames,
      message: record.message || '',
      website: record.website || '',
    },
    options
  );
}

export function submitSongToDrive({ song, guestName = '', website = '' }, options) {
  const cleanGuest = String(guestName || '').trim();
  if (!cleanGuest || cleanGuest.toLowerCase() === 'anónimo' || cleanGuest.toLowerCase() === 'anonimo') {
    return Promise.resolve({
      ok: false,
      code: 'RSVP_REQUIRED',
      error: 'Primero registra tu nombre y apellido en Confirmar Asistencia para sugerir música.',
    });
  }

  return postToDriveSheet(
    {
      type: 'song',
      song,
      guestName: cleanGuest,
      website,
    },
    options
  );
}
