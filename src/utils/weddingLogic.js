export function calculateCountdown(targetIso, nowMs = Date.now()) {
  const targetMs = new Date(targetIso).getTime();
  if (Number.isNaN(targetMs)) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00', isFinished: true };
  }

  const diff = Math.max(0, targetMs - nowMs);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    isFinished: diff === 0,
  };
}

export function wrapGalleryIndex(current, delta, total) {
  if (total <= 0) return 0;
  return (((current + delta) % total) + total) % total;
}

/**
 * Normaliza nombres y canciones para detectar duplicados ignorando mayúsculas,
 * tildes y espacios múltiples (ej. "Cámila  Rojas" === "camila rojas").
 */
export function normalizeMatchKey(rawValue = '') {
  return String(rawValue || '')
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function normalizeCompanions(rawValue, maxGuests = 10) {
  if (rawValue === '' || rawValue === null || rawValue === undefined) return 0;
  const parsed = Number.parseInt(String(rawValue), 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, Math.min(maxGuests, parsed));
}

function countMeaningfulWords(text) {
  return text
    .split(/[\s,&]+/)
    .map((part) => part.replace(/^['.-]+|['.-]+$/g, ''))
    .filter((part) => /\p{L}{2,}/u.test(part)).length;
}

function validatePersonFullName(rawValue, { isCompanion = false } = {}) {
  const trimmed = String(rawValue || '').trim().replace(/\s+/g, ' ');

  if (!trimmed) {
    return {
      trimmed,
      error: isCompanion
        ? 'Escribe el nombre y apellido completo de este acompañante.'
        : 'Por favor, ingresa tu nombre y apellido.',
    };
  }
  if (trimmed.length < 4) {
    return {
      trimmed,
      error: isCompanion
        ? 'Ingresa el nombre y apellido completo (mínimo 4 caracteres).'
        : 'Ingresa tu nombre y apellido completo (mínimo 4 caracteres).',
    };
  }
  if (trimmed.length > 80) {
    return {
      trimmed,
      error: 'El nombre no puede superar los 80 caracteres.',
    };
  }
  if (!/^[\p{L}\s'.,&-]+$/u.test(trimmed)) {
    return {
      trimmed,
      error: 'Ingresa solo letras y signos válidos (ej. Camila Rojas).',
    };
  }
  if (countMeaningfulWords(trimmed) < 2) {
    return {
      trimmed,
      error: isCompanion
        ? 'Indica nombre y apellido completo de este acompañante.'
        : 'Escribe tu nombre y apellido completo.',
    };
  }
  if (/(\p{L})\1{3,}/iu.test(trimmed)) {
    return {
      trimmed,
      error: 'Revisa el nombre y apellido; parece contener letras repetidas.',
    };
  }
  return { trimmed, error: null };
}

export function validateRsvpForm(
  { guestName = '', attending = true, companions = 0, companionNames = [], message = '' },
  maxGuests = 10
) {
  const errors = {};
  const guestCheck = validatePersonFullName(guestName, { isCompanion: false });
  const trimmedName = guestCheck.trimmed;

  if (guestCheck.error) {
    errors.guestName = guestCheck.error;
  }

  let safeCompanions = 0;
  if (attending) {
    if (companions === '' || companions === null || companions === undefined) {
      safeCompanions = 0;
    } else {
      const parsed = Number(companions);
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > maxGuests) {
        errors.companions = `Ingresa una cantidad válida entre 0 y ${maxGuests}.`;
      } else {
        safeCompanions = parsed;
      }
    }
  }

  const validatedCompanionNames = [];
  if (attending && safeCompanions > 0) {
    const rawList = Array.isArray(companionNames) ? companionNames : [];
    const companionErrors = [];
    const seenKeys = new Set();
    const guestKey = normalizeMatchKey(trimmedName);

    for (let i = 0; i < safeCompanions; i++) {
      const check = validatePersonFullName(rawList[i], { isCompanion: true });
      validatedCompanionNames.push(check.trimmed);

      if (check.error) {
        companionErrors[i] = check.error;
        continue;
      }

      const compKey = normalizeMatchKey(check.trimmed);
      if (guestKey && compKey === guestKey) {
        companionErrors[i] = 'No hace falta repetirte aquí; escribe el nombre de tu acompañante.';
      } else if (seenKeys.has(compKey)) {
        companionErrors[i] = 'Este acompañante ya fue ingresado en otro campo.';
      } else {
        seenKeys.add(compKey);
        companionErrors[i] = undefined;
      }
    }

    if (companionErrors.some(Boolean)) {
      errors.companionNames = companionErrors;
    }
  }

  if (String(message).trim().length > 260) {
    errors.message = 'Máximo 260 caracteres en el saludo.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    trimmedName,
    companions: safeCompanions,
    companionNames: attending ? validatedCompanionNames : [],
    errors,
  };
}

function normalizeCompanionKeyList(record) {
  if (!record?.attending) return '';
  const count = Number(record.companions) || 0;
  const list = Array.isArray(record.companionNames) ? record.companionNames.slice(0, count) : [];
  return list.map((name) => normalizeMatchKey(name)).join('|');
}

export function hasRsvpChanged(previous, next) {
  if (!previous) return true;
  if (normalizeMatchKey(previous.guestName) !== normalizeMatchKey(next.guestName)) return true;
  if (Boolean(previous.attending) !== Boolean(next.attending)) return true;
  const prevCompanions = previous.attending ? Number(previous.companions) || 0 : 0;
  const nextCompanions = next.attending ? Number(next.companions) || 0 : 0;
  if (prevCompanions !== nextCompanions) return true;
  if (normalizeCompanionKeyList(previous) !== normalizeCompanionKeyList(next)) return true;
  if (String(previous.message || '').trim() !== String(next.message || '').trim()) return true;
  return false;
}

export function validateSongSuggestion(rawInput) {
  const trimmed = String(rawInput || '').trim().replace(/\s+/g, ' ');
  if (trimmed.length < 3) {
    return {
      valid: false,
      trimmed,
      error: 'Escribe el nombre del tema y artista (mínimo 3 caracteres).',
    };
  }
  if (trimmed.length > 100) {
    return {
      valid: false,
      trimmed,
      error: 'Máximo 100 caracteres por canción.',
    };
  }
  if (!/\p{L}{2,}/u.test(trimmed) || /(\p{L})\1{4,}/iu.test(trimmed)) {
    return {
      valid: false,
      trimmed,
      error: 'Escribe un título de canción o artista válido.',
    };
  }
  return { valid: true, trimmed };
}

export function addSongSuggestion(existing, rawInput, maxItems = 5) {
  const trimmed = String(rawInput || '').trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    return { songs: existing, added: null, duplicate: false, limitReached: false };
  }

  const normalized = normalizeMatchKey(trimmed);
  const alreadyExists = existing.some((item) => normalizeMatchKey(item) === normalized);
  if (alreadyExists) {
    return { songs: existing, added: trimmed, duplicate: true, limitReached: false };
  }

  if (existing.length >= maxItems) {
    return { songs: existing, added: null, duplicate: false, limitReached: true };
  }

  return {
    songs: [trimmed, ...existing],
    added: trimmed,
    duplicate: false,
    limitReached: false,
  };
}

export function parseStoredRsvp(rawJson, maxGuests = 10) {
  if (!rawJson) return null;
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    if (typeof parsed.guestName !== 'string') return null;
    const trimmedName = parsed.guestName.trim().replace(/\s+/g, ' ');
    if (trimmedName.length < 4 || countMeaningfulWords(trimmedName) < 2) return null;
    const attending = Boolean(parsed.attending);
    const companions = attending ? normalizeCompanions(parsed.companions, maxGuests) : 0;
    const rawCompanions = Array.isArray(parsed.companionNames) ? parsed.companionNames : [];
    const companionNames = attending
      ? rawCompanions
        .slice(0, companions)
        .map((item) => (typeof item === 'string' ? item.trim().replace(/\s+/g, ' ').slice(0, 80) : ''))
      : [];

    return {
      guestName: trimmedName,
      attending,
      companions,
      companionNames,
      message: typeof parsed.message === 'string' ? parsed.message.slice(0, 260) : '',
      submittedAt: typeof parsed.submittedAt === 'string' ? parsed.submittedAt : '',
      action: parsed.action === 'updated' ? 'updated' : 'created',
    };
  } catch {
    return null;
  }
}

const CALENDAR_MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const CALENDAR_WEEKDAYS_FULL = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

/**
 * Calcula la geometría real del mes de la boda (lunes a domingo) sin desfasajes de zona horaria.
 */
export function parseWeddingCalendarDate(isoString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(isoString || ''));
  const rawYear = match ? Number(match[1]) : 2027;
  const rawMonth = match ? Number(match[2]) : 4;
  const rawDay = match ? Number(match[3]) : 10;

  const isValidMonth = Number.isInteger(rawMonth) && rawMonth >= 1 && rawMonth <= 12;
  const year = Number.isInteger(rawYear) && rawYear >= 1970 ? rawYear : 2027;
  const month = isValidMonth ? rawMonth : 4;
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Number.isInteger(rawDay) && rawDay >= 1 && rawDay <= daysInMonth ? rawDay : 10;

  const firstWeekdayMon = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const weddingWeekdayIdx = (firstWeekdayMon + day - 1) % 7;

  return {
    year,
    month,
    monthName: CALENDAR_MONTH_NAMES[month - 1] || 'Abril',
    day,
    daysInMonth,
    leadingBlanks: firstWeekdayMon,
    weddingWeekdayIdx,
    weddingWeekdayName: CALENDAR_WEEKDAYS_FULL[weddingWeekdayIdx] || 'Sábado',
  };
}

/**
 * Determina la sección activa a partir de las posiciones verticales de capítulos contiguos.
 */
export function resolveActiveSectionId(sectionPositions, { scrollY = 0, viewportHeight = 800, docHeight = 3000 } = {}) {
  if (!Array.isArray(sectionPositions) || sectionPositions.length === 0) return 'portada';
  if (scrollY <= 24) return sectionPositions[0].id;
  if (viewportHeight + scrollY >= docHeight - 24) {
    return sectionPositions[sectionPositions.length - 1].id;
  }

  const probeY = 68 + Math.min(viewportHeight * 0.25, 200);
  let current = sectionPositions[0].id;
  for (const item of sectionPositions) {
    if (item.top <= probeY) {
      current = item.id;
    } else {
      break;
    }
  }
  return current;
}

export function parseStoredSongs(rawJson, maxItems = 5) {
  if (!rawJson) return [];
  try {
    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set();
    const clean = [];
    for (const item of parsed) {
      if (typeof item !== 'string') continue;
      const trimmed = item.trim().replace(/\s+/g, ' ').slice(0, 100);
      if (!trimmed) continue;
      const key = normalizeMatchKey(trimmed);
      if (seen.has(key)) continue;
      seen.add(key);
      clean.push(trimmed);
      if (clean.length >= maxItems) break;
    }
    return clean;
  } catch {
    return [];
  }
}
