function fmtLocalCalendarDate(dateStr) {
  const clean = String(dateStr).replace(/[-:]/g, '');
  const match = clean.match(/^(\d{8}T\d{6})/);
  if (match) return match[1];

  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}T${hh}${min}${ss}`;
}

export function buildGoogleCalendarUrl({
  title,
  details = '',
  location = '',
  startDate,
  endDate,
  timezone = 'America/Santiago',
}) {
  const dates = `${fmtLocalCalendarDate(startDate)}/${fmtLocalCalendarDate(endDate)}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details,
    location,
    ctz: timezone,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsContent({
  title,
  details = '',
  location = '',
  startDate,
  endDate,
  organizer = 'Matrimonio Scarlett y Byron',
}) {
  const dtStart = fmtLocalCalendarDate(startDate);
  const dtEnd = fmtLocalCalendarDate(endDate);
  const cleanOrg = String(organizer).replace(/[^\w\s-]/g, '').trim() || 'Matrimonio';
  const escapeIcs = (str) =>
    String(str)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${cleanOrg}//Invitacion Digital//ES`,
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(details)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcsFile({
  title,
  details,
  location,
  startDate,
  endDate,
  organizer,
  fileName = 'evento-matrimonio.ics',
}) {
  const content = buildIcsContent({ title, details, location, startDate, endDate, organizer });
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
