import { useId } from 'react';
import { motion } from 'framer-motion';
import { WEDDING_DETAILS } from '../data/weddingData.js';
import { parseWeddingCalendarDate } from '../utils/weddingLogic.js';

const WEEKDAY_SHORT = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const WEEKDAY_FULL = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export function ForeverHeartFlourish({ tone = 'champagne', className = '' }) {
  const uid = useId();
  const gradientId = `forever-flourish-${uid.replace(/:/g, '')}`;
  const isLight = tone === 'champagne';

  return (
    <svg
      viewBox="0 0 260 64"
      fill="none"
      aria-hidden="true"
      className={`overflow-visible select-none ${className}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="12" y1="36" x2="248" y2="28" gradientUnits="userSpaceOnUse">
          {isLight ? (
            <>
              <stop offset="0%" stopColor="#D6B062" stopOpacity="0.72" />
              <stop offset="48%" stopColor="#F8E8BE" stopOpacity="1" />
              <stop offset="72%" stopColor="#E9C77B" stopOpacity="1" />
              <stop offset="100%" stopColor="#C8A152" stopOpacity="0.78" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#C8A152" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#946E27" stopOpacity="0.95" />
              <stop offset="72%" stopColor="#9E1B24" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#C8A152" stopOpacity="0.7" />
            </>
          )}
        </linearGradient>
      </defs>

      <motion.circle
        cx="16"
        cy="46.5"
        r="2"
        fill={isLight ? '#E8CC88' : '#946E27'}
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.95 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.35, delay: 0.08 }}
      />

      <motion.path
        d="M 16 46 C 18 34, 42 29, 76 34 C 114 39, 142 45, 166 37 C 182 31, 195 20, 188 12 C 183 6, 172 9, 167 19 C 164 8, 153 4, 147 12 C 140 21, 149 32, 166 37 C 186 43, 216 49, 244 35"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.35 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 1.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

export function WeddingCalendarCard({ venueLabel = '', className = '' }) {
  const uid = useId();
  const heartGradId = `wedding-heart-${uid.replace(/:/g, '')}`;
  const cal = parseWeddingCalendarDate(WEDDING_DETAILS.targetDateIso);
  const blanks = Array.from({ length: cal.leadingBlanks }, (_, idx) => idx);
  const days = Array.from({ length: cal.daysInMonth }, (_, idx) => idx + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 'some' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`royal-glass relative overflow-hidden w-full rounded-2xl px-4 sm:px-5 pt-4 pb-4.5 text-center ${className}`}
    >
      {/* Brillo superior dorado */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-gold-light/85 to-transparent"
      />

      {/* Encabezado del mes */}
      <div className="flex flex-col items-center gap-1 pb-2.5 border-b border-gold/25">
        <span className="font-label text-[10px] leading-3.5 tracking-[2.2px] font-semibold uppercase text-gold-light/85">
          Reserva la fecha
        </span>
        <div className="flex items-center justify-center gap-2.5">
          <span aria-hidden="true" className="h-px w-6 bg-linear-to-r from-transparent to-gold-light/70" />
          <p className="font-headline text-[16px] sm:text-[18px] leading-5.5 tracking-[2.2px] font-semibold uppercase text-champagne">
            {cal.monthName} · {cal.year}
          </p>
          <span aria-hidden="true" className="h-px w-6 bg-linear-to-l from-transparent to-gold-light/70" />
        </div>
        <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-royal-950/75 border border-gold/40 px-3 py-0.5 font-label text-[10.5px] leading-4 tracking-[0.9px] font-semibold uppercase text-ivory-100">
          {cal.weddingWeekdayName} {cal.day} · {WEDDING_DETAILS.ceremony.time}
        </span>
      </div>

      {/* Grilla del calendario de Abril 2027 */}
      <div
        role="grid"
        aria-label={`Calendario de ${cal.monthName} ${cal.year}, destacando el ${cal.weddingWeekdayName} ${cal.day} con un corazón`}
        className="mt-2.5"
      >
        <div role="row" className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_SHORT.map((label, idx) => (
            <span
              key={label}
              role="columnheader"
              aria-label={WEEKDAY_FULL[idx]}
              className={`font-label text-[10px] leading-4 tracking-[0.8px] font-semibold uppercase ${idx === cal.weddingWeekdayIdx ? 'text-champagne' : 'text-gold-light/75'
                }`}
            >
              {label}
            </span>
          ))}
        </div>

        <div role="rowgroup" className="grid grid-cols-7 gap-y-0.5 gap-x-1 tabular-nums">
          {blanks.map((blank) => (
            <span key={`blank-${blank}`} aria-hidden="true" className="h-8 sm:h-8.5" />
          ))}

          {days.map((dayNum) => {
            const isWeddingDay = dayNum === cal.day;

            if (isWeddingDay) {
              return (
                <div
                  key={dayNum}
                  role="gridcell"
                  aria-selected="true"
                  aria-label={`${cal.weddingWeekdayName} ${dayNum} de ${cal.monthName}, día de nuestro matrimonio`}
                  className="relative h-8 sm:h-8.5 flex items-center justify-center"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full bg-radial from-crimson/65 via-gold-light/25 to-transparent blur-[5px]"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.09, 1] }}
                    transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative flex items-center justify-center w-9 h-9 sm:w-9.5 sm:h-9.5"
                  >
                    <svg
                      viewBox="0 0 36 34"
                      fill="none"
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full drop-shadow-[0_3px_10px_rgba(158,27,36,0.75)]"
                    >
                      <defs>
                        <linearGradient id={heartGradId} x1="6" y1="4" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#D62839" />
                          <stop offset="55%" stopColor="#9E1B24" />
                          <stop offset="100%" stopColor="#6E0F16" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M18 31.2C17.2 31.2 4.2 22.8 4.2 12.6C4.2 7.4 8.2 3.5 13 3.5C15.5 3.5 17.1 4.7 18 6.4C18.9 4.7 20.5 3.5 23 3.5C27.8 3.5 31.8 7.4 31.8 12.6C31.8 22.8 18.8 31.2 18 31.2Z"
                        fill={`url(#${heartGradId})`}
                        stroke="#F8E8BE"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="relative z-10 -mt-0.5 font-headline text-[11px] sm:text-[12px] leading-none font-bold text-ivory-50 drop-shadow-[0_1px_2px_rgba(9,19,41,0.9)]">
                      {dayNum}
                    </span>
                  </motion.div>
                </div>
              );
            }

            return (
              <span
                key={dayNum}
                role="gridcell"
                className="h-8 sm:h-8.5 flex items-center justify-center font-body text-[12px] sm:text-[12.5px] font-medium text-royal-200/85"
              >
                {dayNum}
              </span>
            );
          })}
        </div>
      </div>

      {/* Mensaje romántico "Para siempre" + trazo caligráfico con corazón */}
      <div className="mt-2.5 pt-2.5 border-t border-gold/25 flex flex-col items-center">
        <p className="font-display text-[30px] sm:text-[34px] leading-8.5 text-champagne drop-shadow-[0_2px_12px_rgba(248,232,190,0.4)]">
          Para siempre
        </p>
        <ForeverHeartFlourish tone="champagne" className="w-44 sm:w-48 -mt-2" />
        <p className="font-label text-[10px] leading-3.5 tracking-[1.7px] font-semibold uppercase text-gold-light/90 -mt-1">
          El comienzo de nuestra eternidad
        </p>
        {venueLabel && (
          <p className="font-body text-[11.5px] sm:text-[12px] leading-4.5 text-royal-200/90 mt-1.5">
            {venueLabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}
