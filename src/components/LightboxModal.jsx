import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ResilientImage } from './ResilientImage.jsx';

export function LightboxModal({ isOpen, photos, activeIndex, onClose, onStep }) {
  const closeBtnRef = useRef(null);
  const touchStartXRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft') {
        onStep(-1);
      } else if (event.key === 'ArrowRight') {
        onStep(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
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
      if (Math.abs(delta) >= 45) {
        onStep(delta < 0 ? 1 : -1);
      }
    }
    touchStartXRef.current = null;
  };

  const activePhoto = photos[activeIndex];

  return (
    <AnimatePresence>
      {isOpen && activePhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6 gap-4"
          role="dialog"
          aria-modal="true"
          aria-label="Visor de álbum"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-xl flex flex-col items-center gap-4"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-full flex items-center justify-between text-ivory-50">
              <span className="font-label text-[12px] tracking-[1px] uppercase tabular-nums">
                {activeIndex + 1} / {photos.length}
              </span>
              <motion.button
                ref={closeBtnRef}
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                aria-label="Cerrar visor"
                className="w-11 h-11 rounded-full bg-ivory-50 text-ink flex items-center justify-center hover:bg-ivory-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </motion.button>
            </div>

            <div className="relative w-full flex items-center justify-center gap-2 sm:gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onStep(-1)}
                aria-label="Foto anterior"
                className="w-11 h-11 rounded-full bg-ivory-50/90 text-ink flex items-center justify-center shrink-0 hover:bg-ivory-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </motion.button>

              <div className="flex-1 overflow-hidden rounded-2xl border-2 border-gold shadow-2xl bg-ink">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePhoto.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.22 }}
                  >
                    <ResilientImage
                      src={activePhoto.src}
                      alt={activePhoto.alt}
                      loading="eager"
                      className="w-full max-h-[65vh] object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onStep(1)}
                aria-label="Siguiente foto"
                className="w-11 h-11 rounded-full bg-ivory-50/90 text-ink flex items-center justify-center shrink-0 hover:bg-ivory-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </motion.button>
            </div>

            <p className="font-body text-[14px] leading-5.5 text-ivory-50 text-center max-w-md">
              {activePhoto.caption}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
