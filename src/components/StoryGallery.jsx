import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Camera, Pause, Play } from 'lucide-react';
import { GALLERY_PHOTOS } from '../data/weddingData.js';
import { getCircularOffset, wrapGalleryIndex } from '../utils/weddingLogic.js';
import { ResilientImage } from './ResilientImage.jsx';
import { StoryCarouselStage } from './StoryCarouselStage.jsx';
import { LightboxModal } from './LightboxModal.jsx';

const AUTOPLAY_MS = 4200;
const SWIPE_THRESHOLD_PX = 42;

export function StoryGallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);

  const sectionRef = useRef(null);
  const pointerStartRef = useRef(null);
  const didSwipeRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const total = GALLERY_PHOTOS.length;
  const hasPhotos = total > 0;
  const hasMultiple = total > 1;
  const safeIndex = hasPhotos ? wrapGalleryIndex(activeIndex, 0, total) : 0;
  const activePhoto = hasPhotos ? GALLERY_PHOTOS[safeIndex] : null;

  const isAutoPlaying =
    hasMultiple &&
    isInView &&
    !isHovered &&
    !isFocusWithin &&
    !isUserPaused &&
    isPageVisible &&
    !lightboxOpen &&
    dragOffset === 0 &&
    !prefersReducedMotion;

  const stepPhoto = useCallback(
    (delta) => {
      if (!hasMultiple) return;
      setDirection(delta >= 0 ? 1 : -1);
      setActiveIndex((prev) => wrapGalleryIndex(prev, delta, total));
    },
    [hasMultiple, total]
  );

  const goToIndex = useCallback(
    (targetIdx) => {
      if (!hasPhotos) return;
      const wrapped = wrapGalleryIndex(targetIdx, 0, total);
      const shortest = getCircularOffset(wrapped, safeIndex, total);
      if (shortest !== 0) {
        setDirection(shortest > 0 ? 1 : -1);
      }
      setActiveIndex(wrapped);
    },
    [hasPhotos, safeIndex, total]
  );

  const openLightboxAt = useCallback(
    (index) => {
      if (!hasPhotos) return;
      setActiveIndex(wrapGalleryIndex(index, 0, total));
      setLightboxOpen(true);
    },
    [hasPhotos, total]
  );

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  // Auto-avance inteligente: solo corre cuando la sección está visible en pantalla
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Pausa automática si el invitado cambia de pestaña o bloquea el celular
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const handleVisibility = () => {
      setIsPageVisible(document.visibilityState !== 'hidden');
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Temporizador de auto-avance con reinicio limpio tras cada interacción manual
  useEffect(() => {
    if (!isAutoPlaying) return undefined;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => wrapGalleryIndex(prev, 1, total));
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying, safeIndex, total]);

  const handlePointerDown = (event) => {
    if (!hasMultiple || (event.pointerType === 'mouse' && event.button !== 0)) return;
    didSwipeRef.current = false;
    pointerStartRef.current = { x: event.clientX, y: event.clientY, locked: null };
  };

  const handlePointerMove = (event) => {
    const start = pointerStartRef.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    if (!start.locked && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      start.locked = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
    }
    if (start.locked === 'x') {
      if (Math.abs(dx) > 10) didSwipeRef.current = true;
      setDragOffset(Math.max(-56, Math.min(56, dx)));
    }
  };

  const finishPointerDrag = (event) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;

    const dx = event.clientX - start.x;
    setDragOffset(0);
    if (start.locked === 'x' && Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
      didSwipeRef.current = true;
      stepPhoto(dx < 0 ? 1 : -1);
    }
  };

  const handleCardClick = (idx, offset) => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }
    if (offset === 0) {
      openLightboxAt(idx);
    } else {
      goToIndex(idx);
    }
  };

  const handleStageKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stepPhoto(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      stepPhoto(1);
    }
  };

  return (
    <>
      <motion.section
        ref={sectionRef}
        initial={{ opacity: 0, y: 26, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Nuestra Historia"
        aria-roledescription="carousel"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocusCapture={() => setIsFocusWithin(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsFocusWithin(false);
          }
        }}
        className="enchanted-card md:col-span-7 w-full bg-surface-container border border-outline rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-between gap-3.5 overflow-hidden"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-royal-900 via-gold to-royal-900"
        />

        <div className="w-full flex items-center justify-between gap-2 pt-1">
          <div className="w-9 sm:w-12 shrink-0" aria-hidden="true" />
          <div className="flex flex-col items-center gap-0.5 text-center">
            <h3 className="font-headline text-[16px] sm:text-[17px] leading-5.5 tracking-[1px] font-semibold text-royal-900">
              Nuestra Historia
            </h3>
            <p className="font-body text-[12px] text-ink-muted">
              {hasPhotos
                ? 'Desliza o toca una foto para abrir el álbum'
                : 'Muy pronto compartiremos nuestro álbum de fotos'}
            </p>
          </div>

          <div className="flex items-center justify-end w-9 sm:w-12 shrink-0">
            {hasMultiple && (
              <button
                type="button"
                onClick={() => setIsUserPaused((prev) => !prev)}
                aria-pressed={isUserPaused}
                aria-label={isUserPaused ? 'Reanudar pase automático' : 'Pausar pase automático'}
                className="w-8 h-8 rounded-full border border-gold/60 bg-ivory-50/90 text-royal-900 flex items-center justify-center hover:border-gold-dark hover:bg-champagne/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark"
              >
                {isUserPaused ? (
                  <Play className="w-3.5 h-3.5 translate-x-px" aria-hidden="true" />
                ) : (
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
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
            <StoryCarouselStage
              photos={GALLERY_PHOTOS}
              activeIndex={safeIndex}
              direction={direction}
              dragOffset={dragOffset}
              onStep={stepPhoto}
              onCardClick={handleCardClick}
              onKeyDown={handleStageKeyDown}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishPointerDrag}
            />

            {hasMultiple && (
              <div
                aria-hidden="true"
                className="w-full max-w-md h-0.5 rounded-full bg-gold/25 overflow-hidden"
              >
                {isAutoPlaying ? (
                  <motion.span
                    key={`progress-${safeIndex}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                    className="block h-full w-full origin-left bg-linear-to-r from-gold-dark via-gold to-crimson"
                  />
                ) : (
                  <span
                    className="block h-full origin-left bg-gold/65 transition-[width] duration-300"
                    style={{ width: `${((safeIndex + 1) / total) * 100}%` }}
                  />
                )}
              </div>
            )}

            {hasMultiple && (
              <div
                role="tablist"
                aria-label="Seleccionar fotografía de nuestra historia"
                style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
                className="w-full max-w-md grid gap-1.5 sm:gap-2"
              >
                {GALLERY_PHOTOS.map((photo, idx) => {
                  const isSelected = idx === safeIndex;
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      aria-label={`Ver foto ${idx + 1} de ${total}`}
                      onClick={() => goToIndex(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark ${isSelected
                        ? 'scale-105 border-2 border-gold-dark ring-2 ring-gold/45 opacity-100 shadow-xs'
                        : 'border border-gold-light/80 opacity-60 hover:opacity-100'
                        }`}
                    >
                      <ResilientImage
                        src={photo.src}
                        alt=""
                        draggable={false}
                        style={{ objectPosition: photo.position || '50% 30%' }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col items-center gap-1">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activePhoto.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22 }}
                  className="font-body text-[13px] leading-5 text-ink-muted text-center"
                >
                  {activePhoto.caption}
                </motion.p>
              </AnimatePresence>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => openLightboxAt(safeIndex)}
                className="min-h-11 px-4 font-label text-[12px] tracking-[0.8px] uppercase font-semibold text-crimson underline underline-offset-4 hover:text-royal-900 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark rounded-lg"
              >
                Ver Álbum Completo ({total})
              </motion.button>
            </div>
          </>
        )}
      </motion.section>

      {hasPhotos && (
        <LightboxModal
          isOpen={lightboxOpen}
          photos={GALLERY_PHOTOS}
          activeIndex={safeIndex}
          direction={direction}
          onClose={closeLightbox}
          onStep={stepPhoto}
        />
      )}
    </>
  );
}
