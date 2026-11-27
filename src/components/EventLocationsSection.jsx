import { motion } from 'framer-motion';
import { Church, PartyPopper, MapPin, CalendarPlus, Download } from 'lucide-react';
import { IMAGES, WEDDING_DETAILS } from '../data/weddingData.js';
import { buildGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar.js';
import { EnchantedCharacter } from './EnchantedCharacter.jsx';
import { BaroqueDivider } from './RoyalOrnaments.jsx';

const cardRevealVariants = {
  hidden: { opacity: 0, y: 26, scale: 0.98 },
  visible: (delayIndex) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      delay: delayIndex * 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function EventCard({ eventData, IconComponent, delayIndex, characterSlot = null }) {
  const fullLocation = `${eventData.venue}, ${eventData.address}`;
  const googleCalUrl = buildGoogleCalendarUrl({
    title: eventData.calendarTitle,
    details: eventData.calendarDetails,
    location: fullLocation,
    startDate: eventData.startDate,
    endDate: eventData.endDate,
    timezone: WEDDING_DETAILS.timezone,
  });

  const handleDownloadIcs = () => {
    downloadIcsFile({
      title: eventData.calendarTitle,
      details: eventData.calendarDetails,
      location: fullLocation,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      organizer: WEDDING_DETAILS.coupleNames,
      fileName: eventData.icsFileName,
    });
  };

  return (
    <motion.article
      custom={delayIndex}
      variants={cardRevealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 'some' }}
      whileHover={{ y: -3 }}
      className="enchanted-card relative overflow-hidden w-full bg-surface-container border border-outline rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5"
    >
      {/* Filete superior azul real y dorado */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-royal-900 via-gold to-crimson"
      />

      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-royal-900 border border-gold/70 flex items-center justify-center shrink-0 shadow-xs">
              <IconComponent className="w-5 h-5 text-gold-light" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="font-headline text-[16px] sm:text-[17px] leading-5.5 tracking-[1px] font-semibold text-royal-900">
                {eventData.title}
              </h3>
              <p className="font-title text-[15px] leading-5.5 font-semibold text-crimson mt-0.5">
                {eventData.time}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 pt-3 border-t border-outline-variant/65">
            <p className="font-body text-[14px] leading-5.5 font-medium text-ink">
              {eventData.venue}
            </p>
            <p className="font-body text-[13px] leading-5 text-ink-muted">
              {eventData.address}
            </p>
          </div>
        </div>

        {characterSlot}
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <a
            href={eventData.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold min-h-11 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2.5 rounded-xl uppercase whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container"
          >
            <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="font-label text-[11px] leading-3.5 tracking-[0.8px] font-semibold">
              Ver mapa
            </span>
          </a>

          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-royal min-h-11 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2.5 rounded-xl uppercase whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container"
          >
            <CalendarPlus className="w-4 h-4 text-gold-light shrink-0" aria-hidden="true" />
            <span className="font-label text-[11px] leading-3.5 tracking-[0.8px] font-semibold">
              Agendar
            </span>
          </a>
        </div>

        <button
          type="button"
          onClick={handleDownloadIcs}
          className="inline-flex items-center justify-center gap-1.5 min-h-9 px-2 text-center text-[11px] font-label tracking-[0.5px] text-ink-muted hover:text-royal-900 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark rounded-lg"
        >
          <Download className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
          <span>Descargar recordatorio (.ics)</span>
        </button>
      </div>
    </motion.article>
  );
}

export function EventLocationsSection() {
  return (
    <div className="w-full flex flex-col gap-7 sm:gap-9">
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center gap-2.5"
      >
        <span className="font-label text-[11px] leading-4 tracking-[1.8px] font-semibold uppercase text-crimson">
          Cuándo y Dónde
        </span>
        <h2 className="font-headline text-[22px] sm:text-[26px] leading-7.5 tracking-[1.4px] font-semibold text-royal-900 uppercase">
          Ceremonia y Recepción
        </h2>
        <BaroqueDivider />
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        <EventCard
          eventData={WEDDING_DETAILS.ceremony}
          IconComponent={Church}
          delayIndex={0}
        />

        <EventCard
          eventData={WEDDING_DETAILS.reception}
          IconComponent={PartyPopper}
          delayIndex={1}
          characterSlot={
            <EnchantedCharacter
              src={IMAGES.lumiere}
              alt={WEDDING_DETAILS.characters.lumiere.alt}
              quote={WEDDING_DETAILS.characters.lumiere.quote}
              idleAnimation="candle"
              imgClassName="w-16 h-24 sm:w-20 sm:h-28 object-contain"
            />
          }
        />
      </div>
    </div>
  );
}
