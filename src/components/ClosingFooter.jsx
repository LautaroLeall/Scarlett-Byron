import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ExternalLink, RotateCcw, Share2 } from 'lucide-react';
import { IMAGES, WEDDING_DETAILS } from '../data/weddingData.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { ResilientImage } from './ResilientImage.jsx';

export function ClosingFooter({ onShowEnvelope }) {
  const { developer } = WEDDING_DETAILS;
  const [linkCopied, setLinkCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleShare = async () => {
    const shareUrl = window.location.origin + window.location.pathname;

    if (navigator.share) {
      try {
        await navigator.share({
          title: WEDDING_DETAILS.seo.ogTitle,
          text: WEDDING_DETAILS.seo.ogDescription,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback al portapapeles si el usuario cancela o Web Share no está disponible
      }
    }

    const ok = await copyToClipboard(shareUrl);
    if (!ok) return;
    setLinkCopied(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setLinkCopied(false);
      timerRef.current = null;
    }, 2400);
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 'some' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="w-full flex flex-col gap-6 pt-8 border-t border-outline-variant"
    >
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center sm:items-start gap-1.5 text-center sm:text-left">
          <p className="font-display text-[30px] sm:text-[36px] leading-10 text-ink text-pretty">
            {WEDDING_DETAILS.closingQuote}
          </p>
          <p className="font-headline text-[11px] tracking-[1.4px] uppercase text-gold-dark">
            {WEDDING_DETAILS.coupleNames} · {WEDDING_DETAILS.dateFormatted}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 shrink-0">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleShare}
              className="btn-gold min-h-11 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-label text-[11px] tracking-[0.9px] font-semibold uppercase cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark"
            >
              {linkCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success shrink-0" aria-hidden="true" />
                  <span>¡Enlace copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Compartir</span>
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={onShowEnvelope}
              className="btn-ivory min-h-11 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-label text-[11px] tracking-[0.9px] font-semibold uppercase cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark"
            >
              <RotateCcw className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
              <span>Volver al sobre</span>
            </motion.button>
          </div>

          <ResilientImage
            src={IMAGES.enchantedRose}
            alt="Rosa encantada en su cúpula"
            className="w-18 h-26 object-contain shrink-0 mix-blend-multiply brightness-[1.06] contrast-[1.08] mask-[radial-gradient(ellipse_78%_82%_at_50%_50%,#000_64%,transparent_100%)]"
          />
        </div>
      </div>

      {/* Firma del desarrollador */}
      {developer?.url && (
        <div className="w-full pt-4 border-t border-outline-variant/60 flex items-center justify-center text-center">
          <p className="font-body text-[12px] leading-5 text-ink-muted inline-flex flex-wrap items-center justify-center gap-1">
            <span>{developer.label}</span>
            <a
              href={developer.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visitar el portafolio de ${developer.name}`}
              className="inline-flex items-center gap-1 min-h-9 px-1.5 font-headline text-[12px] tracking-[0.8px] font-semibold text-gold-dark hover:text-crimson underline decoration-outline-variant underline-offset-4 hover:decoration-crimson transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark rounded"
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
