/**
 * Google Apps Script — Planilla de Invitados y Música (Scarlett & Byron)
 *
 * Crea y mantiene automáticamente 4 hojas en Google Drive:
 *  1. Resumen        -> Contadores en vivo (Confirmados, No asisten, Total personas, Canciones)
 *  2. Confirmaciones -> Lista maestra SIN duplicados (actualiza si ya existe), nombres de acompañantes, filtro Sí/No y colores
 *  3. Solo Asisten   -> Vista filtrada automática solo de quienes SÍ van (lista para salón/catering)
 *  4. Musica         -> Playlist filtrable, 0 anónimos (valida que esté en Confirmaciones), 0 duplicados
 *
 * Instalación y actualización: ver `docs/GUIA_GOOGLE_DRIVE.md`
 */

const SHEET_SUMMARY = "Resumen";
const SHEET_RSVP = "Confirmaciones";
const SHEET_ATTENDING = "Solo Asisten";
const SHEET_SONGS = "Musica";
const TIMEZONE = "America/Santiago";
const MAX_COMPANIONS = 10;
const MAX_SONGS_PER_GUEST = 5;

function sanitizeCell(value, maxLen) {
  let str = String(value == null ? "" : value)
    .trim()
    .replace(/\s+/g, " ");
  if (maxLen && str.length > maxLen) {
    str = str.slice(0, maxLen);
  }
  // Evita formula injection en Google Sheets (=, +, -, @ al inicio)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return str;
}

/**
 * Normaliza textos para comparar duplicados sin distinguir tildes, mayúsculas ni espacios extra.
 */
function normalizeMatchKey(value) {
  return String(value == null ? "" : value)
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function countMeaningfulWords(text) {
  return String(text || "")
    .split(/[\s,&]+/)
    .map((part) => part.replace(/^['.-]+|['.-]+$/g, ""))
    .filter((part) => /[A-Za-zÁÉÍÓÚáéíóúÑñÜü]{2,}/.test(part)).length;
}

function isValidFullName(name) {
  if (!name || name.length < 4 || name.length > 80) return false;
  if (countMeaningfulWords(name) < 2) return false;
  if (/([A-Za-zÁÉÍÓÚáéíóúÑñÜü])\1{3,}/i.test(name)) return false;
  return true;
}

function parseCompanionNames(rawNames, expectedCount, guestName) {
  let list = [];
  if (Array.isArray(rawNames)) {
    list = rawNames.map((item) => sanitizeCell(item, 80));
  } else if (typeof rawNames === "string" && rawNames.trim()) {
    list = rawNames
      .split(/[,;\n]+/)
      .map((item) => sanitizeCell(item, 80))
      .filter(Boolean);
  }

  if (list.length < expectedCount) {
    return {
      ok: false,
      error:
        "Debes escribir el nombre y apellido completo de cada acompañante.",
    };
  }

  const trimmed = list.slice(0, expectedCount);
  const seen = {};
  const guestKey = normalizeMatchKey(guestName);

  for (let i = 0; i < trimmed.length; i++) {
    const compName = trimmed[i];
    if (!isValidFullName(compName)) {
      return {
        ok: false,
        error: `Revisa el nombre y apellido completo del acompañante ${i + 1}.`,
      };
    }
    const key = normalizeMatchKey(compName);
    if (key === guestKey) {
      return {
        ok: false,
        error:
          "No hace falta incluirte en acompañantes; ingresa el nombre de tu acompañante.",
      };
    }
    if (seen[key]) {
      return {
        ok: false,
        error:
          "Hay nombres de acompañantes repetidos; ingresa cada acompañante una sola vez.",
      };
    }
    seen[key] = true;
  }

  return { ok: true, formatted: trimmed.join(", ") };
}

function formatTimestamp(date) {
  return Utilities.formatDate(date, TIMEZONE, "dd/MM/yyyy HH:mm");
}

function getFormulaSeparator(ss) {
  const locale = String(ss.getSpreadsheetLocale() || "es_CL").toLowerCase();
  // Locales con punto decimal (EE.UU., México, etc.) usan ","; Chile/Argentina/España usan ";"
  const commaLocales =
    /^(en_|es_mx|es_us|es_gt|es_hn|es_ni|es_pa|es_pr|es_sv|es_do|ja_|ko_|zh_|th_|he_|hi_)/;
  return commaLocales.test(locale) ? "," : ";";
}

function styleHeaderRow(sheet, headers) {
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange
    .setBackground("#96712C")
    .setFontColor("#FDFBF7")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

function ensureFilter(sheet, columnCount) {
  const existingFilter = sheet.getFilter();
  if (existingFilter) {
    if (existingFilter.getRange().getNumColumns() === columnCount) {
      return;
    }
    existingFilter.remove();
  }
  const maxRows = Math.min(
    sheet.getMaxRows(),
    Math.max(sheet.getLastRow(), 200),
  );
  sheet.getRange(1, 1, maxRows, columnCount).createFilter();
}

function configureRsvpFormatting(rsvpSheet) {
  styleHeaderRow(rsvpSheet, [
    "Fecha y Hora",
    "Nombre y Apellido",
    "Asiste",
    "Acompañantes",
    "Total Personas",
    "Nombres de Acompañantes",
    "Saludo / Mensaje",
    "Estado",
  ]);
  rsvpSheet.setColumnWidths(1, 8, 165);
  rsvpSheet.setColumnWidth(2, 230);
  rsvpSheet.setColumnWidth(3, 110);
  rsvpSheet.setColumnWidth(4, 125);
  rsvpSheet.setColumnWidth(5, 130);
  rsvpSheet.setColumnWidth(6, 280);
  rsvpSheet.setColumnWidth(7, 280);
  rsvpSheet.setColumnWidth(8, 120);

  // Desplegable Sí / No en columna Asiste
  const attendanceRange = rsvpSheet.getRange("C2:C500");
  const yesNoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Sí", "No"], true)
    .setAllowInvalid(false)
    .build();
  attendanceRange.setDataValidation(yesNoRule);
  attendanceRange.setHorizontalAlignment("center");

  // Colores visuales automáticos: Verde = Sí, Rojo suave = No
  const yesFormat = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Sí")
    .setBackground("#E6F4EA")
    .setFontColor("#1E6B3A")
    .setBold(true)
    .setRanges([attendanceRange])
    .build();
  const noFormat = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("No")
    .setBackground("#FCE8E6")
    .setFontColor("#A51D2D")
    .setBold(true)
    .setRanges([attendanceRange])
    .build();
  rsvpSheet.setConditionalFormatRules([yesFormat, noFormat]);

  ensureFilter(rsvpSheet, 8);
}

function configureSongsFormatting(songsSheet) {
  styleHeaderRow(songsSheet, ["Fecha y Hora", "Invitado", "Canción / Artista"]);
  songsSheet.setColumnWidth(1, 160);
  songsSheet.setColumnWidth(2, 220);
  songsSheet.setColumnWidth(3, 330);
  ensureFilter(songsSheet, 3);
}

function writeSummaryRows(ss, summarySheet) {
  const sep = getFormulaSeparator(ss);
  styleHeaderRow(summarySheet, ["Indicador", "Cantidad"]);
  const lastRow = summarySheet.getLastRow();
  if (lastRow >= 2) {
    summarySheet.getRange(2, 1, lastRow - 1, 2).clearContent();
  }
  summarySheet
    .getRange(2, 1, 4, 1)
    .setValues([
      ["Respuestas que SÍ asisten"],
      ["Respuestas que NO asisten"],
      ["Total de personas confirmadas (titulares + acompañantes)"],
      ["Canciones sugeridas para la fiesta"],
    ]);
  summarySheet
    .getRange(2, 2, 4, 1)
    .setFormulas([
      [`=COUNTIF(${SHEET_RSVP}!C2:C${sep}"Sí")`],
      [`=COUNTIF(${SHEET_RSVP}!C2:C${sep}"No")`],
      [`=SUM(${SHEET_RSVP}!E2:E)`],
      [`=COUNTA(${SHEET_SONGS}!C2:C)`],
    ]);
  summarySheet.setColumnWidth(1, 380);
  summarySheet.setColumnWidth(2, 140);
  summarySheet
    .getRange("B2:B5")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
}

function writeAttendingView(ss, attendingSheet) {
  const sep = getFormulaSeparator(ss);
  styleHeaderRow(attendingSheet, [
    "Nombre y Apellido",
    "Asiste",
    "Acompañantes",
    "Total Personas",
    "Nombres de Acompañantes",
    "Saludo / Mensaje",
  ]);
  attendingSheet.setColumnWidth(1, 230);
  attendingSheet.setColumnWidth(2, 100);
  attendingSheet.setColumnWidth(3, 125);
  attendingSheet.setColumnWidth(4, 130);
  attendingSheet.setColumnWidth(5, 280);
  attendingSheet.setColumnWidth(6, 280);

  // Limpia posibles residuos previos y coloca la fórmula dinámica FILTER
  const lastRow = attendingSheet.getLastRow();
  if (lastRow >= 2) {
    attendingSheet.getRange(2, 1, lastRow - 1, 6).clearContent();
  }
  attendingSheet
    .getRange("A2")
    .setFormula(
      `=IFERROR(FILTER(${SHEET_RSVP}!B2:G${sep}${SHEET_RSVP}!C2:C="Sí")${sep}"Aún no hay invitados confirmados")`,
    );
}

function ensureSheets(ss) {
  let rsvpSheet = ss.getSheetByName(SHEET_RSVP);
  let schemaUpgraded = false;

  if (!rsvpSheet) {
    rsvpSheet = ss.insertSheet(SHEET_RSVP);
    configureRsvpFormatting(rsvpSheet);
  } else if (
    !rsvpSheet.getFilter() ||
    rsvpSheet.getConditionalFormatRules().length === 0 ||
    String(rsvpSheet.getRange("F1").getValue()).trim() !==
      "Nombres de Acompañantes" ||
    String(rsvpSheet.getRange("H1").getValue()).trim() !== "Estado"
  ) {
    // Auto-actualiza encabezados, filtro y colores de versiones previas sin borrar invitados
    configureRsvpFormatting(rsvpSheet);
    schemaUpgraded = true;
  }

  let songsSheet = ss.getSheetByName(SHEET_SONGS);
  if (!songsSheet) {
    songsSheet = ss.insertSheet(SHEET_SONGS);
    configureSongsFormatting(songsSheet);
  } else if (!songsSheet.getFilter()) {
    configureSongsFormatting(songsSheet);
  }

  let attendingSheet = ss.getSheetByName(SHEET_ATTENDING);
  if (!attendingSheet) {
    attendingSheet = ss.insertSheet(SHEET_ATTENDING);
    writeAttendingView(ss, attendingSheet);
  } else if (
    schemaUpgraded ||
    String(attendingSheet.getRange("E1").getValue()).trim() !==
      "Nombres de Acompañantes"
  ) {
    writeAttendingView(ss, attendingSheet);
  }

  let summarySheet = ss.getSheetByName(SHEET_SUMMARY);
  if (!summarySheet) {
    summarySheet = ss.insertSheet(SHEET_SUMMARY, 0);
    writeSummaryRows(ss, summarySheet);
  } else if (schemaUpgraded) {
    writeSummaryRows(ss, summarySheet);
  }

  return { rsvpSheet, songsSheet, attendingSheet, summarySheet };
}

/**
 * Busca una fila en Confirmaciones por nombre normalizado (o nombre anterior si corrigió un error).
 * Devuelve `{ rowNumber, canonicalName }` o `null`.
 */
function findGuestInRsvp(rsvpSheet, guestName, previousGuestName) {
  const lastRow = rsvpSheet.getLastRow();
  if (lastRow < 2) return null;

  const targetKey = normalizeMatchKey(guestName);
  const prevKey = previousGuestName ? normalizeMatchKey(previousGuestName) : "";
  const names = rsvpSheet.getRange(2, 2, lastRow - 1, 1).getValues();

  // Prioridad 1: coincidencia exacta con el nombre actual
  for (let i = 0; i < names.length; i++) {
    const existingName = String(names[i][0] || "").trim();
    if (existingName && normalizeMatchKey(existingName) === targetKey) {
      return { rowNumber: i + 2, canonicalName: existingName };
    }
  }

  // Prioridad 2: si corrigió un error tipográfico desde el mismo dispositivo
  if (prevKey && prevKey !== targetKey) {
    for (let i = 0; i < names.length; i++) {
      const existingName = String(names[i][0] || "").trim();
      if (existingName && normalizeMatchKey(existingName) === prevKey) {
        return { rowNumber: i + 2, canonicalName: existingName };
      }
    }
  }

  return null;
}

/**
 * Comprueba si una canción ya existe en Musica y cuántas sugirió el invitado.
 */
function inspectSongsSheet(songsSheet, guestName, song) {
  const lastRow = songsSheet.getLastRow();
  if (lastRow < 2) {
    return { isDuplicate: false, guestSongCount: 0 };
  }

  const targetSongKey = normalizeMatchKey(song);
  const targetGuestKey = normalizeMatchKey(guestName);
  const rows = songsSheet.getRange(2, 2, lastRow - 1, 2).getValues();

  let isDuplicate = false;
  let guestSongCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowGuestKey = normalizeMatchKey(rows[i][0]);
    const rowSongKey = normalizeMatchKey(rows[i][1]);
    if (rowSongKey && rowSongKey === targetSongKey) {
      isDuplicate = true;
    }
    if (rowGuestKey && rowGuestKey === targetGuestKey) {
      guestSongCount++;
    }
  }

  return { isDuplicate, guestSongCount };
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * Crea las hojas faltantes, aplica filtros Sí/No, colores condicionales y actualiza
 * fórmulas de Resumen y Solo Asisten sin borrar ningún invitado existente.
 */
function inicializarPlanilla() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const { rsvpSheet, songsSheet, attendingSheet, summarySheet } =
    ensureSheets(ss);

  configureRsvpFormatting(rsvpSheet);
  configureSongsFormatting(songsSheet);
  writeSummaryRows(ss, summarySheet);
  writeAttendingView(ss, attendingSheet);
  SpreadsheetApp.flush();
}

/**
 * Health check simple para verificar que la Web App está publicada y activa.
 */
function doGet() {
  return jsonResponse({
    ok: true,
    service: "scarlett-byron-wedding-sheets",
    status: "ready",
    features: [
      "upsert-rsvp",
      "required-companion-names",
      "verified-guest-songs",
      "auto-filters",
    ],
  });
}

/**
 * Recibe confirmaciones (`type: "rsvp"`) con actualización automática sin duplicados
 * y canciones (`type: "song"`) solo de invitados previamente registrados.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const rawBody =
      e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    const data = JSON.parse(rawBody);

    // Honeypot anti-bots: si viene relleno, se ignora silenciosamente
    if (data && data.website && String(data.website).trim() !== "") {
      return jsonResponse({ ok: true, ignored: true });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const { rsvpSheet, songsSheet } = ensureSheets(ss);
    const nowText = formatTimestamp(new Date());

    if (data.type === "rsvp") {
      const guestName = sanitizeCell(data.guestName, 80);
      const previousGuestName = sanitizeCell(data.previousGuestName, 80);

      if (!isValidFullName(guestName)) {
        return jsonResponse({
          ok: false,
          code: "INVALID_NAME",
          error: "Ingresa tu nombre y apellido completo para registrarte.",
        });
      }

      const attending = Boolean(data.attending);
      const companions = attending
        ? Math.max(
            0,
            Math.min(MAX_COMPANIONS, parseInt(data.companions, 10) || 0),
          )
        : 0;
      const totalPeople = attending ? 1 + companions : 0;

      let companionNamesText = "";
      if (attending && companions > 0) {
        const compCheck = parseCompanionNames(
          data.companionNames,
          companions,
          guestName,
        );
        if (!compCheck.ok) {
          return jsonResponse({
            ok: false,
            code: "INVALID_COMPANIONS",
            error: compCheck.error,
          });
        }
        companionNamesText = compCheck.formatted;
      }

      const message = sanitizeCell(data.message, 260);
      const existing = findGuestInRsvp(rsvpSheet, guestName, previousGuestName);

      if (existing) {
        rsvpSheet
          .getRange(existing.rowNumber, 1, 1, 8)
          .setValues([
            [
              nowText,
              guestName,
              attending ? "Sí" : "No",
              companions,
              totalPeople,
              companionNamesText,
              message,
              "Actualizado",
            ],
          ]);

        return jsonResponse({
          ok: true,
          type: "rsvp",
          action: "updated",
          savedAt: nowText,
        });
      }

      rsvpSheet.appendRow([
        nowText,
        guestName,
        attending ? "Sí" : "No",
        companions,
        totalPeople,
        companionNamesText,
        message,
        "Nuevo",
      ]);

      return jsonResponse({
        ok: true,
        type: "rsvp",
        action: "created",
        savedAt: nowText,
      });
    }

    if (data.type === "song") {
      const song = sanitizeCell(data.song, 100);
      const rawGuestName = sanitizeCell(data.guestName, 80);

      if (
        !rawGuestName ||
        normalizeMatchKey(rawGuestName) === "anonimo" ||
        countMeaningfulWords(rawGuestName) < 2
      ) {
        return jsonResponse({
          ok: false,
          code: "RSVP_REQUIRED",
          error:
            "Primero registra tu nombre y apellido en Confirmar Asistencia para sugerir música.",
        });
      }

      const registeredGuest = findGuestInRsvp(rsvpSheet, rawGuestName, "");
      if (!registeredGuest) {
        return jsonResponse({
          ok: false,
          code: "RSVP_REQUIRED",
          error:
            "Primero debes confirmar tus datos en el formulario de asistencia para sugerir canciones.",
        });
      }

      if (song.length < 3 || !/[A-Za-zÁÉÍÓÚáéíóúÑñÜü]{2,}/.test(song)) {
        return jsonResponse({
          ok: false,
          code: "INVALID_SONG",
          error:
            "Escribe un nombre de tema y artista válido (mínimo 3 caracteres).",
        });
      }

      const check = inspectSongsSheet(
        songsSheet,
        registeredGuest.canonicalName,
        song,
      );

      if (check.isDuplicate) {
        return jsonResponse({
          ok: false,
          code: "DUPLICATE_SONG",
          error: "Esa canción ya está en la playlist de la fiesta.",
        });
      }

      if (check.guestSongCount >= MAX_SONGS_PER_GUEST) {
        return jsonResponse({
          ok: false,
          code: "SONG_LIMIT",
          error: `Ya alcanzaste el máximo de ${MAX_SONGS_PER_GUEST} canciones sugeridas.`,
        });
      }

      songsSheet.appendRow([nowText, registeredGuest.canonicalName, song]);

      return jsonResponse({
        ok: true,
        type: "song",
        action: "created",
        savedAt: nowText,
      });
    }

    return jsonResponse({
      ok: false,
      code: "UNSUPPORTED_TYPE",
      error: "Tipo de envío no soportado.",
    });
  } catch (err) {
    return jsonResponse({
      ok: false,
      code: "SERVER_ERROR",
      error: err && err.message ? err.message : "Error interno al guardar.",
    });
  } finally {
    lock.releaseLock();
  }
}
