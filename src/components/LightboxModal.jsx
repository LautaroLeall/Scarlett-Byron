import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ResilientImage } from './ResilientImage.jsx';

const CALM_EASE = [0.22, 1, 0.36, 1];

const stop = (event) => event.stopPropagation();

export function LightboxModal({ isOpen, photos, activeIndex, onClose, onStep }) {
  const closeBtnRef = useRef(null);
  const touchStartXRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    // Bloqueo total de scroll (rueda, táctil, teclado y barra) mientras el visor está abierto
    const html = document.documentElement;
    const body = document.body;
    const lockedScrollY = window.scrollY;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    closeBtnRef.current?.focus({ preventScroll: true });

    const preventScroll = (event) => {
      event.preventDefault();
    };

    const lockScrollPosition = () => {
      if (window.scrollY !== lockedScrollY) {
        window.scrollTo({ top: lockedScrollY, behavior: 'instant' });
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft') {
        onStep(-1);
      } else if (event.key === 'ArrowRight') {
        onStep(1);
      } else if (
        [' ', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('scroll', lockScrollPosition, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('scroll', lockScrollPosition);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onStep]);

  const handleTouchStart = (event) => {
    touchStartXRef.current = event.touches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartXRef.current === null) return;
    const endX = event.changedTouches?.[0]?.clientX;
    if (typeof endX === 'number') {
      const delta = endX - touchStartXRef.current;
      if (Math.abs(delta) >= 45) onStep(delta < 0 ? 1 : -1);
    }
    touchStartXRef.current = null;
  };

  if (typeof document === 'undefined') return null;

  const activePhoto = photos[activeIndex];
  const hasMultiple = photos.length > 1;

  // Portal a <body>: evita que los transforms de las secciones rompan el `fixed`
  // y que se filtren encabezado, botones flotantes u otros componentes por encima.
  return createPortal(
    <AnimatePresence>
      {isOpen && activePhoto && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          role="dialog"
          aria-modal="true"
          aria-label="Visor de fotos"
          onClick={onClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onWheel={stop}
          className="fixed inset-0 z-100 h-dvh w-full overflow-hidden overscroll-none touch-none select-none bg-royal-950/95 backdrop-blur-md flex items-center justify-center px-3 py-6 sm:px-6"
        >
          {/* Botón cerrar */}
          <motion.button
            ref={closeBtnRef}
            type="button"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            aria-label="Cerrar visor"
            className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 sm:right-6 z-20 w-11 h-11 rounded-full bg-ivory-50/95 border border-gold/70 text-royal-900 flex items-center justify-center shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </motion.button>

          {/* Flecha anterior */}
          {hasMultiple && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={(event) => {
                event.stopPropagation();
                onStep(-1);
              }}
              aria-label="Foto anterior"
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-royal-900/85 border border-gold/60 text-champagne flex items-center justify-center shadow-lg cursor-pointer hover:bg-royal-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            </motion.button>
          )}

          {/* Flecha siguiente */}
          {hasMultiple && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={(event) => {
                event.stopPropagation();
                onStep(1);
              }}
              aria-label="Siguiente foto"
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-royal-900/85 border border-gold/60 text-champagne flex items-center justify-center shadow-lg cursor-pointer hover:bg-royal-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            </motion.button>
          )}

          {/* Foto + mensaje corto (solo la foto detiene el clic; el resto del fondo cierra) */}
          <div className="relative z-10 flex flex-col items-center gap-4 max-w-[min(88vw,46rem)] pointer-events-none">
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={activePhoto.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.38, ease: CALM_EASE }}
                className="flex flex-col items-center gap-4"
              >
                <div
                  onClick={stop}
                  className="pointer-events-auto rounded-2xl overflow-hidden border-2 border-gold/80 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.75)] bg-royal-900"
                >
                  <ResilientImage
                    src={activePhoto.src}
                    alt={activePhoto.alt}
                    loading="eager"
                    className="block w-auto h-auto max-w-[min(80vw,44rem)] max-h-[68dvh] object-contain"
                  />
                </div>

                <figcaption className="flex flex-col items-center gap-1.5 text-center px-2">
                  <span aria-hidden="true" className="h-px w-16 bg-linear-to-r from-transparent via-gold-light to-transparent" />
                  <p className="font-display text-[22px] sm:text-[26px] leading-7 sm:leading-8 text-champagne drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                    {activePhoto.caption}
                  </p>
                  {hasMultiple && (
                    <span className="font-label text-[10.5px] tracking-[1.6px] uppercase text-royal-200/80 tabular-nums">
                      {activeIndex + 1} / {photos.length}
                    </span>
                  )}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
