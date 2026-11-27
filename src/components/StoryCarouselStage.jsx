import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { getCircularOffset } from '../utils/weddingLogic.js';
import { ResilientImage } from './ResilientImage.jsx';

const CARD_SPRING = { type: 'spring', stiffness: 260, damping: 28, mass: 0.9 };

function getCardPose(offset, dragPx = 0) {
  const dragShift = offset === 0 ? dragPx * 0.45 : dragPx * 0.25;
  if (offset === 0) {
    return {
      x: `calc(0% + ${dragShift}px)`,
      scale: 1,
      opacity: 1,
      rotate: dragPx * 0.04,
      zIndex: 30,
    };
  }
  if (offset === -1 || offset === 1) {
    return {
      x: `calc(${offset * 58}% + ${dragShift}px)`,
      scale: 0.82,
      opacity: 0.72,
      rotate: offset * 5,
      zIndex: 20,
    };
  }
  const dir = offset > 0 ? 1 : -1;
  return {
    x: `${dir * 108}%`,
    scale: 0.68,
    opacity: 0,
    rotate: dir * 9,
    zIndex: 10,
  };
}

export function StoryCarouselStage({
  photos,
  activeIndex,
  direction,
  dragOffset,
  onStep,
  onCardClick,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) {
  const total = photos.length;
  const hasMultiple = total > 1;
  const activePhoto = photos[activeIndex];

  return (
    <div
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label={`Fotografía ${activeIndex + 1} de ${total}: ${activePhoto.caption}`}
      className="relative w-full h-60 sm:h-68 flex items-center justify-center overflow-hidden select-none touch-pan-y cursor-grab active:cursor-grabbing rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute w-48 h-48 rounded-full bg-gold/14 blur-2xl"
      />

      {/* Fundidos laterales suaves para que las fotos vecinas se integren con la tarjeta */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-7 sm:w-10 z-25 bg-linear-to-r from-surface-container via-surface-container/50 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-7 sm:w-10 z-25 bg-linear-to-l from-surface-container via-surface-container/50 to-transparent"
      />

      {photos.map((photo, idx) => {
        const offset = getCircularOffset(idx, activeIndex, total);
        if (Math.abs(offset) > 2) return null;

        const isCenter = offset === 0;
        const isInteractive = Math.abs(offset) <= 1;
        const pose = getCardPose(offset, dragOffset);

        return (
          <motion.button
            key={photo.id}
            type="button"
            initial={{
              opacity: 0,
              scale: 0.84,
              x: `${(offset === 0 ? direction : offset > 0 ? 1 : -1) * 58}%`,
            }}
            animate={pose}
            transition={dragOffset !== 0 ? { duration: 0.05 } : CARD_SPRING}
            whileHover={
              isCenter
                ? { scale: 1.025 }
                : isInteractive
                  ? { scale: 0.85, opacity: 0.88 }
                  : undefined
            }
            whileTap={isInteractive ? { scale: isCenter ? 0.98 : 0.8 } : undefined}
            onClick={() => onCardClick(idx, offset)}
            tabIndex={isInteractive ? 0 : -1}
            aria-hidden={!isInteractive}
            aria-label={
              isCenter
                ? `Ampliar foto ${idx + 1} de ${total}: ${photo.caption}`
                : `Mostrar foto ${idx + 1} de ${total}: ${photo.caption}`
            }
            className={`group absolute w-42 h-54 sm:w-48 sm:h-62 rounded-2xl overflow-hidden bg-royal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark ${isInteractive ? 'cursor-pointer' : 'pointer-events-none'
              } ${isCenter
                ? 'border-2 border-gold shadow-[0_18px_36px_-10px_rgba(12,26,56,0.48)]'
                : 'border border-gold/55 shadow-md'
              }`}
          >
            <ResilientImage
              src={photo.src}
              alt={photo.alt}
              loading={isInteractive ? 'eager' : 'lazy'}
              draggable={false}
              style={{ objectPosition: photo.position || '50% 35%' }}
              className={`w-full h-full object-cover transition-[filter] duration-300 ${isCenter ? 'brightness-100' : 'brightness-80 group-hover:brightness-95'
                }`}
            />

            {isCenter && (
              <>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-royal-950/70 via-royal-950/20 to-transparent"
                />
                <span className="pointer-events-none absolute bottom-2.5 left-2.5 rounded-full bg-royal-950/70 backdrop-blur-xs border border-gold/50 px-2.5 py-0.5 font-label text-[10px] tracking-[1px] text-champagne tabular-nums">
                  {idx + 1} / {total}
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-royal-950/70 backdrop-blur-xs border border-gold/50 text-champagne flex items-center justify-center opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </>
            )}
          </motion.button>
        );
      })}

      {hasMultiple && (
        <>
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={(event) => {
              event.stopPropagation();
              onStep(-1);
            }}
            aria-label="Foto anterior"
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gold/70 bg-royal-900/90 backdrop-blur-xs flex items-center justify-center text-champagne shadow-md hover:bg-royal-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={(event) => {
              event.stopPropagation();
              onStep(1);
            }}
            aria-label="Siguiente foto"
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gold/70 bg-royal-900/90 backdrop-blur-xs flex items-center justify-center text-champagne shadow-md hover:bg-royal-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </motion.button>
        </>
      )}
    </div>
  );
}
