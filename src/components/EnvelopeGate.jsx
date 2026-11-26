import { motion, AnimatePresence } from 'framer-motion';
import { Music, RotateCcw, ArrowRight, VolumeX } from 'lucide-react';
import { IMAGES, WEDDING_DETAILS } from '../data/weddingData.js';
import { ResilientImage } from './ResilientImage.jsx';
import { FloatingPetals } from './FloatingPetals.jsx';

export function EnvelopeGate({
  isOpened,
  isPlaying,
  onOpenEnvelope,
  onCloseEnvelope,
  onEnterInvitation,
  onEnterSilent,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-dvh w-full bg-ivory-200/55 flex items-center justify-center sm:p-6 md:p-10 overflow-x-clip overflow-y-auto"
    >
      <FloatingPetals />

      <main className="relative z-10 min-h-dvh sm:min-h-155 w-full max-w-120 mx-auto bg-ivory-100 overflow-hidden flex flex-col items-center justify-center sm:border sm:rounded-2xl border-outline shadow-[0_18px_50px_-14px_rgba(44,36,30,0.2)]">
        {/* Borde interior barroco doble */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 sm:inset-4 rounded-xl border border-outline-variant/75 z-0"
        />

        {/* Tarjeta revelada detrás de las puertas del sobre */}
        <motion.section
          aria-label="Invitación revelada"
          initial={false}
          animate={
            isOpened
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 18, scale: 0.96 }
          }
          transition={{ duration: 0.55, delay: isOpened ? 0.25 : 0, ease: [0.22, 1, 0.36, 1] }}
          className={`relative z-10 w-full px-6 sm:px-9 py-7 sm:py-8 flex flex-col items-center text-center gap-3.5 ${isOpened ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
        >
          <div className="flex flex-col items-center">
            <ResilientImage
              src={IMAGES.crown}
              alt="Corona dorada real"
              loading="eager"
              className="w-16 h-11 object-contain -mb-1.5 gentle-float drop-shadow-[0_3px_6px_rgba(150,113,44,0.3)]"
            />
            <div className="w-18 h-18 rounded-full border-2 border-outline bg-ivory-50 flex items-center justify-center shadow-sm">
              <span className="font-headline text-[17px] leading-5.5 tracking-[1.2px] font-semibold text-ink">
                {WEDDING_DETAILS.monogram}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="font-label text-[12px] leading-4 tracking-[1.4px] font-semibold text-crimson uppercase">
              {WEDDING_DETAILS.eyebrow}
            </span>
            <h1 className="font-display text-[42px] sm:text-[48px] leading-13 text-ink">
              {WEDDING_DETAILS.coupleNames}
            </h1>
            <p className="font-headline text-[11px] tracking-[1.4px] uppercase text-gold-dark mt-0.5">
              {WEDDING_DETAILS.tagline}
            </p>
          </div>

          <p className="font-body text-[14px] leading-5.5 text-ink-muted max-w-xs text-pretty">
            El sobre se ha abierto y comienza a sonar nuestra canción. Te invitamos a celebrar este cuento de amor.
          </p>

          <div className="flex items-center justify-center gap-2 text-ink py-1">
            <Music className="w-4 h-4 text-crimson shrink-0" aria-hidden="true" />
            <span className="font-label text-[12px] leading-4 tracking-[0.4px] font-medium text-ink">
              {WEDDING_DETAILS.audio.title} · {isPlaying ? 'Reproduciendo' : 'En pausa'}
            </span>
          </div>

          <div className="flex flex-col gap-3 mt-2 w-full max-w-75">
            <motion.button
              type="button"
              onClick={onEnterInvitation}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-gold w-full min-h-12 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2 focus-visible:ring-offset-ivory-100 cursor-pointer whitespace-nowrap"
            >
              <span className="font-label text-[12px] leading-4 tracking-[1.2px] font-semibold">
                Abrir Invitación
              </span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </motion.button>

            <motion.button
              type="button"
              onClick={onCloseEnvelope}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="btn-ivory w-full min-h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2 focus-visible:ring-offset-ivory-100 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span className="font-label text-[11px] leading-3.5 tracking-[1px] font-semibold">
                Cerrar sobre
              </span>
            </motion.button>
          </div>
        </motion.section>

        {/* Puerta izquierda del sobre con enredaderas doradas */}
        <motion.div
          initial={false}
          animate={isOpened ? { x: '-102%', opacity: 0 } : { x: '0%', opacity: 1 }}
          transition={{ duration: 0.72, ease: [0.4, 0, 0.2, 1] }}
          className={`absolute inset-y-0 left-0 w-1/2 z-20 bg-ivory-100 border-r border-outline shadow-lg overflow-hidden ${isOpened ? 'pointer-events-none' : ''
            }`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 200 884" className="w-full h-full opacity-45" fill="none" preserveAspectRatio="none">
            <path d="M10 40 C60 90, 30 160, 90 210 C130 245, 70 320, 120 380" stroke="#C5A059" strokeWidth="1.6" />
            <path d="M40 80 C55 68, 70 75, 62 92 C48 96, 38 88, 40 80 Z" stroke="#C5A059" strokeWidth="1.2" />
            <path d="M70 155 C88 145, 98 158, 86 172 C72 174, 65 164, 70 155 Z" stroke="#C5A059" strokeWidth="1.2" />
            <path d="M20 520 C75 560, 45 640, 105 690 C140 725, 85 790, 130 850" stroke="#C5A059" strokeWidth="1.6" />
            <path d="M55 585 C72 572, 85 584, 75 598 C60 600, 50 593, 55 585 Z" stroke="#C5A059" strokeWidth="1.2" />
            <path d="M95 735 C112 722, 125 734, 115 748 C100 750, 90 742, 95 735 Z" stroke="#C5A059" strokeWidth="1.2" />
          </svg>
        </motion.div>

        {/* Puerta derecha del sobre con enredaderas doradas */}
        <motion.div
          initial={false}
          animate={isOpened ? { x: '102%', opacity: 0 } : { x: '0%', opacity: 1 }}
          transition={{ duration: 0.72, ease: [0.4, 0, 0.2, 1] }}
          className={`absolute inset-y-0 right-0 w-1/2 z-20 bg-ivory-50 border-l border-outline shadow-lg overflow-hidden ${isOpened ? 'pointer-events-none' : ''
            }`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 200 884" className="w-full h-full opacity-45" fill="none" preserveAspectRatio="none">
            <path d="M190 70 C135 120, 165 200, 105 260 C70 295, 125 365, 80 420" stroke="#C5A059" strokeWidth="1.6" />
            <path d="M150 115 C135 103, 122 114, 132 128 C146 130, 154 122, 150 115 Z" stroke="#C5A059" strokeWidth="1.2" />
            <path d="M180 540 C125 585, 155 660, 95 715 C65 745, 115 805, 70 860" stroke="#C5A059" strokeWidth="1.6" />
            <path d="M135 615 C120 602, 106 614, 116 628 C130 630, 140 622, 135 615 Z" stroke="#C5A059" strokeWidth="1.2" />
          </svg>
        </motion.div>

        {/* Sello de lacre rojo interactivo */}
        <AnimatePresence>
          {!isOpened && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 px-6 pointer-events-none"
            >
              <div className="flex flex-col items-center text-center bg-ivory-50/95 border border-outline-variant rounded-2xl px-7 py-4 shadow-sm max-w-xs w-full">
                <ResilientImage
                  src={IMAGES.crown}
                  alt="Corona real dorada"
                  loading="eager"
                  className="w-12 h-8 object-contain mb-1 drop-shadow-[0_2px_4px_rgba(150,113,44,0.25)]"
                />
                <span className="font-label text-[11px] leading-4 tracking-[1.5px] font-semibold text-crimson uppercase">
                  {WEDDING_DETAILS.envelopeEyebrow}
                </span>
                <p className="font-display text-[38px] leading-11.5 text-ink mt-0.5">
                  {WEDDING_DETAILS.coupleNames}
                </p>
                <span className="font-body text-[11px] tracking-[0.6px] text-ink-muted mt-1">
                  {WEDDING_DETAILS.dateFormatted}
                </span>
              </div>

              <motion.button
                type="button"
                onClick={onOpenEnvelope}
                aria-label="Abrir sobre con música"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                className="pointer-events-auto relative flex items-center justify-center w-36 h-36 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-4 focus-visible:ring-offset-ivory-100 cursor-pointer group"
              >
                <span className="seal-halo absolute -inset-1.5 rounded-full border-2 border-gold-light pointer-events-none" />
                <span className="seal-pulse relative flex items-center justify-center w-32 h-32 rounded-full overflow-hidden border-2 border-gold shadow-[0_10px_24px_rgba(150,113,44,0.34)] bg-ivory-50 p-1">
                  <ResilientImage
                    src={IMAGES.waxSeal}
                    alt="Sello de lacre dorado con rosa"
                    fallbackLabel={WEDDING_DETAILS.monogram}
                    loading="eager"
                    className="w-full h-full object-contain"
                  />
                </span>
              </motion.button>

              <div className="flex flex-col items-center gap-2.5">
                <motion.button
                  type="button"
                  onClick={onOpenEnvelope}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="pointer-events-auto btn-ivory min-h-11 inline-flex items-center justify-center gap-2 rounded-xl px-5 sm:px-6 py-2.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark cursor-pointer"
                >
                  <span className="font-label text-[11px] sm:text-[12px] leading-4 tracking-[1px] sm:tracking-[1.2px] font-semibold text-ink uppercase whitespace-nowrap">
                    Toca el sello para abrir
                  </span>
                </motion.button>

                <button
                  type="button"
                  onClick={onEnterSilent}
                  className="pointer-events-auto inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg font-label text-[11px] tracking-[0.8px] uppercase text-ink-muted hover:text-ink transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark"
                >
                  <VolumeX className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Ingresar sin música</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
