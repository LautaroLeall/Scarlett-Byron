import { motion } from 'framer-motion';
import { ExternalLink, RotateCcw } from 'lucide-react';
import { IMAGES, WEDDING_DETAILS } from '../data/weddingData.js';
import { ResilientImage } from './ResilientImage.jsx';
import { CornerRoses, StarlightField } from './RoyalOrnaments.jsx';

export function ClosingFooter({ onShowEnvelope }) {
  const { developer } = WEDDING_DETAILS;

  return (
    <motion.footer
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 'some' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full rounded-3xl overflow-hidden bg-linear-to-b from-royal-900 via-royal-950 to-royal-950 border-2 border-gold/65 px-5 sm:px-8 py-7 sm:py-9 shadow-[0_18px_40px_-14px_rgba(4,9,24,0.65)] flex flex-col gap-6"
    >
      <StarlightField />
      <CornerRoses position="tl" className="w-24 sm:w-32 opacity-70" />
      <CornerRoses position="br" className="w-24 sm:w-32 opacity-70" />

      <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center sm:items-start gap-1.5 text-center sm:text-left">
          <p className="font-display text-[32px] sm:text-[38px] leading-10 text-ivory-50 text-pretty drop-shadow-[0_2px_10px_rgba(5,11,28,0.7)]">
            {WEDDING_DETAILS.closingQuote}
          </p>
          <p className="font-headline text-[11px] tracking-[1.6px] uppercase text-champagne">
            {WEDDING_DETAILS.coupleNames} · {WEDDING_DETAILS.dateFormatted}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={onShowEnvelope}
            className="btn-gold min-h-11 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-label text-[11px] tracking-[0.9px] font-semibold uppercase cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Volver al sobre</span>
          </motion.button>

          <div className="w-18 h-24 rounded-2xl bg-ivory-50/95 p-1.5 border border-gold/70 shadow-md flex items-center justify-center shrink-0">
            <ResilientImage
              src={IMAGES.enchantedRose}
              alt="Rosa encantada en su cúpula"
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
        </div>
      </div>

      {/* Firma del desarrollador */}
      {developer?.url && (
        <div className="relative z-10 w-full pt-4 border-t border-gold/25 flex items-center justify-center text-center">
          <p className="font-body text-[12px] leading-5 text-royal-200 inline-flex flex-wrap items-center justify-center gap-1">
            <span>{developer.label}</span>
            <a
              href={developer.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visitar el portafolio de ${developer.name}`}
              className="inline-flex items-center gap-1 min-h-9 px-1.5 font-headline text-[12px] tracking-[0.8px] font-semibold text-champagne hover:text-ivory-50 underline decoration-gold/55 underline-offset-4 hover:decoration-champagne transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light rounded"
            >
              <span>{developer.name}</span>
              <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
            </a>
          </p>
        </div>
      )}
    </motion.footer>
  );
}
