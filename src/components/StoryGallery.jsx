import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_PHOTOS } from '../data/weddingData.js';
import { wrapGalleryIndex } from '../utils/weddingLogic.js';
import { ResilientImage } from './ResilientImage.jsx';
import { LightboxModal } from './LightboxModal.jsx';

export function StoryGallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const hasPhotos = GALLERY_PHOTOS.length > 0;

  const openLightboxAt = (index) => {
    if (!hasPhotos) return;
    setActiveIndex(wrapGalleryIndex(index, 0, GALLERY_PHOTOS.length));
    setLightboxOpen(true);
  };

  const stepPhoto = useCallback((delta) => {
    setActiveIndex((prev) => wrapGalleryIndex(prev, delta, GALLERY_PHOTOS.length));
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const activePhoto = hasPhotos
    ? GALLERY_PHOTOS[wrapGalleryIndex(activeIndex, 0, GALLERY_PHOTOS.length)]
    : null;

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 26, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Nuestra Historia"
        className="enchanted-card md:col-span-7 w-full bg-surface-container border border-outline rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col items-center justify-between gap-4"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="font-headline text-[16px] sm:text-[17px] leading-5.5 tracking-[1px] font-semibold text-ink">
            Nuestra Historia
          </h3>
          <p className="font-body text-[12px] text-ink-muted">
            {hasPhotos
              ? 'Toca cualquier fotografía para abrir el álbum'
              : 'Muy pronto compartiremos nuestro álbum de fotos'}
          </p>
        </div>

        {!hasPhotos ? (
          <div className="w-full rounded-xl border border-dashed border-outline bg-ivory-50/80 p-6 flex flex-col items-center gap-2 text-center">
            <Camera className="w-7 h-7 text-primary" aria-hidden="true" />
            <p className="font-body text-[13px] leading-5 text-ink-muted">
              Estamos preparando las fotografías oficiales de nuestra historia.
            </p>
          </div>
        ) : (
          <>
            <div className="w-full flex items-center gap-2 sm:gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => stepPhoto(-1)}
                aria-label="Foto anterior"
                className="w-11 h-11 rounded-full border border-outline-variant bg-ivory-50 flex items-center justify-center text-ink shrink-0 hover:bg-ivory-200 hover:border-gold-dark transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </motion.button>

              <div className="flex-1 grid grid-cols-3 gap-2.5 sm:gap-3">
                {GALLERY_PHOTOS.map((photo, idx) => {
                  const isSelected = idx === activeIndex;
                  return (
                    <motion.button
                      key={photo.id}
                      type="button"
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                      onClick={() => openLightboxAt(idx)}
                      aria-label={`Ampliar foto: ${photo.caption}`}
                      className={`rounded-xl overflow-hidden border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark ${isSelected
                        ? 'border-gold-dark ring-2 ring-gold/60 shadow-sm'
                        : 'border-gold-light opacity-90 hover:opacity-100'
                        }`}
                    >
                      <ResilientImage
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-24 sm:h-28 object-cover"
                      />
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => stepPhoto(1)}
                aria-label="Siguiente foto"
                className="w-11 h-11 rounded-full border border-outline-variant bg-ivory-50 flex items-center justify-center text-ink shrink-0 hover:bg-ivory-200 hover:border-gold-dark transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </motion.button>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activePhoto.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="font-body text-[13px] text-ink-muted text-center"
                >
                  {activePhoto.caption}
                </motion.p>
              </AnimatePresence>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => openLightboxAt(activeIndex)}
                className="min-h-11 px-4 font-label text-[12px] tracking-[0.8px] uppercase font-semibold text-crimson underline underline-offset-4 hover:text-ink transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark rounded-lg"
              >
                Ver Álbum Completo
              </motion.button>
            </div>
          </>
        )}
      </motion.section>

      {hasPhotos && (
        <LightboxModal
          isOpen={lightboxOpen}
          photos={GALLERY_PHOTOS}
          activeIndex={activeIndex}
          onClose={closeLightbox}
          onStep={stepPhoto}
        />
      )}
    </>
  );
}
