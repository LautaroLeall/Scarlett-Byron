import { motion } from 'framer-motion';
import { ArrowRight, Music, RotateCcw } from 'lucide-react';
import { IMAGES, WEDDING_DETAILS } from '../data/weddingData.js';
import { ResilientImage } from './ResilientImage.jsx';
import { BaroqueDivider, StarlightField } from './RoyalOrnaments.jsx';

const CALM_EASE = [0.22, 1, 0.36, 1];

export function EnvelopeRevealedCard({
  isPlaying,
  onEnterInvitation,
  onCloseEnvelope,
  className = '',
}) {
  return (
    <motion.section
      key="opened-royal-card"
      aria-label="Invitación revelada"
      initial={{ opacity: 0, y: 18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.98,
        transition: { duration: 0.34, ease: 'easeOut' },
      }}
      transition={{ duration: 0.88, ease: CALM_EASE }}
      className={`relative w-full max-w-106 will-change-transform ${className}`}
    >
      {/* Solo 2 rosas exteriores en diagonal (arriba-izquierda y abajo-derecha) DETRÁS de la tarjeta */}
      <img
        src={IMAGES.rosesCorner}
        alt=""
        aria-hidden="true"
        loading="eager"
        className="pointer-events-none select-none absolute -top-9 -left-9 sm:-top-11 sm:-left-11 z-0 w-28 sm:w-34 rotate-180 object-contain drop-shadow-[0_10px_22px_rgba(4,9,24,0.7)]"
      />
      <img
        src={IMAGES.rosesCorner}
        alt=""
        aria-hidden="true"
        loading="eager"
        className="pointer-events-none select-none absolute -bottom-9 -right-8 sm:-bottom-10 sm:-right-10 z-0 w-26 sm:w-32 opacity-92 object-contain drop-shadow-[0_10px_22px_rgba(4,9,24,0.7)]"
      />

      <div className="relative z-10 w-full rounded-3xl overflow-hidden border-2 border-gold/85 shadow-[0_30px_68px_-14px_rgba(4,9,24,0.88)] bg-ivory-50">
        {/* Encabezado azul real medianoche */}
        <div className="relative bg-linear-to-b from-royal-950 via-royal-900 to-royal-800 px-5 py-3.5 sm:px-6 sm:py-4 text-center overflow-hidden border-b-2 border-gold/70">
          <StarlightField />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16, ease: CALM_EASE }}
            className="relative z-10 flex flex-col items-center gap-1"
          >
            <ResilientImage
              src={IMAGES.crown}
              alt="Corona dorada real"
              loading="eager"
              className="w-10 h-6 sm:w-11 sm:h-7 object-contain -mb-1 gentle-float drop-shadow-[0_4px_10px_rgba(232,204,136,0.45)]"
            />
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-gold-light bg-royal-950/75 flex items-center justify-center shadow-[0_0_20px_rgba(232,204,136,0.3)]">
              <span className="font-headline text-[13px] sm:text-[14px] leading-4 tracking-[1.2px] font-semibold text-champagne">
                {WEDDING_DETAILS.monogram}
              </span>
            </div>
            <span className="font-label text-[9.5px] leading-3.5 tracking-[2px] font-semibold text-gold-light uppercase mt-0.5">
              {WEDDING_DETAILS.eyebrow}
            </span>
            <h1 className="font-display text-[34px] sm:text-[38px] leading-9.5 sm:leading-10.5 text-ivory-50 drop-shadow-[0_2px_10px_rgba(5,11,28,0.65)]">
              {WEDDING_DETAILS.coupleNames}
            </h1>
            <p className="font-headline text-[9.5px] tracking-[1.5px] uppercase text-champagne/90">
              {WEDDING_DETAILS.tagline}
            </p>
          </motion.div>
        </div>

        {/* Cuerpo de pergamino iluminado compacto */}
        <div className="parchment-sheet relative px-5 py-3.5 sm:px-6 sm:py-4 flex flex-col items-center text-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.26, ease: CALM_EASE }}
            className="relative z-10 w-full flex flex-col items-center gap-2.5"
          >
            <p className="font-body text-[12px] sm:text-[13px] leading-4.5 sm:leading-4.75 text-ink-muted max-w-sm text-pretty">
              El sobre se ha abierto y comienza a sonar nuestra canción. Te invitamos a compartir
              uno de los momentos más importantes de nuestras vidas y a celebrar juntos este cuento
              de amor.
            </p>

            <div className="rounded-xl bg-ivory-50/90 border border-gold/60 px-3.5 py-1.5 shadow-xs">
              <p className="font-headline text-[11px] sm:text-[11.5px] tracking-[1.1px] font-semibold text-royal-900 uppercase">
                {WEDDING_DETAILS.dateFormatted} · {WEDDING_DETAILS.ceremony.time}
              </p>
              <p className="font-body text-[11px] leading-4 text-ink-muted mt-0.5">
                {WEDDING_DETAILS.ceremony.venue} · {WEDDING_DETAILS.ceremony.address}
              </p>
            </div>

            <BaroqueDivider className="max-w-52" />

            {/* Indicador musical en vivo */}
            <div
              className={`inline-flex items-center justify-center gap-2 rounded-full bg-royal-900 px-3.5 py-1.5 border border-gold/60 text-ivory-50 shadow-sm ${isPlaying ? 'is-playing' : ''
                }`}
            >
              <Music className="w-3.5 h-3.5 text-gold-light shrink-0" aria-hidden="true" />
              <span className="font-label text-[10px] sm:text-[10.5px] leading-3.5 tracking-[0.4px] font-medium">
                {WEDDING_DETAILS.audio.title} · {isPlaying ? 'Reproduciendo' : 'En pausa'}
              </span>
              <span className="inline-flex items-center gap-0.5 h-3" aria-hidden="true">
                <span className="wave-bar w-0.5 h-2 bg-gold-light rounded-full" />
                <span className="wave-bar w-0.5 h-3 bg-champagne rounded-full" />
                <span className="wave-bar w-0.5 h-1.5 bg-gold-light rounded-full" />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-0.5 w-full">
              <motion.button
                type="button"
                onClick={onEnterInvitation}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="btn-gold w-full min-h-10.5 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2 focus-visible:ring-offset-ivory-50 cursor-pointer whitespace-nowrap"
              >
                <span className="font-label text-[11px] leading-4 tracking-[1px] font-semibold">
                  Abrir Invitación
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </motion.button>

              <motion.button
                type="button"
                onClick={onCloseEnvelope}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="btn-ivory w-full min-h-10.5 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2 focus-visible:ring-offset-ivory-50 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="font-label text-[10.5px] leading-3.5 tracking-[0.9px] font-semibold">
                  Cerrar sobre
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
